import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/tripsync/Header";
import { ActivityCard, MemberAvatar, type Activity, type Vote } from "@/components/tripsync/ActivityCard";
import { AddActivityForm } from "@/components/tripsync/AddActivityForm";
import { ItineraryPanel } from "@/components/tripsync/HarmonyAndItinerary";
import { BARCELONA_FALLBACK, type Itinerary } from "@/lib/tripsync/constants";
import { Link2, Loader2, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/trip/$tripId")({
  component: BoardPage,
  head: () => ({ meta: [{ title: "Trip Board — TripSync AI" }] }),
});

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    voting_open:        { label: "Voting Open",      cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500 animate-pulse" },
    itinerary_generated:{ label: "Itinerary Ready",  cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    finalized:          { label: "Finalized",        cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  };
  const m = map[status] ?? map.voting_open;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${m.cls}`}>
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />{m.label}
    </span>
  );
}

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
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const seenAct = useRef(new Set<string>());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Initial load
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

  // Realtime
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
          toast(`${data?.display_name ?? "Someone"} added "${a.title}"`);
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

  const votedCount = useMemo(() => {
    const set = new Set(votes.map((v) => v.activity_id));
    return set.size;
  }, [votes]);
  const canGenerate = votedCount >= 3;

  const onVote = async (activityId: string, type: Vote["vote_type"]) => {
    if (!user || locked) return;
    const existing = votes.find((v) => v.activity_id === activityId && v.user_id === user.id);
    // Optimistic
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
        await supabase.from("trips").update({ status: "itinerary_generated" }).eq("id", tripId).then(() => {});
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

  if (loading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!trip) return <div className="grid min-h-screen place-items-center bg-background"><p>Trip not found.</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader right={
        <button onClick={copyInvite} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">
          <Link2 className="h-4 w-4" /> Invite
        </button>
      } />

      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{trip.trip_name}</h1>
            <p className="text-xs text-muted-foreground">{trip.destination} · {trip.start_date} → {trip.end_date}</p>
          </div>
          <StatusBadge status={trip.status} />
          <div className="ml-auto flex -space-x-1.5">
            {members.slice(0,8).map((m, i) => <MemberAvatar key={m.user_id} name={m.display_name} idx={i} />)}
            {members.length > 8 && <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-bold ring-2 ring-card">+{members.length - 8}</span>}
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[240px_1fr_360px]">
        {/* Left */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trip details</h3>
            <p className="mt-2 text-sm font-semibold">{trip.destination_city}</p>
            <p className="text-xs text-muted-foreground">{trip.start_date} → {trip.end_date}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {(trip.vibe ?? []).map((v: string) => <span key={v} className="rounded-md bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary">{v}</span>)}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Budget: {trip.budget_category}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Members ({members.length})</h3></div>
            <ul className="mt-3 space-y-2">
              {members.map((m, i) => (
                <li key={m.user_id} className="flex items-center gap-2 text-sm">
                  <MemberAvatar name={m.display_name} idx={i} />
                  <span className="truncate">{m.display_name}{m.user_id === trip.created_by && <span className="ml-1 text-[10px] text-primary">organizer</span>}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center */}
        <section className="space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h2 className="text-lg font-semibold">AI Suggestions</h2>
              <span className="text-xs text-muted-foreground">({aiActivities.length})</span>
            </div>
            {aiActivities.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">Loading AI suggestions…</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {aiActivities.map((a) => (
                  <ActivityCard key={a.id} activity={a} votes={votes.filter((v) => v.activity_id === a.id)} currentUserId={user?.id ?? null} locked={locked} onVote={(t) => onVote(a.id, t)} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Group's Activities <span className="text-xs font-normal text-muted-foreground">({userActivities.length})</span></h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {userActivities.map((a) => (
                <ActivityCard key={a.id} activity={a} addedByName={memberMap[a.added_by ?? ""] ?? "Member"} votes={votes.filter((v) => v.activity_id === a.id)} currentUserId={user?.id ?? null} locked={locked} onVote={(t) => onVote(a.id, t)} />
              ))}
              <AddActivityForm onAdd={onAdd} disabled={locked} />
            </div>
          </div>
        </section>

        {/* Right */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ItineraryPanel
            itinerary={itinerary}
            status={trip.status}
            isOrganizer={isOrganizer}
            generating={generating}
            canGenerate={canGenerate}
            onGenerate={() => generate(false)}
            onRegenerate={() => generate(true)}
            onFinalize={finalize}
          />
        </aside>
      </main>

      {locked && !bannerDismissed && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-3">
            <p className="text-sm">🎉 This trip is finalized! Want to plan future trips? <a href="/create" className="font-semibold text-primary hover:underline">Create a free account — takes 10 seconds.</a></p>
            <button onClick={() => setBannerDismissed(true)} className="ml-auto text-sm text-muted-foreground hover:text-foreground">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}
