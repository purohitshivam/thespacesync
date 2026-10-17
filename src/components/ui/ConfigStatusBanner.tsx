import React from "react";
import { AlertCircle } from "lucide-react";

export function ConfigStatusBanner({
  serviceName,
  missingVars,
  message,
}: {
  serviceName: string;
  missingVars: string[];
  message?: string;
}) {
  if (missingVars.length === 0) return null;

  return (
    <div
      role="status"
      data-testid="config-status-banner"
      className="bg-sand/90 border border-terracotta/40 rounded-2xl p-4 text-xs text-charcoal flex items-start gap-3"
    >
      <AlertCircle className="w-4 h-4 text-terracotta-dark shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-charcoal">
          {serviceName} Configuration Pending
        </p>
        <p className="text-muted leading-relaxed">
          {message ??
            `Live ${serviceName} operations require real credentials in your environment (.env.local). SpaceSync does not simulate writes or substitute mock data.`}
        </p>
        <p className="font-mono text-[11px] text-terracotta-dark">
          Missing environment variables: {missingVars.join(", ")}
        </p>
      </div>
    </div>
  );
}
