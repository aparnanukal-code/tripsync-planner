import { motion } from "framer-motion";
import type { Itinerary } from "@/lib/tripsync/constants";
import { Sparkles, RefreshCw, CircleCheck as CheckCircle2, Target, Loader as Loader2 } from "lucide-react";

const tone = (s: number) => s >= 80 ? { bar: "bg-green-500", text: "text-green-600" } : s >= 60 ? { bar: "bg-amber-500", text: "text-amber-600" } : { bar: "bg-red-500", text: "text-red-600" };

export function HarmonyBars({ breakdown }: { breakdown: Itinerary["harmony_breakdown"] }) {
  const entries = Object.entries(breakdown);
  return (
    <div className="space-y-2">
      {entries.map(([id, m], i) => {
        const t = tone(m.score);
        return (
          <div key={id} className="flex items-center gap-3" title={m.tooltip}>
            <span className="w-16 truncate text-sm text-muted-foreground">{m.name}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div initial={{ width: 0 }} animate={{ width: `${m.score}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.15 }} className={`h-full rounded-full ${t.bar}`} />
            </div>
            <span className={`w-10 text-right text-xs font-bold ${t.text}`}>{m.score}%</span>
          </div>
        );
      })}
    </div>
  );
}

export function ItineraryPanel({
  itinerary, status, isOrganizer, generating, canGenerate, onGenerate, onRegenerate, onFinalize,
}: {
  itinerary: Itinerary | null;
  status: string;
  isOrganizer: boolean;
  generating: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onFinalize: () => void;
}) {
  if (!itinerary) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white p-8 text-center shadow-md">
        {generating ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium text-primary animate-pulse">✨ Building your itinerary…</p>
          </>
        ) : (
          <>
            <Target className="h-10 w-10 text-primary" strokeWidth={1.5} />
            <h3 className="mt-3 text-lg font-semibold">No itinerary yet</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">Once your group has voted on at least 3 activities, generate a fair plan with one click.</p>
            <button
              disabled={!canGenerate || generating}
              onClick={onGenerate}
              title={!canGenerate ? "Vote on at least 3 activities first" : ""}
              className="btn-primary mt-5 flex items-center justify-center gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" /> Generate Itinerary
            </button>
          </>
        )}
      </div>
    );
  }

  const t = tone(itinerary.harmony_score);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-md">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Group Harmony</h3>
          <span className={`ml-auto text-2xl font-extrabold ${t.text}`}>{itinerary.harmony_score}%</span>
        </div>
        <div className="mt-4">
          <HarmonyBars breakdown={itinerary.harmony_breakdown} />
        </div>
        {itinerary.optimization_summary && (
          <p className="mt-3 text-xs text-muted-foreground">{itinerary.optimization_summary}</p>
        )}
      </div>

      <div className="space-y-3">
        {itinerary.days.map((day) => (
          <div key={day.day} className="rounded-2xl border border-border bg-white p-4 shadow-md">
            <div className="mb-3 flex items-baseline gap-2">
              <h4 className="text-sm font-bold uppercase tracking-wide text-primary">Day {day.day}</h4>
              <span className="text-xs text-muted-foreground">{day.date}</span>
            </div>
            <ul className="space-y-3">
              {day.activities.map((a, i) => (
                <li key={i} className="flex gap-3 border-l-2 border-primary/30 pl-3">
                  <span className="w-12 shrink-0 text-xs font-semibold text-muted-foreground">{a.time}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold">{a.title}</span>
                      {a.source === "user_added" && <span className="rounded-md bg-primary-light px-1.5 py-0.5 text-[10px] font-medium text-primary">✦ Your pick</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{a.duration} · {a.cost_estimate} · {a.category}</p>
                    {a.reason && <p className="mt-1 text-xs italic text-muted-foreground">"{a.reason}"</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {status !== "finalized" && (
        <div className="flex gap-2">
          {isOrganizer && (
            <>
              <button onClick={onRegenerate} disabled={generating} className="btn-outline-purple flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} /> Regenerate
              </button>
              <button onClick={onFinalize} className="btn-primary flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Finalize Trip
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
