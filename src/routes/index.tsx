import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/tripsync/Header";
import { Zap, Vote, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({ meta: [
    { title: "TripSync AI — Plan trips together" },
    { name: "description", content: "Real-time collaborative group travel planner. Join with a nickname, vote, and let AI build a fair itinerary." },
  ]}),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <section className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            Plan trips together.<br />
            <span className="text-primary">No chaos. Just good vibes.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Join with a nickname. Vote in seconds. AI does the rest.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/create" className="btn-primary px-8 py-3 text-base">
              Create Trip →
            </Link>
            <Link to="/demo" className="btn-outline-purple px-8 py-3 text-base">
              ▶ Try Demo
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            { icon: Zap, emoji: "⚡", title: "Join Instantly", desc: "No accounts, no friction. Drop in with a nickname and start voting in seconds." },
            { icon: Vote, emoji: "🗳️", title: "Vote + Add", desc: "React with ❤️ 🤔 😐 to AI suggestions, or pitch your own ideas to the group." },
            { icon: Target, emoji: "🎯", title: "Fair by AI", desc: "One click builds a balanced plan everyone can get behind — with a Harmony Score." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-white p-6 shadow-md transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="text-3xl">{f.emoji}</div>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
