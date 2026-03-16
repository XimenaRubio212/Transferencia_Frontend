// ============================================================
// CAPA SERVICIOS — misTareasService.js
// Responsabilidad: lógica de la vista "Mis Tareas" del usuario.
// ============================================================

import { obtenerUsuarioPorDocumento } from '../api/tareasApi.js';
import { obtenerTareasDeUsuario, marcarTareaComoCompletada } from '../api/adminTareasApi.js';

import {
    mostrarInfoUsuarioMisTareas,
    mostrarErrorMisTareas,
    renderizarMisTareas,
    crearTarjetaMiTarea,
    actualizarContadorMisTareas,
    contenedorMisTareas
} from '../ui/misTareasUI.js';

import { notificarExito, notificarError } from '../utils/notificaciones.js';

// ============================================================
// ESTADO INTERNO
// ============================================================
let _misTareas = [];
let _manejadoresActuales = null;

// ============================================================
// BUSCAR USUARIO Y CARGAR SUS TAREAS
// ============================================================

/**
 * Busca al usuario por documento y carga sus tareas asignadas.
 * @param {string} documento
 */
export async function buscarMisTareas(documento) {
    try {
        const usuario = await obtenerUsuarioPorDocumento(documento);

        if (!usuario) {
            mostrarErrorMisTareas('No existe un usuario con ese documento.');
            notificarError('No se encontró ningún usuario con ese documento.');
            return;
        }

        mostrarInfoUsuarioMisTareas(usuario);

        _manejadoresActuales = {
            alMarcarCompletada: (id, tarjeta) => marcarCompletada(id, tarjeta)
        };

        const tareas = await obtenerTareasDeUsuario(usuario.id);
        _misTareas = tareas;
        renderizarMisTareas(tareas, _manejadoresActuales);
        notificarExito(`Se encontraron ${tareas.length} tarea(s) asignadas a "${usuario.nombre}".`);

    } catch (error) {
        mostrarErrorMisTareas('Error de conexión con el servidor.');
        notificarError('No se pudo conectar con el servidor.');
    }
}

// ============================================================
// MARCAR TAREA COMO COMPLETADA
// ============================================================

/**
 * Llama al servidor para marcar la tarea como "Terminado"
 * y actualiza la tarjeta en pantalla sin recargar todo.
 * @param {number} id - ID de la tarea.
 * @param {HTMLElement} tarjeta - Elemento DOM de la tarjeta.
 */
export async function marcarCompletada(id, tarjeta) {
    try {
        const tareaActualizada = await marcarTareaComoCompletada(id);

        // Reemplazar la tarjeta en el DOM con la versión actualizada
        const nuevaTarjeta = crearTarjetaMiTarea(tareaActualizada, _manejadoresActuales);
        tarjeta.replaceWith(nuevaTarjeta);

        // Actualizar estado interno
        const indice = _misTareas.findIndex(t => t.id === id);
        if (indice !== -1) _misTareas[indice] = tareaActualizada;

        notificarExito('Tarea marcada como completada.');

    } catch (error) {
        notificarError('No se pudo actualizar el estado de la tarea.');
    }
}
