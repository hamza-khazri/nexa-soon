export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await req.json();

    // minimal validation
    for (const k of ["who", "full_name", "email", "phone"]) {
      if (!data?.[k]) return new Response(`Missing ${k}`, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const payload = {
      who: data.who,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      city_region: data.city_region ?? null,
      language: data.language ?? null,
      main_trade: data.main_trade ?? null,
      experience_years: data.experience_years ?? null,
      status: data.status ?? null,
      intervention_zones: data.intervention_zones ?? null,
      has_project_6m: data.has_project_6m ?? null,
      ready_clear_prices: !!data.ready_clear_prices,
      ready_documented_interventions: !!data.ready_documented_interventions,
      ready_client_reviews: !!data.ready_client_reviews,
      ready_digital_tracking: !!data.ready_digital_tracking,
      wants_updates: !!data.wants_updates,
    };

    const r = await fetch(`${SUPABASE_URL}/rest/v1/community_signups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const t = await r.text();
      return new Response(t, { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Bad Request", { status: 400 , statusText: e.message });
  }
};
