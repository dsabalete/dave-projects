# Mis Proyectos — Gestor de Proyectos Kanban

App web para gestionar proyectos en un tablero Kanban (Por hacer / En progreso / Completado), con datos persistidos en Supabase. Desplegada como sitio estático en Netlify.

Protegida con **HTTP Basic Auth** en Netlify (solo usuarios con credenciales pueden acceder).

## Archivos

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura y estilos de la app |
| `app.js` | Lógica: conexión a Supabase, tablero, drag-and-drop, modales |
| `supabase-schema.sql` | Script SQL: tablas e índices |
| `scripts/generate-config.js` | Genera `config.js` desde las variables de entorno |
| `netlify.toml` | Configuración de build |
| `.env.example` | Plantilla de variables de entorno |

## 1. Configurar Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com) y un nuevo proyecto (plan gratuito).
2. En **SQL Editor → New query**, pega el contenido de `supabase-schema.sql` y pulsa **Run**.
3. Ve a **Project Settings → API** y copia el **Project URL** y la **anon public key**.
4. Crea el archivo `.env` en la raíz del proyecto:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu-clave-anon"
```

5. Genera la configuración del cliente:

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

### Configurar Basic Auth

1. En el dashboard de Netlify, ve a **Site configuration → Access control**.
2. Activa **Basic access control**.
3. Introduce un **Username** y **Password** (ej: `admin` / `admin123`).
4. Guarda. Ahora solo usuarios con esas credenciales pueden acceder al sitio.

> **Nota:** Las credenciales se almacenan en Netlify, no en el código. Si compartes el sitio, cada visitante necesitará el usuario y contraseña.

### Desde la carpeta local (sin Git)

1. Ejecuta `node scripts/generate-config.js` con las variables de entorno definidas.
2. En [app.netlify.com](https://app.netlify.com), ve a **Deploys** y arrastra la carpeta del proyecto.

## Seguridad

La protección funciona en una capa:

### Basic Auth (Netlify)

Las credenciales se configuran en el dashboard de Netlify. Cualquier visita al sitio solicita usuario y contraseña antes de servir el HTML. Esto protege tanto el código como los datos de Supabase, ya que la anon key solo se carga en el navegador después de autenticarse.

### Datos en Supabase

Las tablas no tienen RLS habilitado. La anon key está embebida en `config.js` (gitignored). Como el sitio está protegido por Basic Auth, nadie puede acceder al código ni a la key sin credenciales.

## Flujo de login

```
1. Visita tu-sitio.netlify.app
         │
         ▼
2. Navegador solicita Basic Auth (usuario + contraseña)
         │
         ▼
3. Netlify sirve el sitio → carga index.html
         │
         ▼
4. Conexión a Supabase → tablero con tus datos
```

## Uso del tablero

- **+ Nueva tarea**: crea una tarea con proyecto, prioridad, fecha límite y columna.
- Arrastra tarjetas entre columnas para cambiar el estado.
- **Proyectos**: crea o elimina proyectos (etiquetas de color).
- El selector superior filtra el tablero por proyecto.
- Haz clic en una tarjeta para editarla; usa la ✕ para eliminarla.

## Mejoras pendientes

- Subtareas o comentarios por tarea.
- Vista de línea de tiempo o calendario.
- Soporte para dispositivos táctiles (drag-and-drop).
