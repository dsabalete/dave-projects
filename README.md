# Mis Proyectos — Gestor de Proyectos Kanban

App web para gestionar proyectos en un tablero Kanban (Por hacer / En progreso / Completado), con datos persistidos en Supabase. Desplegada como sitio estático en **Netlify** y **Cloudflare Pages**.

Protegida con **Supabase Auth + RLS** (cada usuario solo ve sus datos).

## Archivos

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura, estilos y formulario de login |
| `app.js` | Lógica: autenticación, conexión a Supabase, tablero, drag-and-drop, modales |
| `supabase-schema.sql` | Script SQL: tablas, RLS restrictivo, índices |
| `scripts/generate-config.js` | Genera `config.js` desde variables de entorno |
| `netlify.toml` | Configuración de build para Netlify |
| `package.json` | Scripts de build y dependencias |
| `.env.example` | Plantilla de variables de entorno |

## 1. Configurar Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com) y un nuevo proyecto (plan gratuito).
2. En **SQL Editor → New query**, pega el contenido de `supabase-schema.sql` y pulsa **Run**.
3. Ve a **Project Settings → API** y copia el **Project URL** y la **anon public key**.
4. **Crea tu usuario de Supabase Auth:**
   - Ve a **Authentication → Users → Add user**
   - Introduce tu email y contraseña
   - **Deshabilita el registro público:** Authentication → Providers → Email → desmarca "Enable Sign ups"
5. Crea el archivo `.env` en la raíz del proyecto:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu-clave-anon"
```

6. Genera la configuración del cliente:

```bash
node scripts/generate-config.js
```

## 2. Desarrollo local

```bash
npx serve .
```

Abre `http://localhost:3000`.

## 3. Despliegue

### Netlify (desde GitHub)

1. En [app.netlify.com](https://app.netlify.com), **Add new site → Import an existing project** y selecciona el repositorio.
2. **Build command:** `npm run build`
3. **Build output directory:** `.`
4. En **Site configuration → Environment variables**, añade `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

### Cloudflare Pages (desde GitHub)

1. En [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Selecciona el repositorio.
3. **Build command:** `npm run build`
4. **Build output directory:** `.`
5. En **Environment variables**, añade `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

### Netlify (desde la carpeta local)

1. Ejecuta `node scripts/generate-config.js` con las variables de entorno definidas.
2. En [app.netlify.com](https://app.netlify.com), ve a **Deploys** y arrastra la carpeta del proyecto.

## Seguridad

Cada tabla tiene `user_id` y políticas RLS que garantizan que **solo el propietario puede leer y modificar sus datos**. Incluso si alguien obtiene la anon key, no puede acceder a datos de otros usuarios.

## Flujo de login

```
1. Visita el sitio
         │
         ▼
2. Formulario de login (email + contraseña)
         │
         ▼
3. Supabase Auth verifica credenciales
         │
         ▼
4. Tablero con datos filtrados por tu usuario
```

## Uso del tablero

- **+ Nueva tarea**: crea una tarea con proyecto, prioridad, fecha límite y columna.
- Arrastra tarjetas entre columnas para cambiar el estado.
- **Proyectos**: crea o elimina proyectos (etiquetas de color).
- El selector superior filtra el tablero por proyecto.
- Haz clic en una tarjeta para editarla; usa la ✕ para eliminarla.
- **Salir**: cierra la sesión.

## Mejoras pendientes

- Subtareas o comentarios por tarea.
- Vista de línea de tiempo o calendario.
- Soporte para dispositivos táctiles (drag-and-drop).
