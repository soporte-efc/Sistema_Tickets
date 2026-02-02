# Despliegue en Vercel con GitHub

Guía para vincular este proyecto a GitHub y desplegarlo en Vercel.

---

## 1. Subir el proyecto a GitHub

### Si aún no tienes repositorio en GitHub

1. Crea una cuenta en [github.com](https://github.com) si no la tienes.
2. Crea un **nuevo repositorio**:
   - Clic en **"New repository"**.
   - Nombre sugerido: `sistema-tickets` o `sistema-tickets-efc`.
   - **No** marques "Add a README" si ya tienes código local.
   - Clic en **Create repository**.

### Desde tu carpeta del proyecto (PowerShell o CMD)

Abre la terminal en la carpeta del proyecto (`D:\SISTEMA_TICKETS`) y ejecuta:

```bash
# Inicializar Git (si aún no lo has hecho)
git init

# Añadir todos los archivos (el .env no se sube porque está en .gitignore)
git add .

# Primer commit
git commit -m "Initial commit: Sistema de tickets con Next.js, Supabase y Prisma"

# Conectar con tu repositorio de GitHub (cambia TU_USUARIO y TU_REPO por los tuyos)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir a la rama main
git branch -M main
git push -u origin main
```

Sustituye `TU_USUARIO` por tu usuario de GitHub y `TU_REPO` por el nombre del repositorio.

---

## 2. Conectar el repositorio con Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (puedes usar "Continue with GitHub").
2. Clic en **"Add New..."** → **"Project"**.
3. **Import** tu repositorio de GitHub (si no lo ves, autoriza a Vercel en GitHub).
4. Selecciona el repo `sistema-tickets` (o el nombre que hayas usado).
5. En **Configure Project**:
   - **Framework Preset:** Next.js (debería detectarse solo).
   - **Root Directory:** dejar por defecto (`.`).
   - **Build Command:** `npm run build` (o `prisma generate && next build` — ya está en tu `package.json`).
   - **Output Directory:** por defecto.
   - **Install Command:** `npm install`.

6. **Variables de entorno:** antes de hacer Deploy, añade todas las variables (ver sección 3).
7. Clic en **Deploy**.

---

## 3. Variables de entorno en Vercel

En el proyecto de Vercel: **Settings** → **Environment Variables**. Añade estas variables (usa los mismos valores que en tu `.env` local, pero con la URL de producción si aplica):

| Nombre | Descripción | Dónde obtenerlo |
|--------|-------------|------------------|
| `DATABASE_URL` | URL de PostgreSQL (Supabase) | Supabase → Project Settings → Database → Connection string (Session mode, URI). Usa la misma que en local o la de producción. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública | Supabase → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (secreta) | Supabase → Project Settings → API → service_role |

- Marca las variables para **Production**, **Preview** y **Development** si quieres que funcionen en todos los entornos.
- **No** subas tu archivo `.env` a GitHub; Vercel usa sus propias variables.

---

## 4. Migraciones de base de datos

Las migraciones de Prisma están en el repo. En Vercel el comando `build` ya ejecuta `prisma generate`. Las tablas deben existir en Supabase:

- Si ya aplicaste las migraciones en tu base de datos (local o la misma que usa Vercel), no hace falta hacer nada más.
- Si usas **otra** base de datos para producción, en tu máquina ejecuta una sola vez apuntando a esa URL:

```bash
set DATABASE_URL=postgresql://...tu-url-de-produccion...
npx prisma migrate deploy
```

Así la base de producción queda actualizada.

---

## 5. Callback de Microsoft 365 (Azure) en producción

Si usas "Continuar con Microsoft 365", en **Azure Portal** (registro de la aplicación):

1. Ve a **Autenticación** → **Agregar un URI de redirección**.
2. Añade la URL de callback de **producción**:
   ```
   https://TU_PROYECTO.supabase.co/auth/v1/callback
   ```
   (Tu proyecto Supabase ya tiene esta URL; Azure debe permitir que Supabase redirija ahí.)

3. En **Supabase** (Auth → Providers → Azure) el "Callback URL" ya es el correcto. Si tu app en Vercel está en `https://sistema-tickets.vercel.app`, tras el login con Microsoft el usuario volverá a tu app porque en el código usas `redirectTo: origin + '/auth/callback'`, y ese origen en producción será tu dominio de Vercel.

---

## 6. Después del primer deploy

- Vercel te dará una URL tipo `https://sistema-tickets-xxx.vercel.app`.
- Cada `git push` a `main` puede generar un nuevo deploy automático (si lo dejaste activo).
- Para ver logs y redeplegar: **Vercel Dashboard** → tu proyecto → **Deployments**.

---

## Resumen rápido

1. **GitHub:** `git init` → `git add .` → `git commit` → `git remote add origin` → `git push`.
2. **Vercel:** Import repo desde GitHub → Añadir variables de entorno → Deploy.
3. **Variables:** `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. **Producción:** Ajustar Azure redirect si usas Microsoft 365 y usar la misma (o la de prod) Supabase DB.
