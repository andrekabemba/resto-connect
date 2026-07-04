const supabase = require("./db/supabaseClient");

async function seed() {
  console.log("Seeding database...");

  // 1. Catégories
  const { data: catData, error: catError } = await supabase
    .from("categories")
    .upsert([
      { name: "Plats Principaux", position: 1 },
      { name: "Entrées", position: 0 },
      { name: "Boissons", position: 2 },
      { name: "Desserts", position: 3 }
    ], { onConflict: 'name' })
    .select();

  if (catError) console.error("Error categories:", catError);
  const categories = catData || [];

  const getCatId = (name) => categories.find(c => c.name === name)?.id;

  // 2. Menu Items
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
    },
    {
      name: "Salade César Royale",
      description: "Romaine croquante, poulet grillé, parmesan, croûtons à l'ail et sauce maison.",
      price: 14.50,
      category_id: getCatId("Entrées"),
      imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
      available: 1,
      station: "cuisine"
    },
    {
      name: "Cocktail Signature",
      description: "Mélange exotique de fruits frais et une touche de menthe.",
      price: 8.00,
      category_id: getCatId("Boissons"),
      imageUrl: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80",
      available: 1,
      station: "bar"
    }
  ];

  for (const item of menuItems) {
    if (item.category_id) {
       await supabase.from("menu_items").upsert([item], { onConflict: 'name' });
    }
  }

  // 3. Tables
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    tables.push({ number: i, capacity: i % 2 === 0 ? 4 : 2, status: 'libre' });
  }
  await supabase.from("tables_restaurant").upsert(tables, { onConflict: 'number' });

  console.log("Seeding completed successfully.");
}

seed();
