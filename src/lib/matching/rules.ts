import type { AccountStatus } from "@/types/database";

export interface MatchPairCanonical {
  userOneId: string;
  userTwoId: string;
}

/**
 * Enforces canonical lexicographical ordering of user UUID pairs
 * so (A, B) and (B, A) always map to the exact same match/conversation key.
 */
export function canonicaliseUserPair(userA: string, userB: string): MatchPairCanonical {
  if (!userA || !userB) {
    throw new Error("Both user IDs are required");
  }
  if (userA === userB) {
    throw new Error("Self-matching is not permitted");
  }
  return userA < userB
    ? { userOneId: userA, userTwoId: userB }
    : { userOneId: userB, userTwoId: userA };
}

export interface InteractionPermissionInput {
  actorUserId: string | null;
  targetUserId: string;
  actorAccountStatus: AccountStatus;
  targetAccountStatus: AccountStatus;
  targetIsPublished: boolean;
  isBlockedBetween: boolean;
}

export interface InteractionPermissionResult {
  allowed: boolean;
  reason?: string;
  httpStatus?: number;
}

/**
 * Deterministic server-side guard verifying whether `actorUserId` may express interest,
 * match, or communicate with `targetUserId`.
 */
export function verifyInteractionPermission(
  input: InteractionPermissionInput
): InteractionPermissionResult {
  if (!input.actorUserId) {
    return { allowed: false, reason: "Authentication required", httpStatus: 401 };
  }
  if (input.actorUserId === input.targetUserId) {
    return { allowed: false, reason: "Cannot interact with your own profile", httpStatus: 400 };
  }
  if (input.actorAccountStatus !== "active") {
    return {
      allowed: false,
      reason: "Your account is suspended or inactive and cannot match or message.",
      httpStatus: 403,
    };
  }
  if (input.isBlockedBetween) {
    return {
      allowed: false,
      reason: "Interaction is blocked between these accounts.",
      httpStatus: 403,
    };
  }
  if (input.targetAccountStatus !== "active" || !input.targetIsPublished) {
    return {
      allowed: false,
      reason: "Target profile is not eligible or published.",
      httpStatus: 403,
    };
  }

  return { allowed: true };
}

/**
 * Verifies whether `actorUserId` is an authorised participant in a conversation
 * and that the associated match is active and unblocked.
 */
export function verifyConversationAccess(params: {
  actorUserId: string | null;
  actorAccountStatus: AccountStatus;
  conversationUserOneId: string;
  conversationUserTwoId: string;
  matchStatus: string;
  isBlockedBetween: boolean;
}): InteractionPermissionResult {
  const {
    actorUserId,
    actorAccountStatus,
    conversationUserOneId,
    conversationUserTwoId,
    matchStatus,
    isBlockedBetween,
  } = params;

  if (!actorUserId) {
    return { allowed: false, reason: "Authentication required", httpStatus: 401 };
  }

  if (actorAccountStatus !== "active") {
    return {
      allowed: false,
      reason: "Suspended accounts cannot read or send messages.",
      httpStatus: 403,
    };
  }

  const isParticipant =
    actorUserId === conversationUserOneId || actorUserId === conversationUserTwoId;

  if (!isParticipant) {
    return {
      allowed: false,
      reason: "Unauthorised: You are not a participant in this conversation.",
      httpStatus: 403,
    };
  }

  if (isBlockedBetween) {
    return {
      allowed: false,
      reason: "Communication is disabled because a block exists between participants.",
      httpStatus: 403,
    };
  }

  if (matchStatus !== "active") {
    return {
      allowed: false,
      reason: "This connection is no longer active.",
      httpStatus: 403,
    };
  }

  return { allowed: true };
}
