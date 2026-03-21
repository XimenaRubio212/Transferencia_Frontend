// ============================================================
// CAPA SERVICIOS — adminTareasService.js
// Responsabilidad: lógica para el panel de gestión de tareas:
// CRUD, filtros y asignación de múltiples usuarios.
// ============================================================

// Se importan las funciones de la capa API para comunicarse con el servidor
import {
    obtenerTodasLasTareas,
    filtrarTareasAdmin,
    crearTareaAdminEnServidor,
    actualizarTareaAdminEnServidor,
    eliminarTareaAdminEnServidor,
    asignarUsuariosATarea
} from '../api/adminTareasApi.js';

// Se importan las funciones de la capa UI para manipular el DOM
import {
    renderizarTablaTareas,
    abrirModalTareaAdmin,
    cerrarModalTareaAdmin,
    obtenerUsuariosSeleccionados
} from '../ui/adminTareasUI.js';

// Se importan las funciones de notificación para mostrar mensajes al usuario
import { notificarExito, notificarError, notificarInfo } from '../utils/notificaciones.js';

// ============================================================
// ESTADO INTERNO
// ============================================================

// Variable privada que almacena todas las tareas del sistema en memoria
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
        // Se obtienen todas las tareas del servidor
        _todasLasTareas = await obtenerTodasLasTareas();
        // Se renderizan las tareas en la tabla del DOM
        renderizarTablaTareas(_todasLasTareas, manejadores);
    } catch (error) {
        // Si hay error de conexión, se muestra una notificación
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
        // Se obtienen las tareas filtradas según los criterios (userId, estado)
        const resultado = await filtrarTareasAdmin(criterios);
        // Se renderizan solo las tareas que pasaron el filtro
        renderizarTablaTareas(resultado, manejadores);
        // Se notifica al usuario cuántas tareas se están mostrando
        notificarInfo(`Mostrando ${resultado.length} tarea(s) con los filtros aplicados.`);
    } catch (error) {
        // Si hay error al filtrar, se muestra la notificación
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
    // Se abre el modal sin tarea (null = modo creación) y con la lista de usuarios
    abrirModalTareaAdmin(null, usuarios);
}

/**
 * Crea la tarea en el servidor y luego asigna los usuarios seleccionados.
 * @param {Object} datosTarea - Datos del formulario (sin usuarios).
 * @param {Object} manejadores
 */
export async function crearTareaAdmin(datosTarea, manejadores) {
    // Se envían los datos al servidor para crear la nueva tarea
    const tareaCreada = await crearTareaAdminEnServidor(datosTarea);

    // Se obtienen los IDs de usuarios seleccionados en el <select multiple>
    const userIds = obtenerUsuariosSeleccionados();
    // Si se seleccionaron usuarios, se intenta asignarlos a la tarea
    if (userIds.length > 0) {
        try {
            // Se envía la petición para asignar los usuarios a la tarea creada
            await asignarUsuariosATarea(tareaCreada.id, userIds);
        } catch {
            // Si falla la asignación pero la tarea ya fue creada:
            // Se agrega la tarea a la lista interna
            _todasLasTareas.push(tareaCreada);
            // Se recarga la tabla para mostrar la tarea sin los usuarios asignados
            await cargarTodasLasTareas(manejadores);
            // Se cierra el modal
            cerrarModalTareaAdmin();
            // Se notifica que la tarea fue creada pero la asignación falló
            notificarError('Tarea creada, pero hubo un error al asignar los usuarios. Edita la tarea para reintentar.');
            // Se detiene la ejecución para no llegar al mensaje de éxito
            return;
        }
    }

    // Se agrega la tarea creada a la lista interna
    _todasLasTareas.push(tareaCreada);
    // Se recarga toda la tabla para sincronizar con el servidor
    await cargarTodasLasTareas(manejadores);
    // Se cierra el modal de creación
    cerrarModalTareaAdmin();
    // Se notifica al usuario que todo fue exitoso
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
    // Se abre el modal en modo edición con los datos de la tarea y la lista de usuarios
    abrirModalTareaAdmin(tarea, usuarios);
}

/**
 * Guarda los cambios de la tarea y actualiza la asignación de usuarios.
 * @param {number} id
 * @param {Object} datosTarea
 * @param {Object} manejadores
 */
export async function guardarEdicionTareaAdmin(id, datosTarea, manejadores) {
    // Se envían los datos actualizados al servidor
    const tareaActualizada = await actualizarTareaAdminEnServidor(id, datosTarea);

    // Se obtienen los IDs de usuarios seleccionados en el selector múltiple
    const userIds = obtenerUsuariosSeleccionados();
    try {
        // Se intenta actualizar la asignación de usuarios en el servidor
        await asignarUsuariosATarea(id, userIds);
    } catch {
        // Si falla la reasignación pero la tarea sí fue actualizada:
        // Se actualiza la tarea en la lista interna
        const indice = _todasLasTareas.findIndex(t => t.id === id);
        if (indice !== -1) _todasLasTareas[indice] = tareaActualizada;
        // Se recarga la tabla
        await cargarTodasLasTareas(manejadores);
        // Se cierra el modal
        cerrarModalTareaAdmin();
        // Se notifica el error parcial
        notificarError('Tarea actualizada, pero hubo un error al guardar la asignación de usuarios.');
        return;
    }

    // Se actualiza la tarea en la lista interna con la versión del servidor
    const indice = _todasLasTareas.findIndex(t => t.id === id);
    if (indice !== -1) _todasLasTareas[indice] = tareaActualizada;

    // Se recarga la tabla para sincronizar con el servidor
    await cargarTodasLasTareas(manejadores);
    // Se cierra el modal
    cerrarModalTareaAdmin();
    // Se notifica al usuario que todo fue exitoso
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
    // Se pide confirmación al usuario antes de eliminar
    const confirmado = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
    // Si el usuario cancela, se detiene la ejecución
    if (!confirmado) return;

    try {
        // Se envía la petición DELETE al servidor
        const eliminado = await eliminarTareaAdminEnServidor(id);
        if (eliminado) {
            // Se remueve la tarea de la lista interna filtrando por ID
            _todasLasTareas = _todasLasTareas.filter(t => t.id !== id);
            // Se re-renderiza la tabla sin la tarea eliminada
            renderizarTablaTareas(_todasLasTareas, manejadores);
            // Se notifica al usuario que la tarea fue eliminada
            notificarExito('Tarea eliminada correctamente.');
        } else {
            // Si el servidor no pudo eliminar, se muestra un error
            notificarError('No se pudo eliminar la tarea en el servidor.');
        }
    } catch (error) {
        // Si hay error de conexión, se muestra la notificación
        notificarError('Error de conexión al intentar eliminar la tarea.');
    }
}
