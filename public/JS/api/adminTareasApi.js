// ============================================================
// CAPA API — adminTareasApi.js
// Responsabilidad: endpoints de tareas para el panel admin
// y la vista de usuario (mis tareas).
// ============================================================

const URL_BASE = 'http://localhost:3000';

// --- ADMIN: CRUD TAREAS ---

/**
 * Obtiene todas las tareas del sistema.
 * @returns {Array} Lista completa de tareas.
 */
export async function obtenerTodasLasTareas() {
    const respuesta = await fetch(`${URL_BASE}/api/tasks`);
    if (!respuesta.ok) throw new Error('Error al obtener las tareas');
    return respuesta.json();
}

/**
 * Filtra tareas por usuario y/o estado.
 * @param {Object} criterios - { userId?, estado? }
 * @returns {Array} Tareas que coinciden con los filtros.
 */
export async function filtrarTareasAdmin(criterios) {
    const params = new URLSearchParams();
    if (criterios.userId)  params.append('userId', criterios.userId);
    if (criterios.estado && criterios.estado !== 'todos') params.append('estado', criterios.estado);

    const respuesta = await fetch(`${URL_BASE}/api/tasks/filter?${params.toString()}`);
    if (!respuesta.ok) throw new Error('Error al filtrar las tareas');
    return respuesta.json();
}

/**
 * Crea una nueva tarea (admin).
 * @param {Object} datos - Datos de la tarea.
 * @returns {Object} La tarea creada con su ID.
 */
export async function crearTareaAdminEnServidor(datos) {
    const respuesta = await fetch(`${URL_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) throw new Error('Error al crear la tarea');
    return respuesta.json();
}

/**
 * Actualiza completamente una tarea (PUT).
 * @param {number} id - ID de la tarea.
 * @param {Object} datos - Datos nuevos de la tarea.
 * @returns {Object} La tarea actualizada.
 */
export async function actualizarTareaAdminEnServidor(id, datos) {
    const respuesta = await fetch(`${URL_BASE}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) throw new Error('Error al actualizar la tarea');
    return respuesta.json();
}

/**
 * Elimina una tarea del sistema.
 * @param {number} id - ID de la tarea.
 * @returns {boolean} true si se eliminó correctamente.
 */
export async function eliminarTareaAdminEnServidor(id) {
    const respuesta = await fetch(`${URL_BASE}/api/tasks/${id}`, { method: 'DELETE' });
    return respuesta.ok;
}

/**
 * Asigna múltiples usuarios a una tarea.
 * @param {number} tareaId - ID de la tarea.
 * @param {number[]} userIds - Array con los IDs de usuarios a asignar.
 * @returns {Object} Resultado de la asignación.
 */
export async function asignarUsuariosATarea(tareaId, userIds) {
    const respuesta = await fetch(`${URL_BASE}/api/tasks/${tareaId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioIds: userIds })
    });
    if (!respuesta.ok) throw new Error('Error al asignar usuarios a la tarea');
    return respuesta.json();
}

// --- VISTA USUARIO: MIS TAREAS ---

/**
 * Obtiene las tareas asignadas a un usuario específico.
 * @param {number} userId - ID del usuario.
 * @returns {Array} Tareas del usuario.
 */
export async function obtenerTareasDeUsuario(userId) {
    const respuesta = await fetch(`${URL_BASE}/api/users/${userId}/tasks`);
    if (!respuesta.ok) throw new Error('Error al obtener las tareas del usuario');
    return respuesta.json();
}

/**
 * Marca una tarea como completada (PATCH /status).
 * @param {number} id - ID de la tarea.
 * @returns {Object} La tarea con el estado actualizado.
 */
export async function marcarTareaComoCompletada(id) {
    const respuesta = await fetch(`${URL_BASE}/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Terminado' })
    });
    if (!respuesta.ok) throw new Error('Error al marcar la tarea como completada');
    return respuesta.json();
}
