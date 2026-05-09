import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/tripsync/Header";
import { Loader as Loader2, Users, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/join/$tripId")({
  component: JoinPage,
  head: () => ({ meta: [
    { title: "Join Trip — TripSync AI" },
    { name: "description", content: "Join your group's trip with just a nickname." },
  ]}),
});

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/join-trip`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
      try {
        const res = await fetch(`${EDGE_URL}?tripId=${tripId}`, {
          headers: { Authorization: `Bearer ${ANON_KEY}` },
        });
        const data = await res.json();
        setTrip(data.trip ?? null);
        setCount(data.memberCount ?? 0);
      } catch {
        setTrip(null);
      } finally {
        setLoading(false);
      }
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
      const res = await fetch(EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({ tripId, nickname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not join");

      // Sign in with the generated credentials so the user has a real session
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInErr) throw signInErr;

      navigate({ to: "/trip/$tripId", params: { tripId } });
    } catch (err: any) {
      toast.error(err.message ?? "Could not join");
    } finally {
      setBusy(false);
    }
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
        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
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
            className="input-field w-full px-3 py-2 text-sm"
          />
          <button disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Join Trip →
          </button>
          <p className="text-center text-xs text-muted-foreground">No email or password required.</p>
        </form>
      </main>
    </div>
  );
}
