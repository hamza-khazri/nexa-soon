export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await req.json();

    // Basic validation
    const required = ["role","full_name","email","phone_whatsapp","phone_alt","city_region","language"];
    for (const k of required) {
      if (!data?.[k]) return new Response(`Missing ${k}`, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1) Insert into users and get id back
    const userInsert = {
      role: data.role,
      full_name: data.full_name,
      email: data.email,
      phone_whatsapp: data.phone_whatsapp,
      phone_alt: data.phone_alt,
      city_region: data.city_region,
      language: data.language,
      wants_updates: !!data.wants_updates,
    };

    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(userInsert),
    });

    if (!userRes.ok) return new Response(await userRes.text(), { status: 500 });

    const userJson = await userRes.json();
    const userId = userJson?.[0]?.id;
    if (!userId) return new Response("No user id returned", { status: 500 });

    // 2) Insert into role table
    const role = data.role;
    const details = data.details || {};

    if (role === "technician") {
      const techInsert = {
        user_id: userId,
        main_trade: details.main_trade,
        experience_years: details.experience_years,
        status: details.status,
        company_name: details.company_name || null,
        project_6m: details.project_6m || null,
        ready_clear_prices: !!details.ready_clear_prices,
        ready_documented: !!details.ready_documented,
        ready_reviews: !!details.ready_reviews,
        ready_tracking: !!details.ready_tracking,
      };

      const r = await fetch(`${SUPABASE_URL}/rest/v1/technicians`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: KEY,
          Authorization: `Bearer ${KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(techInsert),
      });

      if (!r.ok) return new Response(await r.text(), { status: 500 });
    }

    if (role === "enterprise") {
      const entInsert = {
        user_id: userId,
        company_name: details.company_name,
        activity_type: details.activity_type,
        sites_count: details.sites_count,
        users_count: details.users_count,
        main_needs: details.main_needs,
        current_management: details.current_management,
      };

      const r = await fetch(`${SUPABASE_URL}/rest/v1/enterprises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: KEY,
          Authorization: `Bearer ${KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(entInsert),
      });

      if (!r.ok) return new Response(await r.text(), { status: 500 });
    }

    if (role === "client") {
      const clientInsert = {
        user_id: userId,
        client_type: details.client_type,
        service_needed: details.service_needed,
        current_management: details.current_management,
        project_6m: details.project_6m || null,
      };

      const r = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: KEY,
          Authorization: `Bearer ${KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(clientInsert),
      });

      if (!r.ok) return new Response(await r.text(), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, user_id: userId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(`Bad Request: ${e?.message || "unknown"}`, { status: 400 });
  }
};
