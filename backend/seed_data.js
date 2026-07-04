const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Utilisation de la clé SERVICE_ROLE si disponible pour contourner le RLS, sinon la clé ANON
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🚀 Initialisation des données RestoConnect...");

  const passwordHash = bcrypt.hashSync("password123", 10);

  const users = [
    { name: "Admin Resto", email: "admin@restoconnect.com", password_hash: passwordHash, role: "admin", active: true },
    { name: "Serveur Jean", email: "waiter@restoconnect.com", password_hash: passwordHash, role: "waiter", active: true },
    { name: "Chef Marie", email: "cook@restoconnect.com", password_hash: passwordHash, role: "cook", active: true }
  ];

  console.log("1. Création des utilisateurs...");
  for (const user of users) {
    const { error } = await supabase.from('users').upsert(user, { onConflict: 'email' });
    if (error) {
        console.error(`❌ Erreur pour ${user.email}:`, error.message);
        if (error.code === '42501') {
            console.log("👉 CONSEIL: Allez dans votre dashboard Supabase > SQL Editor et lancez : ALTER TABLE users DISABLE ROW LEVEL SECURITY;");
        }
    } else {
        console.log(`✅ Utilisateur créé : ${user.email}`);
    }
  }

  console.log("\n2. Création des tables physiques...");
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    tables.push({ number: i, capacity: i % 2 === 0 ? 4 : 2, status: 'libre' });
  }
  const { error: tableError } = await supabase.from('tables_restaurant').upsert(tables, { onConflict: 'number' });
  if (tableError) console.error("❌ Erreur tables:", tableError.message);
  else console.log("✅ 10 Tables créées.");

  console.log("\n3. Création des catégories...");
  const { data: cats, error: catError } = await supabase.from('categories').upsert([
    { name: "Plats Principaux", position: 1 },
    { name: "Entrées", position: 0 },
    { name: "Boissons", position: 2 }
  ], { onConflict: 'name' }).select();

  if (catError) console.error("❌ Erreur catégories:", catError.message);
  else console.log("✅ Catégories créées.");

  console.log("\n✨ Initialisation terminée !");
  console.log("--------------------------------------------------");
  console.log("Identifiants de connexion :");
  console.log("- Admin : admin@restoconnect.com / password123");
  console.log("- Serveur : waiter@restoconnect.com / password123");
  console.log("- Cuisinier : cook@restoconnect.com / password123");
  console.log("--------------------------------------------------");
}

seed();
