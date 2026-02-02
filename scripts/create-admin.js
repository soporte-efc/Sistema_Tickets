/**
 * Script para crear el super admin en Supabase.
 * Ejecutar una sola vez: node scripts/create-admin.js
 *
 * Requiere en .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role en Supabase)
 */

const path = require("path");
const fs = require("fs");

// Cargar .env: primero desde la carpeta actual (cwd), luego junto al script
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  });
}
loadEnv(path.join(process.cwd(), ".env"));
loadEnv(path.join(__dirname, "..", ".env"));

const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env"
  );
  console.error(
    "Obtén la Service Role Key en Supabase: Settings → API → service_role (secret)"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "jcontreras@efc.com.pe",
    password: "Contreras19",
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      console.log("El usuario jcontreras@efc.com.pe ya existe. Listo.");
      return;
    }
    console.error("Error:", error.message);
    process.exit(1);
  }

  console.log("Super admin creado:", data.user.email);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
