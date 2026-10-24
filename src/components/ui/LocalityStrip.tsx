import React from "react";
import { MapPin } from "lucide-react";

export function LocalityStrip() {
  const hubs = [
    { city: "Bengaluru", areas: ["Indiranagar", "Koramangala", "HSR Layout", "Bellandur"] },
    { city: "Mumbai", areas: ["Bandra West", "Powai", "Andheri", "Lower Parel"] },
    { city: "Delhi NCR", areas: ["Cyber City", "Golf Course Rd", "Hauz Khas", "Noida 62"] },
  ];

  return (
    <div className="border-y border-border/80 bg-white/60 backdrop-blur-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-forest animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
            Active Flatmate Corridors
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
          {hubs.map((hub) => (
            <div
              key={hub.city}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ivory border border-border/80 text-muted"
            >
              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <strong className="text-charcoal font-medium">{hub.city}:</strong>
              <span className="truncate max-w-[200px] sm:max-w-none">
                {hub.areas.join(" · ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
