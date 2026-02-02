# Sistema de Tickets EFC

Sistema de tickets corporativo para EFC Abastecimiento Industrial. Next.js 14 (App Router), TailwindCSS, shadcn/ui, Supabase (Auth) y Prisma (Postgres).

## Requisitos

- Node.js 18+
- Cuenta Supabase
- Base de datos PostgreSQL (Supabase o externa)

## Configuración

1. **Clonar e instalar**

```bash
npm install
```

2. **Variables de entorno**

Copia `.env.example` a `.env` y completa:

- `DATABASE_URL`: URL de conexión PostgreSQL (ej. desde Supabase → Settings → Database)
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key del proyecto Supabase

3. **Imágenes de login**

Coloca en `public/`:

- **efc-logo.png**: logo corporativo (formulario de login)
- **login-bg.jpg**: imagen de fondo del login (fachada)

Si tienes las imágenes en la carpeta `assets/` del proyecto, copia:

- El archivo del logo → `public/efc-logo.png`
- La imagen de la fachada → `public/login-bg.jpg`

4. **Base de datos**

```bash
npx prisma migrate dev --name init
```

(O en producción: `npx prisma migrate deploy`)

5. **Ejecutar**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige a `/login` o `/dashboard` según la sesión.

## Deploy en Vercel

- Conecta el repo y configura las variables de entorno en Vercel.
- Añade `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Ejecuta las migraciones contra la base de producción (por ejemplo desde tu máquina con `DATABASE_URL` de producción y `npx prisma migrate deploy`).

## Estructura principal

- `app/login/page.tsx` – Login con Supabase Auth y glass-effect
- `app/dashboard/page.tsx` – Dashboard con cards, tabla y filtros
- `app/api/tickets/route.ts` – GET (listar) y POST (crear, parseo de `raw_text`)
- `app/api/tickets/[id]/route.ts` – GET (ver) y DELETE (eliminar)
- `app/api/tickets/stats/route.ts` – Conteos para los cards
- `prisma/schema.prisma` – Modelo `Ticket`
- `lib/supabase/` – Cliente Supabase (navegador y servidor)

## API Tickets

**POST /api/tickets**

Body JSON:

```json
{
  "caller_name": "Juan Pérez",
  "call_duration": "5 min",
  "raw_text": "Problemas con horizon, incidencia, se configura outlook, Surquillo"
}
```

`raw_text` se divide por comas en: `subject`, `ticket_type`, `solution`, `site`.

**GET /api/tickets**

Query params: `status` (all | pendiente | en_proceso | completado | rechazado), `search`, `sort` (asc | desc).

## Colores corporativos EFC

- Amarillo/Lima: `#D3E500` (Tailwind: `efc-lime`)
- Gris oscuro: `efc-gray-dark` / `efc-gray-darker`
- Blanco: `white`
