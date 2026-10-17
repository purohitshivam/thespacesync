"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
      <div className="w-12 h-12 rounded-2xl bg-terracotta/15 text-terracotta-dark flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h1 className="font-serif text-3xl text-charcoal">
        Something went wrong
      </h1>
      <p className="text-xs text-muted leading-relaxed max-w-md mx-auto">
        {error.message || "An unexpected error occurred while loading this screen."}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full border border-border bg-white text-charcoal text-xs font-medium"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
