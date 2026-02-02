# Cómo subir todo a GitHub y dejarlo corriendo en Vercel (sin depender de npm run dev)

Sigue estos pasos en orden.

---

## PARTE 1: Subir todo tu código a GitHub

Tu repositorio **soporte-efc/Sistema_Tickets** ahora mismo solo tiene un README. Tienes que subir todo el proyecto desde tu carpeta `D:\SISTEMA_TICKETS`.

### 1. Abre la terminal en la carpeta del proyecto

- En VS Code/Cursor: menú **Terminal** → **New Terminal** (o Ctrl+ñ).
- Asegúrate de estar en `D:\SISTEMA_TICKETS` (si no, escribe: `cd D:\SISTEMA_TICKETS`).

### 2. Comandos para subir a GitHub (cópialos uno por uno)

```bash
git init
```

```bash
git add .
```

```bash
git status
```
(Deberías ver muchos archivos: app/, components/, prisma/, etc. No debe aparecer .env.)

```bash
git commit -m "Subir sistema de tickets completo"
```

```bash
git remote add origin https://github.com/soporte-efc/Sistema_Tickets.git
```
(Si te dice que "origin" ya existe, usa: `git remote set-url origin https://github.com/soporte-efc/Sistema_Tickets.git`)

```bash
git branch -M main
```

```bash
git pull origin main --allow-unrelated-histories
```
(Te pregunta "merge?" → escribe `:wq` y Enter, o acepta el mensaje. Esto junta el README que está en GitHub con tu código.)

```bash
git push -u origin main
```

Cuando termine, entra a **github.com/soporte-efc/Sistema_Tickets** y deberías ver todas las carpetas: `app`, `components`, `lib`, `prisma`, `public`, etc.

---

## PARTE 2: Conectar GitHub con Vercel y desplegar

### 1. En Vercel, importar el proyecto

- En la pantalla donde dice **"Deploy your first project"**, haz clic en el botón **"Import"** que está al lado de **"Import Project"** (el que tiene el icono de GitHub).
- Si te pide, **autoriza a Vercel** para acceder a tu cuenta de GitHub.
- En la lista de repositorios, busca **Sistema_Tickets** (o **soporte-efc/Sistema_Tickets**) y haz clic en **"Import"**.

### 2. Configurar el proyecto (pantalla "Configure Project")

- **Project Name:** puede quedar `Sistema_Tickets` o el que prefieras.
- **Framework Preset:** debe decir **Next.js** (no lo cambies).
- **Root Directory:** déjalo vacío (`.`).
- **Build Command:** `npm run build` (o déjalo por defecto).
- **Environment Variables:** aquí es importante. Haz clic en **"Add"** o en **"Environment Variables"** y añade **una por una** estas variables (con los mismos valores que tienes en tu archivo `.env` en tu PC):

  - **Name:** `DATABASE_URL`  
    **Value:** (pega la URL de tu base de datos de Supabase, la que tienes en .env)

  - **Name:** `NEXT_PUBLIC_SUPABASE_URL`  
    **Value:** (la URL de tu proyecto Supabase)

  - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
    **Value:** (la clave anon de Supabase)

  - **Name:** `SUPABASE_SERVICE_ROLE_KEY`  
    **Value:** (la clave service_role de Supabase)

- Marca las variables para **Production** (y si quieres también Preview/Development).
- Luego haz clic en **"Deploy"**.

### 3. Esperar el deploy

- Vercel va a construir tu proyecto (puede tardar 1–2 minutos).
- Si todo va bien, verás **"Congratulations!"** y una URL tipo:  
  `https://sistema-tickets-xxxxx.vercel.app`

### 4. Usar la app sin `npm run dev`

- Abre esa URL en el navegador: esa es tu app desplegada.
- Ya no necesitas tener `npm run dev` corriendo en tu PC para usar la aplicación: Vercel la mantiene en línea.
- Cada vez que hagas `git push` a `main` en GitHub, Vercel puede volver a desplegar solo (deploy automático).

---

## Resumen

1. **Terminal en D:\SISTEMA_TICKETS** → `git init`, `git add .`, `git commit`, `git remote add origin`, `git pull ...`, `git push`.
2. **GitHub** → Comprobar que se ven todas las carpetas del proyecto.
3. **Vercel** → "Import" → elegir **Sistema_Tickets** → añadir las 4 variables de entorno → Deploy.
4. **Listo** → Entras a la URL que te da Vercel y ya no dependes de `npm run dev`.

Si en algún paso te sale un error, copia el mensaje exacto y lo vemos.
