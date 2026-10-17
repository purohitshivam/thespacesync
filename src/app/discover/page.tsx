import React from "react";
import { loadDiscoveryDashboardData } from "@/lib/discovery/loader";
import type { DiscoveryFilterParams } from "@/lib/discovery/filter";
import { DiscoveryClient } from "@/components/discovery/DiscoveryClient";

export const metadata = {
  title: "Discover Compatible Flatmates",
  description: "Explore published flatmate profiles in Bangalore, Mumbai, Delhi NCR, and beyond, ranked by your deterministic Peace Score.",
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const getStr = (key: string): string | undefined => {
    const val = sp[key];
    return typeof val === "string" ? val : undefined;
  };

  const filters: DiscoveryFilterParams = {
    city: getStr("city") || "all",
    area: getStr("area") || "",
    maxBudgetInr: getStr("maxBudget") ? Number(getStr("maxBudget")) : undefined,
    movingTimeline: getStr("timeline") || "all",
    sleepSchedule: getStr("sleep") || "all",
    cleanlinessLevel: getStr("cleanliness") || "all",
    smokingPreference: getStr("smoking") || "all",
    dietaryPreference: getStr("diet") || "all",
    petPreference: getStr("pets") || "all",
    workStudyRoutine: getStr("routine") || "all",
    guestsOvernight: getStr("guests") || "all",
    sortBy: getStr("sort") === "recent" ? "recent" : "peace_score",
    page: getStr("page") ? Math.max(1, Number(getStr("page"))) : 1,
    pageSize: 9,
  };

  const data = await loadDiscoveryDashboardData(filters);

  return <DiscoveryClient data={data} initialFilters={filters} />;
}
