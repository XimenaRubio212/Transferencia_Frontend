// ============================================================
// CAPA SERVICIOS — usuariosService.js
// Responsabilidad: lógica de negocio para la gestión de usuarios.
// Coordina entre usuariosApi y usuariosUI.
// ============================================================

import {
    obtenerTodosLosUsuarios,
    crearUsuarioEnServidor,
    actualizarUsuarioEnServidor,
    eliminarUsuarioEnServidor,
    cambiarEstadoUsuarioEnServidor
} from '../api/usuariosApi.js';

import {
    renderizarTablaUsuarios,
    abrirModalUsuario,
    cerrarModalUsuario
} from '../ui/usuariosUI.js';

import { notificarExito, notificarError } from '../utils/notificaciones.js';

// ============================================================
// ESTADO INTERNO
// ============================================================
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
        _todosLosUsuarios = await obtenerTodosLosUsuarios();
        renderizarTablaUsuarios(_todosLosUsuarios, manejadores);
    } catch (error) {
        notificarError('No se pudo cargar la lista de usuarios.');
    }
}

/**
 * Devuelve la caché local de usuarios (para poblar selectores).
 * @returns {Array}
 */
export function obtenerUsuariosCacheados() {
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
    const usuarioCreado = await crearUsuarioEnServidor(datos);
    await cargarTodosLosUsuarios(manejadores); // re-fetch para sincronizar con el servidor
    cerrarModalUsuario();
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
    abrirModalUsuario(usuario);
}

/**
 * Envía los cambios al servidor y refresca la tabla.
 * @param {number} id
 * @param {Object} datos
 * @param {Object} manejadores
 */
export async function guardarEdicionUsuario(id, datos, manejadores) {
    const usuarioActualizado = await actualizarUsuarioEnServidor(id, datos);
    await cargarTodosLosUsuarios(manejadores); // re-fetch para sincronizar con el servidor
    cerrarModalUsuario();
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
    const confirmado = confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (!confirmado) return;

    try {
        const eliminado = await eliminarUsuarioEnServidor(id);
        if (eliminado) {
            await cargarTodosLosUsuarios(manejadores); // re-fetch para sincronizar con el servidor
            notificarExito('Usuario eliminado correctamente.');
        } else {
            notificarError('No se pudo eliminar el usuario en el servidor.');
        }
    } catch (error) {
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
        const usuarioActualizado = await cambiarEstadoUsuarioEnServidor(id, activo);
        await cargarTodosLosUsuarios(manejadores); // re-fetch para sincronizar con el servidor
        const accion = activo ? 'activado' : 'desactivado';
        notificarExito(`Usuario "${usuarioActualizado.nombre}" ${accion} correctamente.`);
    } catch (error) {
        notificarError('No se pudo cambiar el estado del usuario.');
    }
}
