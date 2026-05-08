import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const FALLBACK = (city: string) => [
  { title: `${city} Old Town Walk`, description: "Wander the historic centre on foot.", category: "Culture", preferred_time: "Morning", insight: "Free intro to the city" },
  { title: `Local Market Tasting`, description: "Sample street food and produce.", category: "Food", preferred_time: "Afternoon", insight: "Best for foodies" },
  { title: `Sunset Viewpoint`, description: "Catch golden hour over the city.", category: "Photography", preferred_time: "Evening", insight: "Photo-worthy" },
  { title: `Rooftop Bar Hop`, description: "Cocktails with a view.", category: "Nightlife", preferred_time: "Night", insight: "Great vibes" },
  { title: `Museum Highlight`, description: "Top art or history museum.", category: "Culture", preferred_time: "Morning", insight: "Skip-the-line tip" },
  { title: `Park & Picnic`, description: "Relax at a famous park.", category: "Relaxation", preferred_time: "Afternoon", insight: "Free, family-friendly" },
  { title: `Hidden Neighbourhood`, description: "Explore an off-beat district.", category: "Sightseeing", preferred_time: "Afternoon", insight: "Locals' pick" },
  { title: `Signature Dinner`, description: "Iconic local dish at a beloved spot.", category: "Food", preferred_time: "Evening", insight: "Try the specialty" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { tripId, destinationCity, destinationCountry, vibeTags } = await req.json();

    const { data: cached } = await admin.from("destination_suggestions").select("suggestions")
      .eq("destination_city", destinationCity).eq("destination_country", destinationCountry).maybeSingle();

    let suggestions = cached?.suggestions as any[] | undefined;

    if (!suggestions) {
      const apiKey = Deno.env.get("LOVABLE_API_KEY");
      if (apiKey) {
        try {
          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "You return ONLY valid JSON. No markdown." },
                { role: "user", content:
`Generate 8 popular activities for ${destinationCity}, ${destinationCountry}. Vibe: ${(vibeTags ?? []).join(", ")}.
For each: title (max 5 words), description (max 15 words), category (Food|Culture|Nightlife|Adventure|Photography|Shopping|Relaxation|Sightseeing), preferred_time (Morning|Afternoon|Evening|Night), insight (max 15 words).
Mix categories. At least 2 food and 1 free activity.
Return: {"suggestions":[{...}]}`
                },
              ],
              response_format: { type: "json_object" },
            }),
          });
          if (resp.ok) {
            const j = await resp.json();
            const content = j.choices?.[0]?.message?.content ?? "{}";
            suggestions = JSON.parse(content).suggestions;
          }
        } catch (_e) { /* ignore */ }
      }
    }

    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      suggestions = FALLBACK(destinationCity);
    }

    await admin.from("destination_suggestions").upsert(
      { destination_city: destinationCity, destination_country: destinationCountry, suggestions },
      { onConflict: "destination_city,destination_country" }
    );

    const rows = suggestions.map((s: any) => ({
      trip_id: tripId, title: s.title, description: s.description, category: s.category,
      preferred_time_of_day: s.preferred_time, ai_insight: s.insight,
      is_ai_suggested: true, added_by: null,
    }));
    await admin.from("activities").insert(rows);

    return new Response(JSON.stringify({ suggestions }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
