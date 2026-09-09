// ============================================================
// Gestor de Proyectos — lógica de la app
// ============================================================

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let projects = [];
let tasks = [];
let activeProjectId = "all";
let draggedTaskId = null;

const statusBanner = document.getElementById("status-banner");
function showBanner(msg, isError) {
  statusBanner.textContent = msg;
  statusBanner.style.display = "block";
  statusBanner.style.background = isError ? "#fbe2e2" : "#fcf0d4";
  statusBanner.style.color = isError ? "#a13333" : "#8a5c07";
}
function hideBanner() {
  statusBanner.style.display = "none";
}

// ---------- Carga de datos ----------

async function loadAll() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("your-project") || SUPABASE_URL.includes("dave-projects")) {
    showBanner("Configura tu .env y ejecuta node scripts/generate-config.js para generar la configuración de Supabase.", true);
    return;
  }
  const [{ data: projectData, error: projectError }, { data: taskData, error: taskError }] = await Promise.all([
    supabaseClient.from("projects").select("*").order("created_at", { ascending: true }),
    supabaseClient.from("tasks").select("*").order("position", { ascending: true }),
  ]);

  if (projectError || taskError) {
    showBanner("No se pudo conectar con Supabase. Revisa .env, genera config.js y asegúrate de ejecutar supabase-schema.sql.", true);
    console.error(projectError, taskError);
    return;
  }
  hideBanner();
  projects = projectData || [];
  tasks = taskData || [];
  renderProjectFilter();
  renderProjectSelect();
  renderProjectList();
  renderBoard();
}

// ---------- Render: filtro y selects de proyecto ----------

function renderProjectFilter() {
  const select = document.getElementById("project-filter");
  select.innerHTML = `<option value="all">Todos los proyectos</option>` +
    projects.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
  select.value = activeProjectId;
}

function renderProjectSelect() {
  const select = document.getElementById("task-project");
  select.innerHTML = projects.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
}

function renderProjectList() {
  const list = document.getElementById("project-list");
  if (projects.length === 0) {
    list.innerHTML = `<p style="font-size:13px;color:var(--gray-500);">Aún no hay proyectos.</p>`;
    return;
  }
  list.innerHTML = projects.map(p => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid var(--gray-300);border-radius:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${p.color};display:inline-block;"></span>
        <span style="font-size:13px;font-weight:500;">${escapeHtml(p.name)}</span>
      </div>
      <button class="card-delete" data-delete-project="${p.id}" title="Eliminar proyecto">Eliminar</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-delete-project]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-delete-project");
      if (!confirm("¿Eliminar este proyecto? También se eliminarán sus tareas.")) return;
      const { error } = await supabaseClient.from("projects").delete().eq("id", id);
      if (error) { showBanner("No se pudo eliminar el proyecto.", true); return; }
      await loadAll();
    });
  });
}

// ---------- Render: tablero ----------

function renderBoard() {
  const filtered = activeProjectId === "all"
    ? tasks
    : tasks.filter(t => t.project_id === activeProjectId);

  ["todo", "in_progress", "done"].forEach(status => {
    const container = document.getElementById(`cards-${status}`);
    const list = filtered.filter(t => t.status === status);
    document.getElementById(`count-${status}`).textContent = list.length;

    if (list.length === 0) {
      container.innerHTML = `<div class="empty-hint">Sin tareas aquí</div>`;
    } else {
      container.innerHTML = list.map(cardHtml).join("");
    }

    container.querySelectorAll(".card").forEach(cardEl => {
      cardEl.addEventListener("dragstart", () => {
        draggedTaskId = cardEl.getAttribute("data-id");
        cardEl.classList.add("dragging");
      });
      cardEl.addEventListener("dragend", () => cardEl.classList.remove("dragging"));
      cardEl.addEventListener("click", (e) => {
        if (e.target.closest(".card-delete")) return;
        openTaskModal(cardEl.getAttribute("data-id"));
      });
    });

    container.querySelectorAll(".card-delete").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (!confirm("¿Eliminar esta tarea?")) return;
        const { error } = await supabaseClient.from("tasks").delete().eq("id", id);
        if (error) { showBanner("No se pudo eliminar la tarea.", true); return; }
        await loadAll();
      });
    });
  });
}

function priorityColors(p) {
  if (p === "alta") return { bg: "var(--red-light)", fg: "var(--red)" };
  if (p === "baja") return { bg: "var(--gray-100)", fg: "var(--gray-500)" };
  return { bg: "var(--amber-light)", fg: "var(--amber)" };
}
function priorityLabel(p) {
  return p === "alta" ? "Alta" : p === "baja" ? "Baja" : "Media";
}

function cardHtml(task) {
  const project = projects.find(p => p.id === task.project_id);
  const projColor = project ? project.color : "#6b7280";
  const projName = project ? project.name : "Sin proyecto";
  const pr = priorityColors(task.priority);
  const initial = (project ? project.name : "?").trim().charAt(0).toUpperCase() || "?";
  const dueText = task.due_date ? formatDate(task.due_date) : "Sin fecha";

  return `
    <div class="card" draggable="true" data-id="${task.id}">
      <div class="card-top">
        <span class="badge" style="background:${hexToRgba(projColor, 0.14)};color:${projColor};">${escapeHtml(projName)}</span>
        <span class="badge" style="background:${pr.bg};color:${pr.fg};">${priorityLabel(task.priority)}</span>
        <button class="card-delete" data-id="${task.id}" title="Eliminar">✕</button>
      </div>
      <p class="card-title">${escapeHtml(task.title)}</p>
      <div class="card-bottom">
        <span class="due">${task.status === "done" ? "Completado" : "Vence"} ${task.status === "done" ? "" : ""}${dueText}</span>
        <span class="avatar" style="background:${projColor};">${initial}</span>
      </div>
    </div>
  `;
}

// ---------- Drag and drop entre columnas ----------

document.querySelectorAll(".column").forEach(col => {
  col.addEventListener("dragover", (e) => e.preventDefault());
  col.addEventListener("drop", async (e) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const newStatus = col.getAttribute("data-status");
    const { error } = await supabaseClient.from("tasks").update({ status: newStatus }).eq("id", draggedTaskId);
    draggedTaskId = null;
    if (error) { showBanner("No se pudo mover la tarea.", true); return; }
    await loadAll();
  });
});

// ---------- Modal de tarea ----------

const taskModal = document.getElementById("task-modal");
function openTaskModal(taskId, defaultStatus) {
  document.getElementById("task-modal-title").textContent = taskId ? "Editar tarea" : "Nueva tarea";
  document.getElementById("task-id").value = taskId || "";

  if (taskId) {
    const t = tasks.find(t => t.id === taskId);
    document.getElementById("task-title").value = t.title;
    document.getElementById("task-project").value = t.project_id || "";
    document.getElementById("task-priority").value = t.priority;
    document.getElementById("task-due").value = t.due_date || "";
    document.getElementById("task-status").value = t.status;
  } else {
    document.getElementById("task-title").value = "";
    if (projects[0]) document.getElementById("task-project").value = projects[0].id;
    document.getElementById("task-priority").value = "media";
    document.getElementById("task-due").value = "";
    document.getElementById("task-status").value = defaultStatus || "todo";
  }
  taskModal.classList.add("open");
}
function closeTaskModal() { taskModal.classList.remove("open"); }

document.getElementById("new-task-btn").addEventListener("click", () => {
  if (projects.length === 0) { showBanner("Crea primero un proyecto en 'Proyectos'.", true); return; }
  openTaskModal(null, "todo");
});
document.querySelectorAll(".add-task").forEach(btn => {
  btn.addEventListener("click", () => {
    if (projects.length === 0) { showBanner("Crea primero un proyecto en 'Proyectos'.", true); return; }
    openTaskModal(null, btn.getAttribute("data-status"));
  });
});
document.getElementById("task-cancel-btn").addEventListener("click", closeTaskModal);

document.getElementById("task-save-btn").addEventListener("click", async () => {
  const id = document.getElementById("task-id").value;
  const payload = {
    title: document.getElementById("task-title").value.trim(),
    project_id: document.getElementById("task-project").value || null,
    priority: document.getElementById("task-priority").value,
    due_date: document.getElementById("task-due").value || null,
    status: document.getElementById("task-status").value,
  };
  if (!payload.title) { showBanner("El título de la tarea es obligatorio.", true); return; }

  let error;
  if (id) {
    ({ error } = await supabaseClient.from("tasks").update(payload).eq("id", id));
  } else {
    ({ error } = await supabaseClient.from("tasks").insert(payload));
  }
  if (error) { showBanner("No se pudo guardar la tarea.", true); console.error(error); return; }
  closeTaskModal();
  await loadAll();
});

// ---------- Modal de proyectos ----------

const projectModal = document.getElementById("project-modal");
document.getElementById("manage-projects-btn").addEventListener("click", () => projectModal.classList.add("open"));
document.getElementById("project-close-btn").addEventListener("click", () => projectModal.classList.remove("open"));

document.getElementById("add-project-btn").addEventListener("click", async () => {
  const name = document.getElementById("new-project-name").value.trim();
  const color = document.getElementById("new-project-color").value;
  if (!name) return;
  const { error } = await supabaseClient.from("projects").insert({ name, color });
  if (error) { showBanner("No se pudo crear el proyecto.", true); return; }
  document.getElementById("new-project-name").value = "";
  await loadAll();
});

// ---------- Filtro de proyecto ----------

document.getElementById("project-filter").addEventListener("change", (e) => {
  activeProjectId = e.target.value;
  const subtitle = document.getElementById("project-subtitle");
  subtitle.textContent = activeProjectId === "all"
    ? "Todos los proyectos"
    : (projects.find(p => p.id === activeProjectId)?.name || "");
  renderBoard();
});

// ---------- Utilidades ----------

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

// ---------- Inicio ----------

loadAll();
