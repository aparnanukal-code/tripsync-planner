import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/tripsync/Header";
import { ItineraryPanel } from "@/components/tripsync/HarmonyAndItinerary";
import { BARCELONA_FALLBACK } from "@/lib/tripsync/constants";
import { MemberAvatar } from "@/components/tripsync/ActivityCard";

export const Route = createFileRoute("/demo")({
  component: Demo,
  head: () => ({ meta: [{ title: "Demo — TripSync AI" }] }),
});

const MEMBERS = ["Alex", "Sarah", "Priya", "Tom"];

function Demo() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Live demo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Barcelona Weekend</h1>
          <p className="text-sm text-muted-foreground">Barcelona, Spain · Sept 12 → 15 · Food + Nightlife</p>
          <div className="mt-4 flex -space-x-1.5">
            {MEMBERS.map((m, i) => <MemberAvatar key={m} name={m} idx={i} />)}
          </div>
        </div>

        <div className="mt-6">
          <ItineraryPanel
            itinerary={BARCELONA_FALLBACK}
            status="itinerary_generated"
            isOrganizer={false}
            generating={false}
            canGenerate
            onGenerate={() => {}}
            onRegenerate={() => {}}
            onFinalize={() => {}}
          />
        </div>
      </main>
    </div>
  );
}
