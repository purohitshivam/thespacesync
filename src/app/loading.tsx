import React from "react";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-10 h-10 rounded-full border-2 border-sand border-t-forest animate-spin mx-auto" />
      <p className="font-serif text-base text-muted">Syncing your orbit...</p>
    </div>
  );
}
