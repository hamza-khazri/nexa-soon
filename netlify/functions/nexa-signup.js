export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await req.json();

    // Basic validation
    if (!data.role || !data.email) {
      return new Response("Missing role or email", { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Headers for Supabase API
    const headers = {
      "Content-Type": "application/json",
      "apikey": KEY,
      "Authorization": `Bearer ${KEY}`
    };

    // 1. Prepare User Payload
    const userPayload = {
        role: data.role,
        full_name: data.full_name,
        email: data.email,
        phone_whatsapp: data.phone_whatsapp || data.phone, // handle both just in case
        phone_alt: data.phone_alt,
        city_region: data.city_region,
        language: data.language,
        wants_updates: !!data.wants_updates
    };

    // 2. Insert User & Get ID
    // Header "Prefer: return=representation" is ensuring we get the inserted row back
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: { ...headers, "Prefer": "return=representation" },
      body: JSON.stringify(userPayload),
    });

    if (!userRes.ok) {
      const err = await userRes.text();
      return new Response(`Error creating user: ${err}`, { status: 500 });
    }

    const userRows = await userRes.json();
    const userId = userRows[0]?.id;

    if (!userId) {
       return new Response("Failed to retrieve new User ID", { status: 500 });
    }

    // 3. Prepare Role Payload
    let roleTable = "";
    // If 'details' object is passed, use it. Otherwise try to use flat data (backward compat attempt? No, let's strict to 'details').
    // We assume the caller sends a 'details' object containing the role-specific fields.
    let rolePayload = data.details || {}; 
    
    rolePayload.user_id = userId;

    if (data.role === "technician") {
        roleTable = "technicians";
    } else if (data.role === "client") {
        roleTable = "clients";
    } else if (data.role === "enterprise") {
        roleTable = "enterprises";
    }

    if (roleTable) {
        // 4. Insert Role Data
        const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/${roleTable}`, {
            method: "POST",
            headers: { ...headers, "Prefer": "return=minimal" }, // No need for data back
            body: JSON.stringify(rolePayload),
        });

        if (!roleRes.ok) {
            const err = await roleRes.text();
            // Optional cleanup: Delete user? For now just report error.
            return new Response(`User created but failed to add details: ${err}`, { status: 500 });
        }
    }

    return new Response(JSON.stringify({ ok: true, id: userId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response("Server Error: " + e.message, { status: 500 });
  }
};
