// ============================================================
// CAPA SERVICIOS — adminTareasService.js
// Responsabilidad: lógica para el panel de gestión de tareas:
// CRUD, filtros y asignación de múltiples usuarios.
// ============================================================

import {
    obtenerTodasLasTareas,
    filtrarTareasAdmin,
    crearTareaAdminEnServidor,
    actualizarTareaAdminEnServidor,
    eliminarTareaAdminEnServidor,
    asignarUsuariosATarea
} from '../api/adminTareasApi.js';

import {
    renderizarTablaTareas,
    abrirModalTareaAdmin,
    cerrarModalTareaAdmin,
    obtenerUsuariosSeleccionados
} from '../ui/adminTareasUI.js';

import { notificarExito, notificarError, notificarInfo } from '../utils/notificaciones.js';

// ============================================================
// ESTADO INTERNO
// ============================================================
let _todasLasTareas = [];

// ============================================================
// CARGAR Y RENDERIZAR
// ============================================================

/**
 * Obtiene todas las tareas y las muestra en la tabla.
 * @param {Object} manejadores - { alEditar(tarea), alEliminar(id) }
 */
export async function cargarTodasLasTareas(manejadores) {
    try {
        _todasLasTareas = await obtenerTodasLasTareas();
        renderizarTablaTareas(_todasLasTareas, manejadores);
    } catch (error) {
        notificarError('No se pudo cargar la lista de tareas.');
    }
}

// ============================================================
// FILTRAR TAREAS
// ============================================================

/**
 * Solicita tareas filtradas al servidor y refresca la tabla.
 * @param {Object} criterios - { userId?, estado? }
 * @param {Object} manejadores
 */
export async function aplicarFiltroTareasAdmin(criterios, manejadores) {
    try {
        const resultado = await filtrarTareasAdmin(criterios);
        renderizarTablaTareas(resultado, manejadores);
        notificarInfo(`Mostrando ${resultado.length} tarea(s) con los filtros aplicados.`);
    } catch (error) {
        notificarError('Error al filtrar las tareas.');
    }
}

// ============================================================
// CREAR TAREA (con asignación de usuarios)
// ============================================================

/**
 * Abre el modal en modo creación, con la lista de usuarios disponible.
 * @param {Array} usuarios - Lista para el selector múltiple.
 */
export function iniciarCreacionTareaAdmin(usuarios) {
    abrirModalTareaAdmin(null, usuarios);
}

/**
 * Crea la tarea en el servidor y luego asigna los usuarios seleccionados.
 * @param {Object} datosTarea - Datos del formulario (sin usuarios).
 * @param {Object} manejadores
 */
export async function crearTareaAdmin(datosTarea, manejadores) {
    const tareaCreada = await crearTareaAdminEnServidor(datosTarea);

    const userIds = obtenerUsuariosSeleccionados();
    if (userIds.length > 0) {
        try {
            await asignarUsuariosATarea(tareaCreada.id, userIds);
        } catch {
            // La tarea fue creada; solo falla la asignación
            _todasLasTareas.push(tareaCreada);
            await cargarTodasLasTareas(manejadores);
            cerrarModalTareaAdmin();
            notificarError('Tarea creada, pero hubo un error al asignar los usuarios. Edita la tarea para reintentar.');
            return;
        }
    }

    _todasLasTareas.push(tareaCreada);
    await cargarTodasLasTareas(manejadores);
    cerrarModalTareaAdmin();
    notificarExito('Tarea creada y usuarios asignados correctamente.');
}

// ============================================================
// EDITAR TAREA
// ============================================================

/**
 * Abre el modal pre-rellenado con los datos de la tarea.
 * @param {Object} tarea
 * @param {Array} usuarios - Lista de usuarios para el selector.
 */
export function iniciarEdicionTareaAdmin(tarea, usuarios) {
    abrirModalTareaAdmin(tarea, usuarios);
}

/**
 * Guarda los cambios de la tarea y actualiza la asignación de usuarios.
 * @param {number} id
 * @param {Object} datosTarea
 * @param {Object} manejadores
 */
export async function guardarEdicionTareaAdmin(id, datosTarea, manejadores) {
    const tareaActualizada = await actualizarTareaAdminEnServidor(id, datosTarea);

    const userIds = obtenerUsuariosSeleccionados();
    try {
        await asignarUsuariosATarea(id, userIds);
    } catch {
        // La tarea fue actualizada; solo falla la reasignación de usuarios
        const indice = _todasLasTareas.findIndex(t => t.id === id);
        if (indice !== -1) _todasLasTareas[indice] = tareaActualizada;
        await cargarTodasLasTareas(manejadores);
        cerrarModalTareaAdmin();
        notificarError('Tarea actualizada, pero hubo un error al guardar la asignación de usuarios.');
        return;
    }

    const indice = _todasLasTareas.findIndex(t => t.id === id);
    if (indice !== -1) _todasLasTareas[indice] = tareaActualizada;

    await cargarTodasLasTareas(manejadores);
    cerrarModalTareaAdmin();
    notificarExito('Tarea actualizada y asignación guardada correctamente.');
}

// ============================================================
// ELIMINAR TAREA
// ============================================================

/**
 * Pide confirmación y elimina la tarea del servidor.
 * @param {number} id
 * @param {Object} manejadores
 */
export async function eliminarTareaAdmin(id, manejadores) {
    const confirmado = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
    if (!confirmado) return;

    try {
        const eliminado = await eliminarTareaAdminEnServidor(id);
        if (eliminado) {
            _todasLasTareas = _todasLasTareas.filter(t => t.id !== id);
            renderizarTablaTareas(_todasLasTareas, manejadores);
            notificarExito('Tarea eliminada correctamente.');
        } else {
            notificarError('No se pudo eliminar la tarea en el servidor.');
        }
    } catch (error) {
        notificarError('Error de conexión al intentar eliminar la tarea.');
    }
}
