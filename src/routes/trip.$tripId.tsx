import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ActivityCard, MemberAvatar, type Activity, type Vote } from "@/components/tripsync/ActivityCard";
import { AddActivityForm } from "@/components/tripsync/AddActivityForm";
import { BARCELONA_FALLBACK, type Itinerary } from "@/lib/tripsync/constants";
import { Link2, Loader as Loader2, Sparkles, RefreshCw, CircleCheck as CheckCircle2, MoveHorizontal as MoreHorizontal, ChevronRight, Plus, Zap, Share2, Settings } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/trip/$tripId")({
  component: BoardPage,
  head: () => ({ meta: [{ title: "Trip Dashboard — TripSync AI" }] }),
});

// ── Live activity feed mock + realtime merging ──────────────────────────────
type FeedItem = { id: string; avatar: string; name: string; action: string; detail?: string; time: string; emoji?: string };

const SEED_FEED: FeedItem[] = [
  { id: "f1", avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2", name: "Sarah", action: "voted ❤️ for", detail: "Sunset Tapas Crawl", time: "Just now", emoji: "❤️" },
  { id: "f2", avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2", name: "Alex", action: "added", detail: "Rooftop Bar 🍸", time: "2m ago" },
  { id: "f3", avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2", name: "Tom", action: 'commented "Can\'t wait for this!"', time: "5m ago" },
  { id: "f4", avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2", name: "Priya", action: "updated the time for Park Güell", time: "8m ago" },
];

const HERO_IMAGES: Record<string, string> = {
  default: "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1400",
  barcelona: "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1400",
  santorini: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1400",
  paris: "https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&w=1400",
  tokyo: "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1400",
};

function heroImage(destination: string) {
  const key = (destination ?? "").toLowerCase();
  for (const k of Object.keys(HERO_IMAGES)) {
    if (key.includes(k)) return HERO_IMAGES[k];
  }
  return HERO_IMAGES.default;
}

// ── Harmony ring ────────────────────────────────────────────────────────────
function HarmonyRing({ score }: { score: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div className="relative h-36 w-36 flex-shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#F3F0FF" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none"
          stroke="url(#harmonyGrad)" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="harmonyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-foreground">{score}%</span>
        <span className="text-xs text-muted-foreground font-medium mt-0.5">Great match 💜</span>
      </div>
    </div>
  );
}

// ── Itinerary day tabs + timeline ───────────────────────────────────────────
const ACTIVITY_IMAGES: Record<string, string> = {
  "Gothic Quarter Walk": "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Tapas at La Boqueria": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Rooftop Cocktails": "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Sagrada Família": "https://images.pexels.com/photos/819764/pexels-photo-819764.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Beach Day at Barceloneta": "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Flamenco Show": "https://images.pexels.com/photos/1537638/pexels-photo-1537638.jpeg?auto=compress&cs=tinysrgb&w=400",
};

const CATEGORY_BADGE: Record<string, string> = {
  Culture: "bg-purple-100 text-purple-700",
  Food: "bg-orange-100 text-orange-700",
  Nightlife: "bg-indigo-100 text-indigo-700",
  Relaxation: "bg-teal-100 text-teal-700",
  Adventure: "bg-amber-100 text-amber-700",
  Photography: "bg-pink-100 text-pink-700",
};

function ItineraryTimeline({ itinerary, dayIndex }: { itinerary: Itinerary; dayIndex: number }) {
  const day = itinerary.days[dayIndex];
  if (!day) return null;
  return (
    <div className="space-y-4">
      {day.activities.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="relative flex gap-4"
        >
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-primary mt-1 flex-shrink-0 shadow-sm shadow-primary/30" />
            {i < day.activities.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/30 to-transparent mt-1" />}
          </div>

          {/* Time */}
          <div className="w-14 flex-shrink-0 text-xs font-semibold text-muted-foreground pt-0.5">{a.time}</div>

          {/* Card */}
          <div className="flex-1 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow group mb-2">
            {ACTIVITY_IMAGES[a.title] && (
              <div className="relative h-36 overflow-hidden">
                <img src={ACTIVITY_IMAGES[a.title]} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_BADGE[a.category] ?? "bg-white/80 text-foreground"}`}>
                  {a.category}
                </span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-foreground">{a.title}</h4>
                <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span>⏱ {a.duration}</span>
                <span>💰 {a.cost_estimate}</span>
              </div>
              {a.reason && <p className="text-sm text-muted-foreground leading-relaxed">{a.reason}</p>}
              {a.source === "user_added" && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/8 rounded-full px-2.5 py-1">
                  ✦ Your pick
                </span>
              )}
              {/* Reactions row */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-accent transition-colors font-medium">❤️ {8 - i * 2}</button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium">💬 {2 + i}</button>
                </div>
                <div className="flex -space-x-1.5">
                  {SEED_FEED.slice(0, 3).map((f, fi) => (
                    <img key={fi} src={f.avatar} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-white" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Board page ───────────────────────────────────────────────────────────────
function BoardPage() {
  const { tripId } = Route.useParams();
  const [user, setUser] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [members, setMembers] = useState<{ user_id: string; display_name: string }[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(SEED_FEED);
  const seenAct = useRef(new Set<string>());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: a }, { data: m }, { data: it }] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).maybeSingle(),
        supabase.from("activities").select("*").eq("trip_id", tripId).order("created_at"),
        supabase.from("members").select("user_id, profiles(display_name)").eq("trip_id", tripId),
        supabase.from("itineraries").select("*").eq("trip_id", tripId).maybeSingle(),
      ]);
      setTrip(t);
      setActivities((a ?? []) as Activity[]);
      (a ?? []).forEach((x: any) => seenAct.current.add(x.id));
      setMembers((m ?? []).map((x: any) => ({ user_id: x.user_id, display_name: x.profiles?.display_name ?? "Member" })));
      if (it) setItinerary(it.generated_plan as Itinerary);
      const actIds = (a ?? []).map((x: any) => x.id);
      if (actIds.length) {
        const { data: v } = await supabase.from("votes").select("*").in("activity_id", actIds);
        setVotes((v ?? []) as Vote[]);
      }
      setLoading(false);
    })();
  }, [tripId]);

  useEffect(() => {
    if (!trip) return;
    const ch = supabase.channel(`trip:${tripId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities", filter: `trip_id=eq.${tripId}` }, async (p) => {
        const a = p.new as Activity;
        if (seenAct.current.has(a.id)) return;
        seenAct.current.add(a.id);
        setActivities((prev) => [...prev, a]);
        if (a.added_by) {
          const { data } = await supabase.from("profiles").select("display_name").eq("id", a.added_by).maybeSingle();
          const name = data?.display_name ?? "Someone";
          toast(`${name} added "${a.title}"`);
          setFeedItems((f) => [{ id: a.id, avatar: SEED_FEED[0].avatar, name, action: "added", detail: a.title, time: "Just now" }, ...f.slice(0, 9)]);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, (p) => {
        if (p.eventType === "DELETE") setVotes((v) => v.filter((x) => x.activity_id !== (p.old as any).activity_id || x.user_id !== (p.old as any).user_id));
        else {
          const nv = p.new as Vote;
          setVotes((v) => {
            const others = v.filter((x) => !(x.activity_id === nv.activity_id && x.user_id === nv.user_id));
            return [...others, nv];
          });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "trips", filter: `id=eq.${tripId}` }, (p) => setTrip(p.new))
      .on("postgres_changes", { event: "*", schema: "public", table: "itineraries", filter: `trip_id=eq.${tripId}` }, (p) => {
        if ((p.new as any)?.generated_plan) setItinerary((p.new as any).generated_plan);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "members", filter: `trip_id=eq.${tripId}` }, async (p) => {
        const uid = (p.new as any).user_id;
        const { data } = await supabase.from("profiles").select("display_name").eq("id", uid).maybeSingle();
        setMembers((prev) => prev.find((x) => x.user_id === uid) ? prev : [...prev, { user_id: uid, display_name: data?.display_name ?? "Member" }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [tripId, trip?.id]);

  const isOrganizer = !!user && trip?.created_by === user.id;
  const locked = trip?.status === "finalized";
  const aiActivities = activities.filter((a) => a.is_ai_suggested);
  const userActivities = activities.filter((a) => !a.is_ai_suggested);
  const memberMap = useMemo(() => Object.fromEntries(members.map((m) => [m.user_id, m.display_name])), [members]);
  const votedCount = useMemo(() => new Set(votes.map((v) => v.activity_id)).size, [votes]);
  const canGenerate = votedCount >= 3;

  const activeItinerary = itinerary ?? BARCELONA_FALLBACK;

  const onVote = async (activityId: string, type: Vote["vote_type"]) => {
    if (!user || locked) return;
    const existing = votes.find((v) => v.activity_id === activityId && v.user_id === user.id);
    setVotes((prev) => {
      const others = prev.filter((x) => !(x.activity_id === activityId && x.user_id === user.id));
      return existing && existing.vote_type === type ? others : [...others, { activity_id: activityId, user_id: user.id, vote_type: type }];
    });
    if (existing && existing.vote_type === type) {
      await supabase.from("votes").delete().eq("activity_id", activityId).eq("user_id", user.id);
    } else {
      await supabase.from("votes").upsert({ activity_id: activityId, user_id: user.id, vote_type: type }, { onConflict: "activity_id,user_id" });
    }
  };

  const onAdd = async ({ title, description, category }: { title: string; description: string; category: string }) => {
    if (!user) return;
    const { data, error } = await supabase.from("activities").insert({
      trip_id: tripId, title, description, category, added_by: user.id, is_ai_suggested: false,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    if (data) { seenAct.current.add(data.id); setActivities((p) => [...p, data as Activity]); }
  };

  const generate = async (regen = false) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-itinerary", { body: { tripId, isRegenerate: regen } });
      if (error || !data || data.error) {
        toast("Using a sample itinerary while AI warms up");
        setItinerary(BARCELONA_FALLBACK);
        await supabase.from("trips").update({ status: "itinerary_generated" }).eq("id", tripId);
      } else {
        setItinerary(data as Itinerary);
      }
    } catch {
      setItinerary(BARCELONA_FALLBACK);
    } finally { setGenerating(false); }
  };

  const finalize = async () => {
    await supabase.from("trips").update({ status: "finalized" }).eq("id", tripId);
    toast.success("Trip finalized 🎉");
  };

  const copyInvite = async () => {
    const url = `${window.location.origin}/join/${tripId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  if (loading) return (
    <div className="grid min-h-screen place-items-center bg-[#F8F7FF]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your trip…</p>
      </div>
    </div>
  );
  if (!trip) return <div className="grid min-h-screen place-items-center bg-[#F8F7FF]"><p>Trip not found.</p></div>;

  const tripDays = activeItinerary.days.length;
  const harmonyScore = activeItinerary.harmony_score;
  const harmonyMembers = Object.values(activeItinerary.harmony_breakdown);

  // AI summary breakdown (fake percentages derived from activities)
  const categoryBreakdown = [
    { label: "Food", pct: 40, icon: "🍽️", color: "text-orange-600" },
    { label: "Culture", pct: 35, icon: "🏛️", color: "text-purple-600" },
    { label: "Nightlife", pct: 25, icon: "🍸", color: "text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <span className="text-lg">✈️</span>
              </div>
              <span className="text-xl font-bold text-foreground">TripSync</span>
            </a>
            <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold">
              <a href="#" className="text-primary border-b-2 border-primary pb-0.5">My Trips</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Upcoming</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Groups</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative h-9 w-9 rounded-full bg-muted grid place-items-center hover:bg-muted/80 transition-colors">
              🔔
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">3</span>
            </button>
            <button onClick={copyInvite} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors">
              <Link2 className="h-4 w-4" /> Invite
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2"
                alt="You"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
              />
              <span className="text-sm font-semibold hidden sm:block">You</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div className="relative h-56 sm:h-72 overflow-hidden mx-4 mt-4 rounded-3xl shadow-2xl shadow-black/20">
        <img
          src={heroImage(trip.destination ?? trip.trip_name ?? "")}
          alt={trip.trip_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.1) 80%, transparent 100%)' }} />

        {/* Top-right actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Active Trip
          </span>
          <button className="h-9 w-9 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white grid place-items-center hover:bg-black/40 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white grid place-items-center hover:bg-black/40 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white grid place-items-center hover:bg-black/40 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight mb-2">
            {trip.trip_name} {trip.destination?.includes("Spain") ? "🇪🇸" : trip.destination?.includes("Greece") ? "🇬🇷" : "🌍"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-white/80 text-sm flex items-center gap-1.5">📍 {trip.destination}</span>
            <span className="text-white/50">·</span>
            <span className="text-white/80 text-sm flex items-center gap-1.5">📅 {trip.start_date} – {trip.end_date}</span>
            {(trip.vibe ?? []).slice(0, 1).map((v: string) => (
              <span key={v} className="bg-primary/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">{v}</span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((m, i) => (
                <MemberAvatar key={m.user_id} name={m.display_name} idx={i} />
              ))}
              {members.length > 5 && (
                <span className="h-8 w-8 rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold grid place-items-center ring-2 ring-white/20">
                  +{members.length - 5}
                </span>
              )}
            </div>
            <button className="flex items-center gap-1 bg-white/20 backdrop-blur text-white text-sm font-semibold px-3 py-1.5 rounded-full border border-white/30 hover:bg-white/30 transition-colors">
              {members.length} members →
            </button>
          </div>
        </div>
      </div>

      {/* ── 3-COLUMN GRID ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6">

        {/* ──── LEFT COLUMN ──── */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">

          {/* Group Harmony Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">Group Harmony</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Our vibe is looking good! 🎉</p>
            <div className="flex items-center gap-4">
              <HarmonyRing score={harmonyScore} />
              <div className="flex-1 space-y-2.5">
                {harmonyMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <img
                      src={SEED_FEED[i % SEED_FEED.length].avatar}
                      alt={m.name}
                      className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">{m.tooltip.split(" ").slice(0, 4).join(" ")}</p>
                    </div>
                    <span className="text-base">{m.score >= 85 ? "💙" : m.score >= 75 ? "🧡" : "❤️"}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
              See how it works ⓘ
            </button>
          </div>

          {/* Live Suggestions Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Live Suggestions</h3>
              </div>
              <span className="text-xs text-teal-600 font-semibold">8 new today</span>
            </div>
            <div className="space-y-3 mt-3">
              {(aiActivities.slice(0, 3).length ? aiActivities.slice(0, 3) : activities.slice(0, 3)).map((a, i) => {
                const actVotes = votes.filter((v) => v.activity_id === a.id);
                const mustDo = actVotes.filter((v) => v.vote_type === "must_do").length;
                const badges = [
                  { label: "Most loved", cls: "bg-primary/10 text-primary" },
                  { label: "Trending", cls: "bg-amber-100 text-amber-700" },
                  { label: "Your pick", cls: "bg-teal-100 text-teal-700" },
                ];
                return (
                  <div key={a.id} className="flex items-center gap-3 group cursor-pointer">
                    <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        src={ACTIVITY_IMAGES[a.title] ?? `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=80`}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badges[i % 3].cls}`}>{badges[i % 3].label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>❤️ {mustDo}</span>
                        <span>💬 {i + 1}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {}}
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add your own idea
            </button>
          </div>
        </aside>

        {/* ──── CENTER COLUMN ──── */}
        <section className="space-y-5 min-w-0">

          {/* Itinerary Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-black/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <h2 className="text-lg font-bold text-foreground">Itinerary</h2>
                </div>
                <a href="#" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                  View full plan →
                </a>
              </div>
              {/* Day tabs */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {activeItinerary.days.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeDay === i
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <div className="text-center">
                      <div>Day {d.day}</div>
                      <div className={`text-xs font-normal ${activeDay === i ? "text-white/70" : "text-muted-foreground"}`}>{d.date}</div>
                    </div>
                  </button>
                ))}
                {!generating && (
                  <button
                    onClick={() => generate(false)}
                    disabled={generating || !canGenerate}
                    className="flex-shrink-0 h-10 w-10 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors grid place-items-center disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeDay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ItineraryTimeline itinerary={activeItinerary} dayIndex={activeDay} />
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-3 mt-4 pt-4 border-t border-black/5">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
                  <Plus className="h-4 w-4" /> Add activity
                </button>
                {isOrganizer && (
                  <button
                    onClick={() => generate(true)}
                    disabled={generating || !canGenerate}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {generating ? "Generating…" : "Auto-optimize this day"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Your Group's Activities */}
          {!locked && (
            <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6">
              <h2 className="text-base font-bold text-foreground mb-4">
                Your Group's Activities
                <span className="ml-2 text-sm font-normal text-muted-foreground">({userActivities.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {userActivities.map((a) => (
                  <ActivityCard key={a.id} activity={a} addedByName={memberMap[a.added_by ?? ""] ?? "Member"} votes={votes.filter((v) => v.activity_id === a.id)} currentUserId={user?.id ?? null} locked={locked} onVote={(t) => onVote(a.id, t)} />
                ))}
                <AddActivityForm onAdd={onAdd} disabled={locked} />
              </div>
            </div>
          )}
        </section>

        {/* ──── RIGHT COLUMN ──── */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">

          {/* AI Trip Summary */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">AI Trip Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Great balance! Your plan blends{" "}
              {categoryBreakdown.map((c, i) => (
                <span key={c.label}>
                  <strong className="text-foreground">{c.label}</strong>
                  {i < categoryBreakdown.length - 2 ? ", " : i === categoryBreakdown.length - 2 ? ", and " : " "}
                </span>
              ))}
              perfectly.
            </p>
            <div className="flex items-center gap-3 mb-5">
              {categoryBreakdown.map((c) => (
                <div key={c.label} className="flex-1 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-muted grid place-items-center text-2xl mx-auto mb-1">{c.icon}</div>
                  <p className="text-xs font-bold text-foreground">{c.pct}%</p>
                  <p className={`text-[10px] font-semibold ${c.color}`}>{c.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => generate(false)}
              disabled={generating || !canGenerate}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating…" : "See full breakdown →"}
            </button>
            {isOrganizer && itinerary && trip.status !== "finalized" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => generate(true)} disabled={generating} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50">
                  <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} /> Regenerate
                </button>
                <button onClick={finalize} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 text-white px-3 py-2 text-xs font-semibold hover:bg-green-700 transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Finalize
                </button>
              </div>
            )}
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-base font-bold text-foreground">Live Activity</h3>
              </div>
              <span className="text-xs text-muted-foreground">Now</span>
            </div>

            {/* Top floating bubble */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-2xl p-3 mb-4"
            >
              <img src={SEED_FEED[0].avatar} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">Sarah voted ❤️</p>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-red-50 grid place-items-center text-lg flex-shrink-0">❤️</div>
            </motion.div>

            <div className="space-y-3">
              <AnimatePresence>
                {feedItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <img src={item.avatar} alt={item.name} className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-tight">
                        <strong>{item.name}</strong> {item.action}
                        {item.detail && <span className="font-semibold"> {item.detail}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button className="mt-4 w-full text-xs text-primary font-semibold hover:underline flex items-center justify-center gap-1">
              View all activity →
            </button>
          </div>
        </aside>
      </main>

      {/* Finalized banner */}
      {locked && (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-r from-primary to-purple-600 text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-3">
            <p className="text-sm">🎉 This trip is finalized! Want to plan future trips? <a href="/create" className="font-bold underline underline-offset-2">Create a free account</a></p>
          </div>
        </div>
      )}
    </div>
  );
}
