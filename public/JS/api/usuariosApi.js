// ============================================================
// CAPA API — usuariosApi.js
// Responsabilidad: comunicación HTTP con los endpoints de usuarios.
// ============================================================


// URL base del servidor backend donde corren los endpoints
const URL_BASE = 'http://localhost:3000/api';

/**
 * Obtiene la lista completa de usuarios del sistema.
 * @returns {Array} Lista de usuarios.
 */
export async function obtenerTodosLosUsuarios() {
    // Se hace una petición GET al endpoint /usuarios para traer todos los usuarios
    const respuesta = await fetch(`${URL_BASE}/users`);
    // Si la respuesta no es exitosa (código 4xx o 5xx), se lanza un error
    if (!respuesta.ok) throw new Error('Error al obtener la lista de usuarios');
    const json = await respuesta.json();
    return json.data;
}

/**
 * Crea un nuevo usuario en el servidor.
 * @param {Object} datos - { nombre, correo, documento, rol }
 * @returns {Object} El usuario creado con su ID.
 */
export async function crearUsuarioEnServidor(datos) {
    // Se hace una petición POST al endpoint /usuarios para crear un nuevo usuario
    const respuesta = await fetch(`${URL_BASE}/users`, {
        // Método POST indica que se está creando un nuevo recurso
        method: 'POST',
        // Se indica que el cuerpo de la petición es JSON
        headers: { 'Content-Type': 'application/json' },
        // Se convierten los datos del formulario a una cadena JSON
        body: JSON.stringify(datos)
    });
    // Si la respuesta falla, se lanza un error descriptivo
    if (!respuesta.ok) throw new Error('Error al crear el usuario');
    const json = await respuesta.json();
    return json.data;
}

/**
 * Actualiza completamente un usuario existente (PUT).
 * @param {number} id - ID del usuario a actualizar.
 * @param {Object} datos - Datos nuevos del usuario.
 * @returns {Object} El usuario actualizado.
 */
export async function actualizarUsuarioEnServidor(id, datos) {
    // Se hace una petición PUT al usuario específico usando su ID en la URL
    const respuesta = await fetch(`${URL_BASE}/users/${id}`, {
        // PUT reemplaza completamente el recurso con los nuevos datos
        method: 'PUT',
        // Se indica que el contenido enviado es JSON
        headers: { 'Content-Type': 'application/json' },
        // Se envían los datos actualizados como cadena JSON
        body: JSON.stringify(datos)
    });
    // Si la respuesta no es exitosa, se lanza un error
    if (!respuesta.ok) throw new Error('Error al actualizar el usuario');
    const json = await respuesta.json();
    return json.data;
}

/**
 * Elimina un usuario del servidor.
 * @param {number} id - ID del usuario a eliminar.
 * @returns {boolean} true si se eliminó correctamente.
 */
export async function eliminarUsuarioEnServidor(id) {
    // Se hace una petición DELETE al usuario específico usando su ID
    const respuesta = await fetch(`${URL_BASE}/users/${id}`, { method: 'DELETE' });
    // Se retorna true si la eliminación fue exitosa, false si no
    return respuesta.ok;
}

/**
 * Activa o desactiva un usuario (PATCH).
 * @param {number} id - ID del usuario.
 * @param {boolean} activo - true para activar, false para desactivar.
 * @returns {Object} El usuario con el estado actualizado.
 */
export async function cambiarEstadoUsuarioEnServidor(id, activo) {
    // Se hace una petición PATCH para modificar parcialmente el usuario (solo el campo activo)
    const respuesta = await fetch(`${URL_BASE}/users/${id}/status`, {
        // PATCH actualiza solo los campos enviados, sin reemplazar todo el recurso
        method: 'PATCH',
    
        headers: {'Content-Type': 'application/json'},
    // Se envía solo el campo activo con su nuevo valor (true o false)
        body: JSON.stringify({ estado: activo ? 'activo' : 'inactivo' })
    });
    // Si la respuesta falla, se lanza un error
    if (!respuesta.ok) throw new Error('Error al cambiar el estado del usuario');
    const json = await respuesta.json();
    return json.data;
}
