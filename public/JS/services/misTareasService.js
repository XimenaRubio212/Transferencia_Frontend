// ============================================================
// CAPA SERVICIOS — misTareasService.js
// Responsabilidad: lógica de la vista "Mis Tareas" del usuario.
// Coordina entre la API y la UI para mostrar tareas asignadas.
// ============================================================

// Se importa la función para buscar usuario por documento desde la capa API
import { obtenerUsuarioPorDocumento } from '../api/tareasApi.js';
// Se importan las funciones para obtener tareas y marcar como completada
import { obtenerTareasDeUsuario, marcarTareaComoCompletada } from '../api/adminTareasApi.js';

// Se importan las funciones de la capa UI para manipular el DOM
import {
    mostrarInfoUsuarioMisTareas,
    mostrarErrorMisTareas,
    renderizarMisTareas,
    crearTarjetaMiTarea,
    actualizarContadorMisTareas,
    contenedorMisTareas
} from '../ui/misTareasUI.js';

// Se importan las funciones de notificación para mostrar mensajes al usuario
import { notificarExito, notificarError } from '../utils/notificaciones.js';

// ============================================================
// ESTADO INTERNO
// ============================================================

// Variable privada que almacena las tareas del usuario actual
let _misTareas = [];
// Variable que guarda los manejadores de eventos actuales (marcar completada)
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
        // Se busca el usuario en el servidor usando su número de documento
        const usuario = await obtenerUsuarioPorDocumento(documento);

        // Si no se encontró el usuario, se muestra el error y se detiene
        if (!usuario) {
            // Se muestra el mensaje de error en la UI
            mostrarErrorMisTareas('No existe un usuario con ese documento.');
            // Se muestra una notificación flotante de error
            notificarError('No se encontró ningún usuario con ese documento.');
            // Se detiene la ejecución
            return;
        }

        // Si se encontró, se muestra la información del usuario en el panel
        mostrarInfoUsuarioMisTareas(usuario);

        // Se definen los manejadores de eventos para las tarjetas de tareas
        _manejadoresActuales = {
            // Callback que se ejecuta al hacer clic en "Marcar como completada"
            alMarcarCompletada: (id, tarjeta) => marcarCompletada(id, tarjeta)
        };

        // Se obtienen las tareas asignadas al usuario desde el servidor
        const tareas = await obtenerTareasDeUsuario(usuario.id);
        // Se guardan las tareas en la variable interna
        _misTareas = tareas;
        // Se renderizan las tarjetas de tareas en el DOM
        renderizarMisTareas(tareas, _manejadoresActuales);
        // Se notifica cuántas tareas se encontraron
        notificarExito(`Se encontraron ${tareas.length} tarea(s) asignadas a "${usuario.nombre}".`);

    } catch (error) {
        // Si hay error de conexión, se muestra el mensaje de error
        mostrarErrorMisTareas('Error de conexión con el servidor.');
        // Se muestra una notificación flotante de error
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
        // Se envía la petición PATCH al servidor para cambiar el estado a "Terminado"
        const tareaActualizada = await marcarTareaComoCompletada(id);

        // Se crea una nueva tarjeta con los datos actualizados (estado = Terminado)
        const nuevaTarjeta = crearTarjetaMiTarea(tareaActualizada, _manejadoresActuales);
        // Se reemplaza la tarjeta vieja por la nueva en el DOM
        tarjeta.replaceWith(nuevaTarjeta);

        // Se actualiza la tarea en la lista interna en memoria
        const indice = _misTareas.findIndex(t => t.id === id);
        if (indice !== -1) _misTareas[indice] = tareaActualizada;

        // Se notifica al usuario que la tarea fue completada
        notificarExito('Tarea marcada como completada.');

    } catch (error) {
        // Si hay error, se muestra la notificación
        notificarError('No se pudo actualizar el estado de la tarea.');
    }
}
