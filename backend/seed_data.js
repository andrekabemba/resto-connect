const axios = require('axios');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const api = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
});

async function seed() {
  console.log("Seeding database via REST API...");

  try {
    // 1. Users
    const users = [
      { name: "Admin Resto", email: "admin@restoconnect.com", role: "admin", password: "password123" },
      { name: "Serveur Jean", email: "waiter@restoconnect.com", role: "waiter", password: "password123" },
      { name: "Chef Marie", email: "cook@restoconnect.com", role: "cook", password: "password123" }
    ];

    for (const u of users) {
        const hash = bcrypt.hashSync(u.password, 10);
        await api.post('/users', {
            name: u.name,
            email: u.email.toLowerCase(),
            password_hash: hash,
            role: u.role,
            active: true
        }, { headers: { 'Prefer': 'resolution=merge-duplicates' } }).catch(e => console.log(`User ${u.email} already exists or error`));
    }

    // 2. Categories
    const { data: categories } = await api.post('/categories', [
      { name: "Plats Principaux", position: 1 },
      { name: "Entrées", position: 0 },
      { name: "Boissons", position: 2 },
      { name: "Desserts", position: 3 }
    ], { headers: { 'Prefer': 'resolution=merge-duplicates' } });

    const getCatId = (name) => categories.find(c => c.name === name)?.id;

    // 3. Menu Items
    const menuItems = [
      {
        name: "Filet Mignon aux Épices",
        description: "Tendre filet de bœuf avec une réduction de vin rouge et herbes fraîches.",
        price: 24.50,
        category_id: getCatId("Plats Principaux"),
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        available: 1,
        station: "cuisine"
      },
      {
        name: "Poulet à la Moambe",
        description: "Authentique poulet à la sauce moambe traditionnelle, servi avec riz et plantains.",
        price: 19.00,
        category_id: getCatId("Plats Principaux"),
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
        available: 1,
        station: "cuisine"
      }
    ];

    for (const item of menuItems) {
      if (item.category_id) {
         await api.post('/menu_items', item, { headers: { 'Prefer': 'resolution=merge-duplicates' } });
      }
    }

    // 4. Tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({ number: i, capacity: i % 2 === 0 ? 4 : 2, status: 'libre' });
    }
    await api.post('/tables_restaurant', tables, { headers: { 'Prefer': 'resolution=merge-duplicates' } });

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
