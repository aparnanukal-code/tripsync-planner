import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/tripsync/Header";
import { CityAutocomplete } from "@/components/tripsync/CityAutocomplete";
import { VIBES, BUDGETS } from "@/lib/tripsync/constants";
import type { CityResult } from "@/lib/tripsync/photon";
import { Sparkles, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/create")({
  component: CreatePage,
  head: () => ({ meta: [
    { title: "Create Trip — TripSync AI" },
    { name: "description", content: "Start planning a trip. Invite friends with a single link." },
  ]}),
});

function CreatePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"signin"|"signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Trip form state
  const [tripName, setTripName] = useState("");
  const [city, setCity] = useState<CityResult | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [vibe, setVibe] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>("Mid-range");
  const [busy, setBusy] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name || "Organizer" }, emailRedirectTo: window.location.origin + "/create" },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Auth failed");
    } finally { setAuthBusy(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!city || !tripName || !start || !end || vibe.length === 0) {
      toast.error("Fill every field — destination, dates, and at least one vibe.");
      return;
    }
    setBusy(true);
    try {
      const { data: trip, error } = await supabase.from("trips").insert({
        trip_name: tripName,
        destination: city.label,
        destination_city: city.city,
        destination_country: city.country,
        start_date: start, end_date: end,
        vibe, budget_category: budget,
        status: "voting_open",
        created_by: user.id,
      }).select().single();
      if (error) throw error;
      await supabase.from("members").insert({ trip_id: trip.id, user_id: user.id });

      // Fire and forget AI suggestions
      supabase.functions.invoke("generate-destination-suggestions", {
        body: { tripId: trip.id, destinationCity: city.city, destinationCountry: city.country, vibeTags: vibe },
      }).catch(() => {});

      navigate({ to: "/trip/$tripId", params: { tripId: trip.id } });
    } catch (err: any) {
      toast.error(err.message ?? "Could not create trip");
    } finally { setBusy(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader right={<span className="text-sm text-muted-foreground">Organizer sign-in</span>} />
        <main className="mx-auto max-w-md px-6 py-16">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-md">
            <h1 className="text-2xl font-bold tracking-tight">{authMode === "signup" ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Organizers sign in once to manage their trips. Guests join with a nickname only.</p>
            <form onSubmit={handleAuth} className="mt-6 space-y-3">
              {authMode === "signup" && (
                <input className="input-field w-full px-3 py-2 text-sm" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <input type="email" required className="input-field w-full px-3 py-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" required minLength={6} className="input-field w-full px-3 py-2 text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button disabled={authBusy} className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm">
                {authBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                {authMode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>
            <button onClick={() => setAuthMode((m) => m === "signup" ? "signin" : "signup")} className="mt-4 text-sm text-primary hover:underline">
              {authMode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader right={
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
      } />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Create your trip</h1>
        <p className="mt-1 text-sm text-muted-foreground">We'll pre-load AI activity suggestions and give you a link to share.</p>

        <form onSubmit={submit} className="mt-8 space-y-6 rounded-2xl border border-border bg-white p-6 shadow-md">
          <Field label="Trip name">
            <input required className="input-field w-full px-3 py-2 text-sm"
              value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="Barcelona Weekend" />
          </Field>
          <Field label="Destination">
            <CityAutocomplete value={city} onSelect={setCity} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date">
              <input required type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input-field w-full px-3 py-2 text-sm" />
            </Field>
            <Field label="End date">
              <input required type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input-field w-full px-3 py-2 text-sm" />
            </Field>
          </div>
          <Field label="Trip vibe (pick at least one)">
            <div className="flex flex-wrap gap-2">
              {VIBES.map((v) => {
                const on = vibe.includes(v);
                return (
                  <button type="button" key={v}
                    onClick={() => setVibe((x) => on ? x.filter((y) => y !== v) : [...x, v])}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${on ? "border-primary bg-primary-light text-primary" : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary-light/50"}`}>
                    {v}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Budget">
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => {
                const on = budget === b.value;
                return (
                  <button type="button" key={b.value} onClick={() => setBudget(b.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${on ? "border-primary bg-primary-light text-primary" : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary-light/50"}`}>
                    {b.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <button disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" strokeWidth={2.5} />}
            Create Trip & Get Invite Link
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
