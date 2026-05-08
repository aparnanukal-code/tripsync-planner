import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response("Unauthorized", { status: 401, headers: cors });
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401, headers: cors });

    const { tripId, isRegenerate = false } = await req.json();
    const { data: trip } = await admin.from("trips").select("*").eq("id", tripId).single();
    if (!trip) return new Response("Trip not found", { status: 404, headers: cors });

    if (isRegenerate && trip.created_by !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden: organizer only" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: activities } = await admin.from("activities").select("*, votes(*)").eq("trip_id", tripId);
    const voted = (activities ?? []).filter((a: any) => (a.votes ?? []).length > 0);
    if (voted.length < 3) {
      return new Response(JSON.stringify({ error: "Need at least 3 voted activities" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: members } = await admin.from("members").select("user_id, profiles(display_name)").eq("trip_id", tripId);
    const memberMap: Record<string,string> = Object.fromEntries((members ?? []).map((m: any) => [m.user_id, m.profiles?.display_name ?? "Member"]));

    const voteEmoji: Record<string,string> = { must_do: "❤️", interested: "🤔", skip: "😐" };
    const activitiesText = (activities ?? []).map((a: any) => {
      const tag = a.is_ai_suggested ? "[AI]" : `[Added by ${memberMap[a.added_by] ?? "Guest"}]`;
      const v = (a.votes ?? []).map((x: any) => `${memberMap[x.user_id] ?? "Member"}: ${voteEmoji[x.vote_type]}`).join(", ");
      return `"${a.title} (${a.category}) ${tag}${v ? ` — ${v}` : ""}"`;
    }).join("\n");

    const days = Math.max(1, Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000) + 1);

    let itinerary: any = null;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey) {
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: "You are TripSync AI. Generate a balanced itinerary fairly representing every member. User-added activities have equal weight to AI suggestions. Reason fields max 12 words. Calculate harmony scores from votes only. Return ONLY valid JSON." },
              { role: "user", content:
`TRIP: ${trip.destination_city}, ${trip.destination_country}
DATES: ${trip.start_date} to ${trip.end_date} (${days} days)
VIBE: ${(trip.vibe ?? []).join(", ")}
BUDGET: ${trip.budget_category}
MEMBERS: ${Object.values(memberMap).join(", ")}
ACTIVITIES WITH VOTES:
${activitiesText}

RULES:
- Max 5 activities/day
- reason: max 12 words; if user-added mention whose pick
- member harmony_score = (must_do_included/total_must_do)*70 + (positive_included/total_positive)*30. Round. Default 50 if zero.
- group harmony_score = average of member scores, rounded
- "source": "ai_suggested" | "user_added"
- Use these member ids in harmony_breakdown keys: ${Object.keys(memberMap).join(", ")}
Return: {"days":[{"day":1,"date":"YYYY-MM-DD","activities":[{"time":"09:00","title":"...","duration":"2 hours","cost_estimate":"€0","category":"Culture","reason":"...","source":"ai_suggested"}]}],"harmony_score":int,"harmony_breakdown":{"<id>":{"name":"...","score":int,"tooltip":"..."}},"optimization_summary":"..."}`
              },
            ],
          }),
        });
        if (resp.ok) {
          const j = await resp.json();
          itinerary = JSON.parse(j.choices?.[0]?.message?.content ?? "null");
        }
      } catch (_e) { /* ignore */ }
    }

    if (!itinerary) {
      return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }

    await admin.from("itineraries").upsert(
      { trip_id: tripId, generated_plan: itinerary, harmony_score: itinerary.harmony_score, harmony_breakdown: itinerary.harmony_breakdown, optimization_summary: itinerary.optimization_summary, updated_at: new Date().toISOString() },
      { onConflict: "trip_id" }
    );
    await admin.from("trips").update({ status: "itinerary_generated" }).eq("id", tripId);

    return new Response(JSON.stringify(itinerary), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
