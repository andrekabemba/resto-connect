const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.");
}

// Create a Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seed() {
  console.log("Seeding database via Supabase Admin API...");

  try {
    // 1. Users (via Supabase Auth)
    const users = [
      { email: "admin@restoconnect.com", role: "admin", password: "password123", name: "Admin Resto" },
      { email: "waiter@restoconnect.com", role: "waiter", password: "password123", name: "Serveur Jean" },
      { email: "cook@restoconnect.com", role: "cook", password: "password123", name: "Chef Marie" }
    ];

    for (const u of users) {
        console.log(`Processing user: ${u.email}...`);
        
        // 1. Ensure user exists in Auth
        let authUser;
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        authUser = existingUsers?.users?.find(user => user.email === u.email);

        if (!authUser) {
            const { data: createdUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { name: u.name, role: u.role }
            });
            if (authError) {
                console.error(`Error creating auth user ${u.email}:`, authError);
                continue;
            }
            authUser = createdUser.user;
        }

        // 2. Sync/Insert into public.users
        const { data: upsertData, error: upsertError } = await supabaseAdmin.from('users').upsert({
            // Do not insert ID, let DB auto-increment.
            name: u.name,
            email: u.email.toLowerCase(),
            role: u.role,
            active: true,
            password_hash: 'managed_by_supabase_auth' // Dummy hash to satisfy not-null constraint
        });
        
        if (upsertError) {
            console.error(`Failed to sync user ${u.email} to public.users:`, upsertError);
        } else {
            console.log(`Successfully synced user ${u.email} to public.users`);
        }
    }

    // 2. Categories
    const { data: categories, error: catError } = await supabaseAdmin.from('categories').upsert([
      { name: "Plats Principaux", position: 1 },
      { name: "Entrées", position: 0 },
      { name: "Boissons", position: 2 },
      { name: "Desserts", position: 3 }
    ], { onConflict: 'name' }).select();
    
    if (catError) console.error("Error seeding categories:", catError);

    const getCatId = (name) => categories?.find(c => c.name === name)?.id;

    // 3. Menu Items
    const menuItems = [
      {
        name: "Filet Mignon aux Épices",
        description: "Tendre filet de bœuf avec une réduction de vin rouge et herbes fraîches.",
        price: 24.50,
        category_id: getCatId("Plats Principaux"),
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        available: true,
        station: "cuisine"
      },
      {
        name: "Poulet à la Moambe",
        description: "Authentique poulet à la sauce moambe traditionnelle, servi avec riz et plantains.",
        price: 19.00,
        category_id: getCatId("Plats Principaux"),
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
        available: true,
        station: "cuisine"
      }
    ];

    for (const item of menuItems) {
      if (item.category_id) {
         await supabaseAdmin.from('menu_items').upsert(item, { onConflict: 'name' });
      }
    }

    // 4. Tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({ number: i, capacity: i % 2 === 0 ? 4 : 2, status: 'libre' });
    }
    await supabaseAdmin.from('tables_restaurant').upsert(tables, { onConflict: 'number' });

    console.log("Seeding completed successfully.");
    console.log("\nIdentifiants de test :");
    console.log("Admin: admin@restoconnect.com / password123");
    console.log("Serveur: waiter@restoconnect.com / password123");
    console.log("Cuisinier: cook@restoconnect.com / password123");

  } catch (error) {
    console.error("Seeding error:", error.response?.data || error.message);
  }
}

seed();
