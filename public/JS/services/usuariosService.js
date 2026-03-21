// ============================================================
// CAPA SERVICIOS — usuariosService.js
// Responsabilidad: lógica de negocio para la gestión de usuarios.
// Coordina entre la capa API (usuariosApi) y la capa UI (usuariosUI).
// ============================================================

// Se importan las funciones de la capa API para comunicarse con el servidor
import {
    obtenerTodosLosUsuarios,
    crearUsuarioEnServidor,
    actualizarUsuarioEnServidor,
    eliminarUsuarioEnServidor,
    cambiarEstadoUsuarioEnServidor
} from '../api/usuariosApi.js';

// Se importan las funciones de la capa UI para manipular el DOM
import {
    renderizarTablaUsuarios,
    abrirModalUsuario,
    cerrarModalUsuario
} from '../ui/usuariosUI.js';

// Se importan las funciones de notificación para mostrar mensajes al usuario
import { notificarExito, notificarError } from '../utils/notificaciones.js';

// ============================================================
// ESTADO INTERNO
// ============================================================

// Variable privada que almacena todos los usuarios en memoria local
// Se usa como caché para evitar peticiones innecesarias al servidor
let _todosLosUsuarios = [];

// ============================================================
// CARGAR Y RENDERIZAR
// ============================================================

/**
 * Obtiene todos los usuarios y los muestra en la tabla.
 * @param {Object} manejadores - Callbacks para editar, eliminar, cambiar estado.
 */
export async function cargarTodosLosUsuarios(manejadores) {
    try {
        // Se obtienen todos los usuarios del servidor mediante la API
        _todosLosUsuarios = await obtenerTodosLosUsuarios();
        // Se renderizan los usuarios en la tabla del DOM
        renderizarTablaUsuarios(_todosLosUsuarios, manejadores);
    } catch (error) {
        // Si hay error de conexión, se muestra una notificación de error
        notificarError('No se pudo cargar la lista de usuarios.');
    }
}

/**
 * Devuelve la caché local de usuarios (para poblar selectores).
 * @returns {Array}
 */
export function obtenerUsuariosCacheados() {
    // Se retorna la lista de usuarios almacenada en memoria sin hacer otra petición
    return _todosLosUsuarios;
}

// ============================================================
// CREAR USUARIO
// ============================================================

/**
 * Crea un usuario en el servidor y refresca la tabla.
 * @param {Object} datos - Datos del formulario.
 * @param {Object} manejadores
 */
export async function crearUsuario(datos, manejadores) {
    // Se envían los datos al servidor para crear el nuevo usuario
    const usuarioCreado = await crearUsuarioEnServidor(datos);
    // Se recargan todos los usuarios para sincronizar la tabla con el servidor
    await cargarTodosLosUsuarios(manejadores);
    // Se cierra el modal de creación/edición
    cerrarModalUsuario();
    // Se muestra una notificación de éxito con el nombre del usuario creado
    notificarExito(`Usuario "${usuarioCreado.nombre}" creado correctamente.`);
}

// ============================================================
// EDITAR USUARIO
// ============================================================

/**
 * Abre el modal pre-rellenado con los datos del usuario a editar.
 * @param {Object} usuario
 */
export function iniciarEdicionUsuario(usuario) {
    // Se abre el modal pasando el usuario para que se pre-rellene en modo edición
    abrirModalUsuario(usuario);
}

/**
 * Envía los cambios al servidor y refresca la tabla.
 * @param {number} id
 * @param {Object} datos
 * @param {Object} manejadores
 */
export async function guardarEdicionUsuario(id, datos, manejadores) {
    // Se envían los datos actualizados al servidor
    const usuarioActualizado = await actualizarUsuarioEnServidor(id, datos);
    // Se recargan todos los usuarios para sincronizar la tabla
    await cargarTodosLosUsuarios(manejadores);
    // Se cierra el modal de edición
    cerrarModalUsuario();
    // Se muestra una notificación de éxito
    notificarExito(`Usuario "${usuarioActualizado.nombre}" actualizado correctamente.`);
}

// ============================================================
// ELIMINAR USUARIO
// ============================================================

/**
 * Pide confirmación y elimina el usuario del servidor.
 * @param {number} id
 * @param {Object} manejadores
 */
export async function eliminarUsuario(id, manejadores) {
    // Se pide confirmación al usuario antes de eliminar
    const confirmado = confirm('¿Estás seguro de que deseas eliminar este usuario?');
    // Si el usuario cancela, se detiene la ejecución
    if (!confirmado) return;

    try {
        // Se envía la petición DELETE al servidor
        const eliminado = await eliminarUsuarioEnServidor(id);
        if (eliminado) {
            // Si se eliminó correctamente, se recarga la tabla
            await cargarTodosLosUsuarios(manejadores);
            // Se muestra una notificación de éxito
            notificarExito('Usuario eliminado correctamente.');
        } else {
            // Si el servidor no pudo eliminar, se muestra un error
            notificarError('No se pudo eliminar el usuario en el servidor.');
        }
    } catch (error) {
        // Si hay error de conexión, se muestra la notificación
        notificarError('Error de conexión al intentar eliminar el usuario.');
    }
}

// ============================================================
// ACTIVAR / DESACTIVAR USUARIO
// ============================================================

/**
 * Cambia el estado activo/inactivo de un usuario.
 * @param {number} id
 * @param {boolean} activo - Nuevo estado deseado.
 * @param {Object} manejadores
 */
export async function cambiarEstadoUsuario(id, activo, manejadores) {
    try {
        // Se envía la petición PATCH al servidor para cambiar el estado
        const usuarioActualizado = await cambiarEstadoUsuarioEnServidor(id, activo);
        // Se recarga la tabla para reflejar el cambio
        await cargarTodosLosUsuarios(manejadores);
        // Se determina el texto de la acción según el nuevo estado
        const accion = activo ? 'activado' : 'desactivado';
        // Se muestra una notificación de éxito con el nombre y la acción realizada
        notificarExito(`Usuario "${usuarioActualizado.nombre}" ${accion} correctamente.`);
    } catch (error) {
        // Si hay error, se muestra la notificación
        notificarError('No se pudo cambiar el estado del usuario.');
    }
}
