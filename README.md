# Mis Proyectos — Gestor de Proyectos Kanban

App web para gestionar proyectos en un tablero Kanban (Por hacer / En progreso / Completado), con datos persistidos en Supabase. Desplegada como sitio estático en Netlify.

Protegida con **Supabase Auth + RLS** (cada usuario solo ve sus datos).

## Archivos

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura, estilos y formulario de login |
| `app.js` | Lógica: autenticación, conexión a Supabase, tablero, drag-and-drop, modales |
| `supabase-schema.sql` | Script SQL: tablas, RLS restrictivo, índices |
| `scripts/generate-config.js` | Genera `config.js` desde las variables de entorno |
| `netlify.toml` | Configuración de build |
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

### Desde la carpeta local (sin Git)

1. Ejecuta `node scripts/generate-config.js` con las variables de entorno definidas.
2. En [app.netlify.com](https://app.netlify.com), ve a **Deploys** y arrastra la carpeta del proyecto.

## Seguridad

### Supabase Auth + RLS

Cada tabla tiene `user_id` y políticas RLS que garantizan que **solo el propietario puede leer y modificar sus datos**. Incluso si alguien obtiene la anon key, no puede acceder a datos de otros usuarios.

## Flujo de login

```
1. Visita tu-sitio.netlify.app
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
