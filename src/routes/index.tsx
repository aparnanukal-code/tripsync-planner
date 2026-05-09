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

const ICON_GRADIENTS = [
  "from-[#7C3AED] to-[#4C1D95]",
  "from-[#F97316] to-[#EA580C]",
  "from-[#14B8A6] to-[#0D9488]",
];

function SocialBubble({ color, text, style }: { color: string; text: string; style: React.CSSProperties }) {
  return (
    <div
      style={style}
      className="absolute flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white"
      aria-hidden="true"
    >
      <span
        className="h-6 w-6 shrink-0 rounded-full"
        style={{ background: color }}
      />
      <span>{text}</span>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section
        className="relative flex min-h-[85svh] w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
        style={{
          background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 55%, #F97316 100%)",
        }}
      >
        {/* Decorative social bubbles */}
        <SocialBubble
          color="#F97316"
          text="Sarah voted ❤️"
          style={{
            top: "22%",
            left: "6%",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        />
        <SocialBubble
          color="#14B8A6"
          text="Alex added Rooftop Bar"
          style={{
            top: "38%",
            right: "5%",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        />
        <SocialBubble
          color="#7C3AED"
          text="Priya reacted 😍"
          style={{
            bottom: "22%",
            left: "8%",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1
            className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Plan trips together.<br />
            <span style={{ color: "rgba(255,220,180,0.95)" }}>No chaos. Just good vibes.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg font-medium sm:text-xl" style={{ color: "rgba(255,255,255,0.8)" }}>
            Join with a nickname. Vote in seconds. AI does the rest.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/create"
              className="rounded-full bg-white px-9 py-3.5 text-base font-bold text-[#7C3AED] shadow-xl transition-transform duration-150 hover:scale-105"
              style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.25)" }}
            >
              Create Trip →
            </Link>
            <Link
              to="/demo"
              className="rounded-full border-2 border-white/60 bg-white/10 px-9 py-3.5 text-base font-semibold text-white backdrop-blur transition-all duration-150 hover:bg-white/20"
            >
              ▶ Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Zap,    title: "Join Instantly", desc: "No accounts, no friction. Drop in with a nickname and start voting in seconds.", grad: ICON_GRADIENTS[0] },
            { icon: Vote,   title: "Vote + Add",     desc: "React with ❤️ 🤔 😐 to AI suggestions, or pitch your own ideas to the group.", grad: ICON_GRADIENTS[1] },
            { icon: Target, title: "Fair by AI",     desc: "One click builds a balanced plan everyone can get behind — with a Harmony Score.", grad: ICON_GRADIENTS[2] },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-white p-6 shadow-md transition-all hover:border-primary/40 hover:shadow-lg">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.grad} shadow-sm`}>
                <f.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
