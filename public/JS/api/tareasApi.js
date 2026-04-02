// ============================================================
// CAPA API — tareasApi.js
// Responsabilidad: ÚNICA capa que se comunica con el servidor.
// Todas las funciones retornan una Promesa con los datos o
// lanzan un Error si la respuesta HTTP no fue exitosa.
// ============================================================

// URL base del servidor backend donde se encuentran los endpoints
const URL_BASE = 'http://localhost:3000/api';

// --- USUARIOS ---

/**
 * Busca un usuario por su número de documento.
 * @param {string} documento - Número de documento del usuario.
 * @returns {Object|null} El primer usuario encontrado, o null si no existe.
 */
export async function obtenerUsuarioPorDocumento(documento) {
    // Se hace una petición GET para obtener todos los usuarios del servidor
    const respuesta = await fetch(`${URL_BASE}/users`);
    // Si la respuesta no es exitosa (código 4xx o 5xx), se lanza un error
    if (!respuesta.ok) throw new Error('Error al obtener los usuarios');
    // Se convierte la respuesta JSON a un array de objetos de usuarios
    const json = await respuesta.json();
    // Se extrae el array de usuarios de la propiedad data
    const usuarios = json.data;
    // Si se encontró el usuario se retorna, si no se retorna null
    return usuarios.find(u => String(u.documento) === String(documento)) ?? null;
}

// --- TAREAS ---

/**
 * Obtiene todas las tareas asignadas a un usuario.
 * @param {number} idUsuario - ID del usuario propietario de las tareas.
 * @returns {Array} Lista de tareas.
 */
export async function obtenerTareasPorUsuario(idUsuario) {
    // Se hace una petición GET para obtener todas las tareas del servidor
    const respuesta = await fetch(`${URL_BASE}/tasks`);
    // Si la respuesta falla, se lanza un error descriptivo
    if (!respuesta.ok) throw new Error('Error al obtener las tareas');
    // Se convierte la respuesta JSON a un array de tareas
    const json = await respuesta.json();
    // Se extrae el array de tareas de la propiedad data
    const tareas = json.data;
    // Se filtran solo las tareas cuyo userId coincida con el idUsuario recibido
    return tareas.filter(t => String(t.userId) === String(idUsuario));
}

/**
 * Crea una nueva tarea en el servidor.
 * @param {Object} datosTarea - Objeto con los datos de la tarea.
 * @returns {Object} La tarea creada con su ID asignado.
 */
export async function crearTareaEnServidor(datosTarea) {
    // Se hace una petición POST al endpoint de tareas para crear una nueva
    const respuesta = await fetch(`${URL_BASE}/tasks`, {
        // Se indica que el método HTTP es POST (crear recurso)
        method: 'POST',
        // Se establece el encabezado para indicar que el cuerpo es JSON
        headers: { 'Content-Type': 'application/json' },
        // Se convierte el objeto de datos a una cadena JSON para enviarlo al servidor
        body: JSON.stringify(datosTarea)
    });
    // Si la respuesta no es exitosa, se lanza un error
    if (!respuesta.ok) throw new Error('Error al crear la tarea');
    // Se extrae la tarea creada de la propiedad data
    const json = await respuesta.json();
    return json.data;
}

/**
 * Actualiza parcialmente una tarea existente (PATCH).
 * @param {number} id - ID de la tarea a actualizar.
 * @param {Object} cambios - Campos que se van a modificar.
 * @returns {Object} La tarea actualizada.
 */
export async function actualizarTareaEnServidor(id, cambios) {
    // Se hace una petición PUT al endpoint de la tarea específica usando su ID
    const respuesta = await fetch(`${URL_BASE}/tasks/${id}`, {
        // PUT reemplaza completamente el recurso con los nuevos datos
        method: 'PUT',
        // Se indica que el contenido enviado es JSON
        headers: { 'Content-Type': 'application/json' },
        // Se envían los datos actualizados como JSON
        body: JSON.stringify(cambios)
    });
    // Si la respuesta falla, se lanza un error descriptivo
    if (!respuesta.ok) throw new Error('Error al actualizar la tarea');
    // Se extrae la tarea actualizada de la propiedad data
    const json = await respuesta.json();
    return json.data;
}

/**
 * Elimina una tarea del servidor.
 * @param {number} id - ID de la tarea a eliminar.
 * @returns {boolean} true si se eliminó correctamente.
 */
export async function borrarTareaEnServidor(id) {
    // Se hace una petición DELETE al endpoint de la tarea usando su ID
    const respuesta = await fetch(`${URL_BASE}/tasks/${id}`, { method: 'DELETE' });
    // Se retorna true si la respuesta fue exitosa (código 200-299), false si no
    return respuesta.ok;
}
