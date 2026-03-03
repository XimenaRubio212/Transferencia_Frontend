// ============================================================
// CAPA API — tareasApi.js
// Responsabilidad: ÚNICA capa que se comunica con el servidor.
// Todas las funciones retornan una Promesa con los datos o
// lanzan un Error si la respuesta HTTP no fue exitosa.
// ============================================================

const URL_BASE = 'http://localhost:3001';

// --- USUARIOS ---

/**
 * Busca un usuario por su número de documento.
 * @param {string} documento - Número de documento del usuario.
 * @returns {Object|null} El primer usuario encontrado, o null si no existe.
 */
export async function obtenerUsuarioPorDocumento(documento) {
    const respuesta = await fetch(`${URL_BASE}/usuarios?documento=${encodeURIComponent(documento)}`);
    if (!respuesta.ok) throw new Error('Error al consultar el usuario');
    const usuarios = await respuesta.json();
    return usuarios.length ? usuarios[0] : null;
}

// --- TAREAS ---

/**
 * Obtiene todas las tareas asignadas a un usuario.
 * @param {number} idUsuario - ID del usuario propietario de las tareas.
 * @returns {Array} Lista de tareas.
 */
export async function obtenerTareasPorUsuario(idUsuario) {
    const respuesta = await fetch(`${URL_BASE}/tasks?userId=${idUsuario}`);
    if (!respuesta.ok) throw new Error('Error al obtener las tareas');
    return respuesta.json();
}

/**
 * Crea una nueva tarea en el servidor.
 * @param {Object} datosTarea - Objeto con los datos de la tarea.
 * @returns {Object} La tarea creada con su ID asignado.
 */
export async function crearTareaEnServidor(datosTarea) {
    const respuesta = await fetch(`${URL_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosTarea)
    });
    if (!respuesta.ok) throw new Error('Error al crear la tarea');
    return respuesta.json();
}

/**
 * Actualiza parcialmente una tarea existente (PATCH).
 * @param {number} id - ID de la tarea a actualizar.
 * @param {Object} cambios - Campos que se van a modificar.
 * @returns {Object} La tarea actualizada.
 */
export async function actualizarTareaEnServidor(id, cambios) {
    const respuesta = await fetch(`${URL_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios)
    });
    if (!respuesta.ok) throw new Error('Error al actualizar la tarea');
    return respuesta.json();
}

/**
 * Elimina una tarea del servidor.
 * @param {number} id - ID de la tarea a eliminar.
 * @returns {boolean} true si se eliminó correctamente.
 */
export async function borrarTareaEnServidor(id) {
    const respuesta = await fetch(`${URL_BASE}/tasks/${id}`, { method: 'DELETE' });
    return respuesta.ok;
}