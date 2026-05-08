import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/tripsync/Header";
import { Loader2, Users, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/join/$tripId")({
  component: JoinPage,
  head: () => ({ meta: [
    { title: "Join Trip — TripSync AI" },
    { name: "description", content: "Join your group's trip with just a nickname." },
  ]}),
});

function JoinPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [count, setCount] = useState(0);
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        await supabase.auth.signInAnonymously({
          options: { data: { display_name: "Traveler", is_anonymous: true } },
        });
      }
      const { data: t } = await supabase.from("trips").select("*").eq("id", tripId).maybeSingle();
      setTrip(t);
      const { count: c } = await supabase.from("members").select("*", { count: "exact", head: true }).eq("trip_id", tripId);
      setCount(c ?? 0);
      setLoading(false);
    })();
  }, [tripId]);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.length < 2 || nickname.length > 30) {
      toast.error("Nickname must be 2–30 characters");
      return;
    }
    setBusy(true);
    try {
      const { data: existing } = await supabase.auth.getSession();
      let userId = existing.session?.user?.id;
      if (!userId) {
        const { data, error } = await supabase.auth.signInAnonymously({
          options: { data: { display_name: nickname, is_anonymous: true } },
        });
        if (error) throw error;
        userId = data.user!.id;
        // Update profile name in case trigger used default
        await supabase.from("profiles").update({ display_name: nickname, is_anonymous: true }).eq("id", userId);
      } else {
        await supabase.from("profiles").update({ display_name: nickname }).eq("id", userId);
      }
      await supabase.from("members").insert({ trip_id: tripId, user_id: userId! }).then(() => {});
      navigate({ to: "/trip/$tripId", params: { tripId } });
    } catch (err: any) {
      toast.error(err.message ?? "Could not join");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!trip) return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">Double-check the invite link with your organizer.</p>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader right={<span className="text-sm text-muted-foreground">Guest join</span>} />
      <main className="mx-auto max-w-md px-6 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">You're invited</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{trip.trip_name}</h1>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{trip.destination}</li>
            <li className="flex items-center gap-2"><Calendar className="h-4 w-4" />{trip.start_date} → {trip.end_date}</li>
            <li className="flex items-center gap-2"><Users className="h-4 w-4" />{count} {count === 1 ? "member" : "members"} already joined</li>
          </ul>
        </div>
        <form onSubmit={join} className="mt-6 space-y-3">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
            placeholder="Your nickname (e.g. Alex)"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Join Trip →
          </button>
          <p className="text-center text-xs text-muted-foreground">No email or password required.</p>
        </form>
      </main>
    </div>
  );
}
