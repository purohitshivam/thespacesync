import React from "react";
import type { PeaceScoreResult } from "@/lib/peace-score";
import { AlertTriangle, CheckCircle2, HelpCircle, Info, Sparkles } from "lucide-react";

export function PeaceScoreBadge({
  result,
  size = "md",
}: {
  result: PeaceScoreResult;
  size?: "sm" | "md" | "lg";
}) {
  if (result.status === "incomplete_data" || result.overallScore === null) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand text-muted text-xs font-medium border border-border"
        title="More preference answers are needed to calculate a reliable Peace Score."
      >
        <HelpCircle className="w-3.5 h-3.5 text-terracotta" />
        <span>Incomplete Data ({result.answeredQuestionsCount}/{result.totalQuestionsCount})</span>
      </div>
    );
  }

  const score = result.overallScore;
  const colorClasses = result.hasDealbreakerConflict
    ? "bg-terracotta/15 text-terracotta-dark border-terracotta/40"
    : score >= 78
      ? "bg-forest text-ivory border-forest"
      : score >= 60
        ? "bg-sage/20 text-forest border-sage/40"
        : "bg-sand text-charcoal border-border";

  const sizeClasses =
    size === "lg"
      ? "px-4 py-2 text-base"
      : size === "sm"
        ? "px-2.5 py-1 text-xs"
        : "px-3.5 py-1.5 text-sm";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border font-medium ${colorClasses} ${sizeClasses}`}
    >
      <Sparkles className="w-3.5 h-3.5 shrink-0" />
      <span>Peace Score: {score}%</span>
      {result.hasDealbreakerConflict && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          Deal-breaker flag
        </span>
      )}
    </div>
  );
}

export function PeaceScoreBreakdownCard({
  result,
  isPremiumViewer = false,
}: {
  result: PeaceScoreResult;
  isPremiumViewer?: boolean;
}) {
  return (
    <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Deterministic Compatibility Estimate
          </span>
          <h3 className="font-serif text-2xl text-charcoal mt-1">Peace Score Breakdown</h3>
          <p className="text-xs text-muted mt-1">
            Data Completeness: <strong>{result.completenessLabel}</strong> ({result.answeredQuestionsCount} of{" "}
            {result.totalQuestionsCount} dimensions mutually answered —{" "}
            {result.completenessPercentage}%)
          </p>
        </div>
        <PeaceScoreBadge result={result} size="lg" />
      </div>

      {result.status === "incomplete_data" ? (
        <div className="p-5 rounded-2xl bg-ivory border border-border text-sm text-charcoal">
          <p className="font-medium mb-1">Insufficient overlapping answers to compute a score</p>
          <p className="text-muted text-xs leading-relaxed">
            SpaceSync never invents or guesses compatibility scores when preference answers are missing. Complete more questions in your profile or check back once both profiles have at least 4 mutually answered dimensions.
          </p>
        </div>
      ) : (
        <>
          {/* Deal-breaker alert if present */}
          {result.hasDealbreakerConflict && (
            <div className="p-4 rounded-2xl bg-terracotta/10 border border-terracotta/30 text-sm">
              <div className="flex items-center gap-2 font-semibold text-terracotta-dark mb-1">
                <AlertTriangle className="w-4 h-4" />
                Deal-Breaker Boundary Triggered
              </div>
              <p className="text-xs text-charcoal mb-2">
                Unpenalised weighted score was {result.unpenalisedScore}%, capped at {result.overallScore}% because one or more designated deal-breakers conflicted:
              </p>
              <ul className="space-y-1 text-xs text-charcoal list-disc list-inside">
                {result.dealbreakerConflicts.map((c) => (
                  <li key={c.questionKey}>
                    <strong>{c.questionLabel}:</strong> {c.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Category Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(result.categories).map((cat) => (
              <div key={cat.category} className="p-4 rounded-2xl bg-ivory border border-border">
                <div className="flex items-center justify-between text-xs text-muted mb-1">
                  <span>{cat.label}</span>
                  <span>{Math.round(cat.configuredWeight * 100)}% weight</span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-serif text-2xl font-semibold text-charcoal">
                    {cat.score !== null ? `${cat.score}%` : "N/A"}
                  </span>
                  <span className="text-[11px] text-muted">
                    {cat.answeredCount}/{cat.totalCount} answered
                  </span>
                </div>
                <div className="w-full h-2 bg-sand rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-forest rounded-full transition-all"
                    style={{ width: `${cat.score ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Similarities & Differences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-forest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Where You Align & Complement
              </h4>
              {result.similarities.length === 0 ? (
                <p className="text-xs text-muted">No strong alignments identified yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {result.similarities.map((dim) => (
                    <div key={dim.key} className="p-3.5 rounded-2xl bg-ivory/80 border border-border">
                      <div className="flex items-center justify-between text-xs font-semibold text-charcoal mb-1">
                        <span>{dim.label}</span>
                        <span className="text-forest">{dim.rawScore}% match</span>
                      </div>
                      <p className="text-xs text-muted">{dim.explanation}</p>
                      {isPremiumViewer && (
                        <div className="mt-2 pt-2 border-t border-border/70 flex flex-wrap justify-between gap-2 text-[11px] text-charcoal">
                          <span>You: {dim.userAValueLabel}</span>
                          <span>Them: {dim.userBValueLabel}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-terracotta-dark flex items-center gap-2">
                <Info className="w-4 h-4" />
                Topics to Discuss Together
              </h4>
              {result.differences.length === 0 ? (
                <p className="text-xs text-muted">
                  No major friction points detected across answered questions.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {result.differences.map((dim) => (
                    <div key={dim.key} className="p-3.5 rounded-2xl bg-ivory/80 border border-border">
                      <div className="flex items-center justify-between text-xs font-semibold text-charcoal mb-1">
                        <span>{dim.label}</span>
                        <span className="text-terracotta-dark">{dim.rawScore}%</span>
                      </div>
                      <p className="text-xs text-muted">{dim.explanation}</p>
                      {isPremiumViewer && (
                        <div className="mt-2 pt-2 border-t border-border/70 flex flex-wrap justify-between gap-2 text-[11px] text-charcoal">
                          <span>You: {dim.userAValueLabel}</span>
                          <span>Them: {dim.userBValueLabel}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <p className="text-[11px] text-muted pt-3 border-t border-border leading-relaxed">
        {result.disclaimer}
      </p>
    </div>
  );
}
