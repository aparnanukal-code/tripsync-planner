import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Zap, Users, Bot, Play } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "TripSync AI — Trips born in the group chat" },
      { name: "description", content: "Create a trip, invite your crew, vote on the best ideas, and let AI build the perfect itinerary for everyone." },
    ],
  }),
});

const SOCIAL_BUBBLES = [
  { avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2", name: "Sarah", action: "voted", emoji: "❤️", time: "2m", delay: 0 },
  { avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2", name: "Alex", action: "added", detail: "Rooftop Bar 🍸", time: "5m", delay: 0.35 },
  { avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2", name: "Priya", action: "voted", emoji: "😍", time: "8m", delay: 0.7 },
];

const DEMO_VOTES = [
  { name: "Sunset Catamaran", votes: 8, width: "75%" },
  { name: "Oia Village Walk", votes: 6, width: "58%" },
  { name: "Wine Tasting", votes: 5, width: "45%" },
];

const DEMO_AVATARS = [
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2",
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2",
  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2",
  "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2",
];

function Landing() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <span className="text-lg">✈️</span>
            </div>
            <span className="text-xl font-bold text-foreground">TripSync</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">For groups</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/create" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
              Sign in
            </Link>
            <Link
              to="/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              <Sparkles className="h-4 w-4" />
              Create Trip →
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex flex-col">
        {/* Full-bleed travel image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Santorini sunset"
            className="w-full h-full object-cover object-center"
          />
          {/* Sunset gradient overlay */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(248,247,255,0.97) 0%, rgba(248,247,255,0.85) 35%, rgba(248,247,255,0.3) 60%, rgba(255,200,150,0.15) 80%, transparent 100%)',
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, transparent 50%, rgba(248,247,255,0.9) 85%, rgba(248,247,255,1) 100%)',
          }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-12 flex-1 flex items-start">
          <div className="max-w-[560px] w-full">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-md border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary tracking-wider uppercase"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Group Travel
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <h1 className="text-[4.5rem] sm:text-[5.5rem] font-black leading-[0.95] tracking-tight text-foreground mb-6">
                Trips born<br />
                in the{' '}
                <span
                  className="italic font-black"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #FF6B35 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  group chat.
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-foreground/60 leading-relaxed mb-8 max-w-sm"
            >
              Create a trip, invite your crew, vote on the best ideas,<br className="hidden sm:block" />
              and let AI build the perfect itinerary for everyone.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <Link
                to="/create"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
              >
                <Sparkles className="h-5 w-5" />
                Create a Trip
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
              <Link
                to="/demo"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-foreground/80 bg-white/70 backdrop-blur-sm border border-black/10 hover:bg-white hover:border-primary/20 transition-all duration-200"
              >
                <Play className="h-4 w-4" />
                See it in action
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap items-center gap-5 text-sm text-foreground/50"
            >
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" />No sign-up to explore</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-teal-500" />Invite anyone</span>
              <span className="flex items-center gap-1.5"><Bot className="h-4 w-4 text-primary" />AI builds the plan</span>
            </motion.div>
          </div>

          {/* Floating Social Bubbles */}
          <div className="absolute right-8 top-12 hidden xl:flex flex-col gap-4 z-20">
            {SOCIAL_BUBBLES.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + b.delay }}
                style={{ animation: `float ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${b.delay}s` }}
                className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-3 shadow-xl shadow-black/8 min-w-[220px]"
              >
                <img src={b.avatar} alt={b.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {b.name} {b.action} {b.emoji}
                    {b.detail && <span className="font-bold"> {b.detail}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{b.time} ago</p>
                </div>
                {b.emoji && !b.detail && (
                  <div className="h-9 w-9 rounded-xl bg-red-50 grid place-items-center text-lg flex-shrink-0">
                    {b.emoji}
                  </div>
                )}
                {b.detail && (
                  <div className="h-9 w-9 rounded-xl bg-amber-50 grid place-items-center text-lg flex-shrink-0">
                    🍸
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREVIEW CARDS ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card 1 — Live Demo Trip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1 relative rounded-3xl overflow-hidden shadow-2xl shadow-black/15 min-h-[320px]"
          >
            <img
              src="https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Santorini"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.2) 80%, transparent 100%)' }} />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                LIVE DEMO
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-white text-2xl font-black mb-1">Santorini Escape 🇬🇷</h3>
              <p className="text-white/70 text-sm mb-4">Greece · May 24 → May 30 · 6 days</p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {DEMO_AVATARS.map((src, i) => (
                    <img key={i} src={src} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-black/20" />
                  ))}
                </div>
                <span className="h-8 w-8 rounded-full bg-white/20 backdrop-blur grid place-items-center text-white text-xs font-bold ring-2 ring-black/20">+2</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2 — Voting */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/8 border border-black/5"
          >
            <h3 className="text-lg font-bold text-foreground mb-1">What shall we do?</h3>
            <p className="text-sm text-muted-foreground mb-5">Vote on your favorites</p>
            <div className="space-y-4">
              {DEMO_VOTES.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center text-sm flex-shrink-0">
                    {['⛵', '🏛️', '🍷'][i]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">{v.name}</span>
                      <span className="text-xs font-bold text-accent flex items-center gap-0.5 ml-2 flex-shrink-0">❤️ {v.votes}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: v.width }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {DEMO_AVATARS.slice(0,3).map((src, i) => (
                  <img key={i} src={src} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-white" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">11 votes so far</span>
            </div>
          </motion.div>

          {/* Card 3 — Group Vibe + AI Preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Group Vibe */}
            <div className="bg-white rounded-3xl p-5 shadow-2xl shadow-black/8 border border-black/5 flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-100 to-teal-100 grid place-items-center text-3xl flex-shrink-0 border-4 border-amber-200/50">
                🌴
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Group vibe</p>
                <p className="text-lg font-black text-foreground">Beach + Chill</p>
                <p className="text-sm text-muted-foreground">with a touch of Adventure</p>
              </div>
            </div>

            {/* AI Trip Preview */}
            <div className="bg-white rounded-3xl p-5 shadow-2xl shadow-black/8 border border-black/5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">AI trip preview</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                6 days of sun-soaked views, local flavors, and unforgettable moments—perfectly balanced for your group.
              </p>
              <div className="mt-4 flex items-end justify-between">
                <div className="flex gap-1">
                  {['✨', '✦', '✦'].map((s, i) => (
                    <span key={i} className={`text-primary ${i === 0 ? 'text-xl' : 'text-sm opacity-60'}`}>{s}</span>
                  ))}
                </div>
                <Link
                  to="/demo"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  See full plan →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
