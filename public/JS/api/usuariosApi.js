// ============================================================
// CAPA API — usuariosApi.js
// Responsabilidad: comunicación HTTP con los endpoints de usuarios.
// ============================================================

const URL_BASE = 'http://localhost:3001';

/**
 * Obtiene la lista completa de usuarios del sistema.
 * @returns {Array} Lista de usuarios.
 */
export async function obtenerTodosLosUsuarios() {
    const respuesta = await fetch(`${URL_BASE}/api/users`);
    if (!respuesta.ok) throw new Error('Error al obtener la lista de usuarios');
    return respuesta.json();
}

/**
 * Crea un nuevo usuario en el servidor.
 * @param {Object} datos - { nombre, correo, documento, rol }
 * @returns {Object} El usuario creado con su ID.
 */
export async function crearUsuarioEnServidor(datos) {
    const respuesta = await fetch(`${URL_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) throw new Error('Error al crear el usuario');
    return respuesta.json();
}

/**
 * Actualiza completamente un usuario existente (PUT).
 * @param {number} id - ID del usuario a actualizar.
 * @param {Object} datos - Datos nuevos del usuario.
 * @returns {Object} El usuario actualizado.
 */
export async function actualizarUsuarioEnServidor(id, datos) {
    const respuesta = await fetch(`${URL_BASE}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) throw new Error('Error al actualizar el usuario');
    return respuesta.json();
}

/**
 * Elimina un usuario del servidor.
 * @param {number} id - ID del usuario a eliminar.
 * @returns {boolean} true si se eliminó correctamente.
 */
export async function eliminarUsuarioEnServidor(id) {
    const respuesta = await fetch(`${URL_BASE}/api/users/${id}`, { method: 'DELETE' });
    return respuesta.ok;
}

/**
 * Activa o desactiva un usuario (PATCH).
 * @param {number} id - ID del usuario.
 * @param {boolean} activo - true para activar, false para desactivar.
 * @returns {Object} El usuario con el estado actualizado.
 */
export async function cambiarEstadoUsuarioEnServidor(id, activo) {
    const respuesta = await fetch(`${URL_BASE}/api/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo })
    });
    if (!respuesta.ok) throw new Error('Error al cambiar el estado del usuario');
    return respuesta.json();
}
