import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const url = new URL(req.url);

    // GET /join-trip?tripId=xxx — fetch trip preview (no auth needed)
    if (req.method === "GET") {
      const tripId = url.searchParams.get("tripId");
      if (!tripId) return json({ error: "tripId required" }, 400);

      const { data: trip } = await supabaseAdmin
        .from("trips")
        .select("id, trip_name, destination, destination_city, start_date, end_date, vibe, budget_category, status")
        .eq("id", tripId)
        .maybeSingle();

      const { count } = await supabaseAdmin
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("trip_id", tripId);

      return json({ trip, memberCount: count ?? 0 });
    }

    // POST /join-trip — create user + join trip
    if (req.method === "POST") {
      const { tripId, nickname } = await req.json();
      if (!tripId || !nickname) return json({ error: "tripId and nickname required" }, 400);
      if (nickname.length < 2 || nickname.length > 30) return json({ error: "Nickname must be 2–30 characters" }, 400);

      // Verify trip exists
      const { data: trip } = await supabaseAdmin
        .from("trips")
        .select("id, status")
        .eq("id", tripId)
        .maybeSingle();
      if (!trip) return json({ error: "Trip not found" }, 404);

      // Create a new anonymous user via admin API
      const email = `guest_${crypto.randomUUID()}@tripsync.guest`;
      const password = crypto.randomUUID();
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: nickname, is_anonymous: true },
      });
      if (createErr) return json({ error: createErr.message }, 500);

      const userId = newUser.user.id;

      // Ensure profile exists with correct display name
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: userId, display_name: nickname, is_anonymous: true }, { onConflict: "id" });

      // Insert member (ignore duplicate)
      await supabaseAdmin
        .from("members")
        .insert({ trip_id: tripId, user_id: userId })
        .then(() => {});

      // Sign in as this user to return a session
      const { data: session, error: signInErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (signInErr) return json({ error: signInErr.message }, 500);

      // Return credentials so client can sign in with password
      return json({ email, password, userId, tripId });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err: any) {
    return json({ error: err.message ?? "Internal error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
