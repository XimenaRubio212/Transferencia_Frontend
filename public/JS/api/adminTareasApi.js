// ============================================================
// CAPA API — adminTareasApi.js
// Responsabilidad: endpoints de tareas para el panel admin
// y la vista de usuario (mis tareas).
// ============================================================

// URL base del servidor backend
const URL_BASE = 'http://localhost:3000';

// --- ADMIN: CRUD TAREAS ---

/**
 * Obtiene todas las tareas del sistema.
 * @returns {Array} Lista completa de tareas.
 */
export async function obtenerTodasLasTareas() {
    // Se hace una petición GET al endpoint /tasks para obtener todas las tareas
    const respuesta = await fetch(`${URL_BASE}/tasks`);
    // Si la respuesta no es exitosa, se lanza un error
    if (!respuesta.ok) throw new Error('Error al obtener las tareas');
    // Se convierte la respuesta a JSON y se retorna el array de tareas
    return respuesta.json();
}

/**
 * Filtra tareas por usuario y/o estado.
 * @param {Object} criterios - { userId?, estado? }
 * @returns {Array} Tareas que coinciden con los filtros.
 */
export async function filtrarTareasAdmin(criterios) {
    // Se obtienen todas las tareas del servidor
    const respuesta = await fetch(`${URL_BASE}/tasks`);
    // Si la respuesta falla, se lanza un error descriptivo
    if (!respuesta.ok) throw new Error('Error al filtrar las tareas');
    // Se convierte la respuesta a un array de tareas
    let tareas = await respuesta.json();

    // Si se proporcionó un userId, se filtran solo las tareas de ese usuario
    if (criterios.userId) {
        // Se comparan como strings para evitar problemas de tipo (number vs string)
        tareas = tareas.filter(t => String(t.userId) === String(criterios.userId));
    }
    // Si se proporcionó un estado y no es 'todos', se filtran por ese estado
    if (criterios.estado && criterios.estado !== 'todos') {
        tareas = tareas.filter(t => t.estado === criterios.estado);
    }
    // Se retorna el array de tareas ya filtrado
    return tareas;
}

/**
 * Crea una nueva tarea (admin).
 * @param {Object} datos - Datos de la tarea.
 * @returns {Object} La tarea creada con su ID.
 */
export async function crearTareaAdminEnServidor(datos) {
    // Se hace una petición POST para crear una nueva tarea en el servidor
    const respuesta = await fetch(`${URL_BASE}/tasks`, {
        // POST indica que se está creando un nuevo recurso
        method: 'POST',
        // Se indica que el cuerpo es JSON
        headers: { 'Content-Type': 'application/json' },
        // Se convierten los datos de la tarea a cadena JSON
        body: JSON.stringify(datos)
    });
    // Si la respuesta no es exitosa, se lanza un error
    if (!respuesta.ok) throw new Error('Error al crear la tarea');
    // Se retorna la tarea creada con su ID asignado
    return respuesta.json();
}

/**
 * Actualiza completamente una tarea (PUT).
 * @param {number} id - ID de la tarea.
 * @param {Object} datos - Datos nuevos de la tarea.
 * @returns {Object} La tarea actualizada.
 */
export async function actualizarTareaAdminEnServidor(id, datos) {
    // Se hace una petición PUT a la tarea específica usando su ID
    const respuesta = await fetch(`${URL_BASE}/tasks/${id}`, {
        // PUT reemplaza completamente los datos de la tarea
        method: 'PUT',
        // Se indica que el contenido es JSON
        headers: { 'Content-Type': 'application/json' },
        // Se envían los nuevos datos de la tarea
        body: JSON.stringify(datos)
    });
    // Si la respuesta falla, se lanza un error
    if (!respuesta.ok) throw new Error('Error al actualizar la tarea');
    // Se retorna la tarea actualizada desde el servidor
    return respuesta.json();
}

/**
 * Elimina una tarea del sistema.
 * @param {number} id - ID de la tarea.
 * @returns {boolean} true si se eliminó correctamente.
 */
export async function eliminarTareaAdminEnServidor(id) {
    // Se hace una petición DELETE a la tarea específica usando su ID
    const respuesta = await fetch(`${URL_BASE}/tasks/${id}`, { method: 'DELETE' });
    // Se retorna true si la eliminación fue exitosa
    return respuesta.ok;
}

/**
 * Asigna múltiples usuarios a una tarea.
 * @param {number} tareaId - ID de la tarea.
 * @param {number[]} userIds - Array con los IDs de usuarios a asignar.
 * @returns {Object} Resultado de la asignación.
 */
export async function asignarUsuariosATarea(tareaId, userIds) {
    // Se hace una petición PATCH para actualizar parcialmente la tarea con los usuarios asignados
    const respuesta = await fetch(`${URL_BASE}/tasks/${tareaId}`, {
        // PATCH modifica solo los campos enviados sin reemplazar toda la tarea
        method: 'PATCH',
        // Se indica que el contenido es JSON
        headers: { 'Content-Type': 'application/json' },
        // Se envía el array de IDs de usuarios a asignar
        body: JSON.stringify({ usuarioIds: userIds })
    });
    // Si la respuesta falla, se lanza un error
    if (!respuesta.ok) throw new Error('Error al asignar usuarios a la tarea');
    // Se retorna el resultado de la asignación
    return respuesta.json();
}

// --- VISTA USUARIO: MIS TAREAS ---

/**
 * Obtiene las tareas asignadas a un usuario específico.
 * @param {number} userId - ID del usuario.
 * @returns {Array} Tareas del usuario.
 */
export async function obtenerTareasDeUsuario(userId) {
    // Se obtienen todas las tareas del servidor
    const respuesta = await fetch(`${URL_BASE}/tasks`);
    // Si la respuesta no es exitosa, se lanza un error
    if (!respuesta.ok) throw new Error('Error al obtener las tareas del usuario');
    // Se convierte la respuesta a un array de tareas
    const tareas = await respuesta.json();
    // Se filtran solo las tareas cuyo userId coincida con el usuario solicitado
    return tareas.filter(t => String(t.userId) === String(userId));
}

/**
 * Marca una tarea como completada (PATCH /status).
 * @param {number} id - ID de la tarea.
 * @returns {Object} La tarea con el estado actualizado.
 */
export async function marcarTareaComoCompletada(id) {
    // Se hace una petición PATCH para cambiar solo el estado de la tarea
    const respuesta = await fetch(`${URL_BASE}/tasks/${id}`, {
        // PATCH modifica parcialmente el recurso
        method: 'PATCH',
        // Se indica que el contenido es JSON
        headers: { 'Content-Type': 'application/json' },
        // Se envía el nuevo estado 'Terminado' para marcar la tarea como completada
        body: JSON.stringify({ estado: 'Terminado' })
    });
    // Si la respuesta falla, se lanza un error
    if (!respuesta.ok) throw new Error('Error al marcar la tarea como completada');
    // Se retorna la tarea con su estado actualizado
    return respuesta.json();
}
