# Mis Proyectos — Gestor de Proyectos Kanban

App web para gestionar proyectos en un tablero Kanban (Por hacer / En progreso / Completado), con datos persistidos en Supabase. Desplegada como sitio estático en Netlify.

Protegida con **Netlify Identity** (acceso al sitio) y **Supabase Auth + RLS** (protección de datos).

## Archivos

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura y estilos de la app |
| `app.js` | Lógica: autenticación, conexión a Supabase, tablero, drag-and-drop, modales |
| `login.html` | Página de login (Netlify Identity widget) |
| `supabase-schema.sql` | Script SQL: tablas, RLS restrictivo, índices |
| `scripts/generate-config.js` | Genera `config.js` desde las variables de entorno |
| `netlify.toml` | Configuración de build, redirects y headers de seguridad |
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

Si ya tenías datos sin `user_id`, migra los existentes ejecutando en el SQL Editor:

```sql
UPDATE projects SET user_id = 'TU-UUID-AQUI' WHERE user_id IS NULL;
UPDATE tasks SET user_id = 'TU-UUID-AQUI' WHERE user_id IS NULL;
```

Obtén tu UUID en **Authentication → Users → tu usuario → User ID**.

## 2. Desarrollo local

```bash
npx serve .
```

Abre `http://localhost:3000`. El flujo de login es:

1. Netlify Identity redirige a `/login`
2. Login con credenciales de Netlify Identity
3. Se carga la app, que pide credenciales de Supabase Auth
4. El tablero muestra los datos filtrados por tu usuario

## 3. Despliegue en Netlify

### Desde GitHub (recomendado)

1. Sube el código a un repositorio en GitHub.
2. En [app.netlify.com](https://app.netlify.com), haz clic en **Add new site → Import an existing project** y selecciona el repositorio.
3. En **Site configuration → Environment variables**, añade:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `SUPABASE_ANON_KEY` | `tu-clave-anon-publica` |

4. Netlify ejecutará automáticamente `node scripts/generate-config.js` antes de desplegar.

### Configurar Netlify Identity

1. En el dashboard de Netlify, ve a **Site configuration → Identity → Enable Identity**.
2. En **Registration**, selecciona **Invite only** (solo usuarios invitados pueden acceder).
3. Ve a **Identity → Users → Invite users** e invita tu email.
4. Acepta la invitación desde el email que recibas.
5. En **Site configuration → Identity → Roles**, asigna el rol **admin** a tu usuario.

### Desde la carpeta local (sin Git)

1. Ejecuta `node scripts/generate-config.js` con las variables de entorno definidas.
2. En [app.netlify.com](https://app.netlify.com), ve a **Deploys** y arrastra la carpeta del proyecto.

## Seguridad

La protección funciona en dos capas:

### Capa 1: Netlify Identity (puerta de entrada)

Las redirect rules en `netlify.toml` obligan a autenticarse con Netlify Identity antes de acceder a cualquier página. Usuarios sin el rol `admin` son redirigidos a `/login`.

### Capa 2: Supabase Auth + RLS (protección de datos)

Cada tabla tiene `user_id` y políticas RLS que garantizan que **solo el propietario puede leer y modificar sus datos**. Incluso si alguien obtiene la anon key, no puede acceder a datos de otros usuarios.

### Headers de seguridad

`netlify.toml` incluye:
- `X-Frame-Options: DENY` — previene clickjacking
- `X-Content-Type-Options: nosniff` — previene MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` — controla el referrer

## Flujo de login

```
1. Visita tu-sitio.netlify.app
         │
         ▼
2. Netlify Identity redirige → /login
         │
         ▼
3. Login con Netlify Identity (email + password)
         │
         ▼
4. Redirige a / → index.html carga
         │
         ▼
5. App detecta que no hay sesión Supabase → formulario de login
         │
         ▼
6. Login con Supabase Auth (mismo email + password)
         │
         ▼
7. Tablero con datos filtrados por tu usuario
```

## Uso del tablero

- **+ Nueva tarea**: crea una tarea con proyecto, prioridad, fecha límite y columna.
- Arrastra tarjetas entre columnas para cambiar el estado.
- **Proyectos**: crea o elimina proyectos (etiquetas de color).
- El selector superior filtra el tablero por proyecto.
- Haz clic en una tarjeta para editarla; usa la ✕ para eliminarla.
- **Salir**: cierra la sesión de Supabase Auth.

## Mejoras pendientes

- Subtareas o comentarios por tarea.
- Vista de línea de tiempo o calendario.
- Soporte para dispositivos táctiles (drag-and-drop).
