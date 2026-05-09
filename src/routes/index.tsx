import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/tripsync/Header";
import { Zap, Vote, Target } from "lucide-react";
import heroTravel from "@/assets/hero-travel.jpg";
import bgPattern from "@/assets/bg-pattern.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "TripSync AI — Plan trips together" },
      {
        name: "description",
        content:
          "Real-time collaborative group travel planner. Join with a nickname, vote, and let AI build a fair itinerary.",
      },
      { property: "og:title", content: "TripSync AI — Plan trips together" },
      {
        property: "og:description",
        content: "Vote, add ideas, and let AI build a fair itinerary your whole group will love.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroTravel}
          alt="Beach, mountain, European street, and Asian temple"
          width={1920}
          height={1080}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary-light px-5 py-2 text-sm font-semibold text-primary-hover shadow-[0_0_24px_-4px_var(--primary)] ring-1 ring-primary/20">
              ✈️ Group travel, finally simple
            </span>
            <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              The trip that made
              <br />
              <span className="text-primary">out of the chat.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Plan trips together. No chaos. Just good vibes.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                to="/create"
                className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary-hover"
              >
                Create Trip →
              </Link>
              <Link
                to="/demo"
                className="rounded-lg border border-border bg-card/80 px-6 py-3 text-base font-semibold text-foreground backdrop-blur hover:bg-card"
              >
                ▶ Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features on patterned background */}
      <section
        className="relative"
        style={{
          backgroundImage: `linear-gradient(180deg, color-mix(in oklab, var(--background) 92%, transparent), var(--background)), url(${bgPattern})`,
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">How TripSync works</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                emoji: "⚡",
                title: "Join Instantly",
                desc: "No accounts, no friction. Drop in with a nickname and start voting in seconds.",
              },
              {
                icon: Vote,
                emoji: "🗳️",
                title: "Vote + Discuss",
                desc: "React with ❤️ 🤔 😐, pitch your own ideas, and leave notes for the group.",
              },
              {
                icon: Target,
                emoji: "🎯",
                title: "Fair by AI",
                desc: "One click builds a balanced plan everyone can get behind — with a Harmony Score.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm backdrop-blur transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="text-3xl">{f.emoji}</div>
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
