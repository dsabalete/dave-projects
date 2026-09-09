# Mis Proyectos — Gestor de Proyectos Kanban

App web para gestionar proyectos en un tablero Kanban (Por hacer / En progreso / Completado), con datos persistidos en Supabase. Desplegada como sitio estático en Netlify.

## Archivos

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura y estilos de la app |
| `app.js` | Lógica: conexión a Supabase, tablero, drag-and-drop, modales |
| `supabase-schema.sql` | Script SQL para crear las tablas en Supabase |
| `scripts/generate-config.js` | Genera `config.js` desde las variables de entorno |
| `netlify.toml` | Configuración de build y despliegue para Netlify |
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

Esto crea `config.js` con las credenciales para el navegador. Este archivo está en `.gitignore` y no se sube al repositorio.

## 2. Desarrollo local

```bash
npx serve .
```

Abre `http://localhost:3000` en el navegador. No se necesita instalar dependencias.

## 3. Despliegue en Netlify

### Desde GitHub (recomendado)

1. Sube el código a un repositorio en GitHub.
2. En [app.netlify.com](https://app.netlify.com), haz clic en **Add new site → Import an existing project** y selecciona el repositorio.
3. En **Site configuration → Environment variables**, añade:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `SUPABASE_ANON_KEY` | `tu-clave-anon-publica` |

4. Netlify ejecutará automáticamente `node scripts/generate-config.js` antes de desplegar (configurado en `netlify.toml`).
5. La app quedará disponible en una URL tipo `tu-sitio.netlify.app`.

### Desde la carpeta local (sin Git)

1. Ejecuta `node scripts/generate-config.js` con las variables de entorno definidas.
2. En [app.netlify.com](https://app.netlify.com), ve a **Deploys** y arrastra la carpeta del proyecto.

## Seguridad

La app **no tiene sistema de login**. Las políticas de Row-Level Security (RLS) en Supabase están configuradas para permitir acceso completo a cualquier usuario anónimo.

**Esto significa que cualquiera con tu URL de Supabase y la anon key puede leer, modificar y borrar tus datos.**

Para mitigarlo:

- **No compartas la URL de la app pública** demasiado ampliamente.
- Si en el futuro necesitas restringir el acceso, integra [Supabase Auth](https://supabase.com/docs/guides/auth) y actualiza las políticas RLS para exigir `auth.uid()`.

La anon key se expone en el navegador por diseño (es una clave pública). Lo crítico es que las políticas RLS no filtran quién puede operar sobre los datos.

## Estructura del tablero

- **+ Nueva tarea**: crea una tarea con proyecto, prioridad, fecha límite y columna.
- Arrastra tarjetas entre columnas para cambiar el estado.
- **Proyectos**: crea o elimina proyectos (etiquetas de color).
- El selector superior filtra el tablero por proyecto.
- Haz clic en una tarjeta para editarla; usa la ✕ para eliminarla.

## Mejoras pendientes

- Autenticación (Supabase Auth) para restringir el acceso.
- Subtareas o comentarios por tarea.
- Vista de línea de tiempo o calendario.
- Soporte para dispositivos táctiles (drag-and-drop).
