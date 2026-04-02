// ============================================================
// CAPA SERVICIOS — tareasService.js
// Responsabilidad: lógica de negocio para la vista principal.
// Coordina entre la capa API (tareasApi) y la capa UI (tareasUI).
// ============================================================

// Se importan las funciones de la capa API para comunicarse con el servidor
import {
    obtenerUsuarioPorDocumento,
    obtenerTareasPorUsuario,
    crearTareaEnServidor,
    actualizarTareaEnServidor,
    borrarTareaEnServidor
} from '../api/tareasApi.js';

// Se importan las funciones de la capa UI para manipular el DOM
import {
    crearTarjetaTarea,
    mostrarInfoUsuario,
    actualizarContador,
    limpiarContenedorTareas,
    mostrarErrorBusqueda,
    contenedorTareas
} from '../ui/tareasUI.js';

// Se importan las funciones de notificación para mostrar mensajes al usuario
import { notificarExito, notificarError, notificarInfo } from '../utils/notificaciones.js';
// Se importa la función que aplica filtros y ordenamiento sobre las tareas
import { aplicarFiltrosYOrden } from '../utils/filtros.js';
// Se importan las funciones de exportación para descargar tareas como JSON
import { exportarTareasComoJSON, obtenerTareasVisiblasDelDOM } from '../utils/exportaciones.js';

// ============================================================
// ESTADO INTERNO DEL SERVICIO
// Guarda la lista completa de tareas para filtrar/ordenar
// sin hacer peticiones adicionales al servidor.
// ============================================================

// Variable privada que almacena todas las tareas del usuario actual en memoria
let _todasLasTareas = [];

// ============================================================
// BÚSQUEDA DE USUARIO
// ============================================================

/**
 * Busca un usuario por su documento y carga sus tareas.
 * @param {string} documento - Número de documento a buscar.
 * @param {Object} estadoApp - Estado global de la aplicación.
 */
export async function buscarUsuario(documento, estadoApp) {
    try {
        // Se llama a la API para buscar el usuario por su número de documento
        const usuario = await obtenerUsuarioPorDocumento(documento);

        // Si se encontró el usuario, se actualiza el estado y se cargan sus tareas
        if (usuario) {
            // Se guarda el usuario encontrado en el estado global
            estadoApp.usuarioActual = usuario;
            // Se persiste el usuario en sessionStorage para sobrevivir F5
            sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
            // Se muestra la información del usuario en el panel de la UI
            mostrarInfoUsuario(usuario);
            // Se cargan las tareas asignadas a ese usuario
            await cargarTareasDeUsuario(usuario.id, estadoApp);
            // Se muestra una notificación de éxito con el nombre del usuario
            notificarExito(`Usuario "${usuario.nombre}" encontrado.`);
        } else {
            // Si no se encontró, se limpia el estado del usuario actual
            estadoApp.usuarioActual = null;
            // Se elimina la sesión guardada ya que el usuario no existe
            sessionStorage.removeItem('usuarioActual');
            // Se vacía la lista interna de tareas
            _todasLasTareas = [];
            // Se muestra un mensaje de error en la UI
            mostrarErrorBusqueda('No existe un usuario con ese documento.');
            // Se resetea el contador de tareas a cero
            estadoApp.cantidadTareas = 0;
            // Se muestra una notificación de error al usuario
            notificarError('No se encontró ningún usuario con ese documento.');
        }
    } catch (error) {
        // Si hay un error de conexión, se limpia todo y se muestra el error
        estadoApp.usuarioActual = null;
        sessionStorage.removeItem('usuarioActual');
        _todasLasTareas = [];
        mostrarErrorBusqueda('Error de conexión con el servidor.');
        estadoApp.cantidadTareas = 0;
    }
}

// ============================================================
// CARGA DE TAREAS
// ============================================================

/**
 * Obtiene las tareas del usuario desde el servidor y las renderiza.
 * @param {number} idUsuario - ID del usuario.
 * @param {Object} estadoApp - Estado global de la aplicación.
 */
export async function cargarTareasDeUsuario(idUsuario, estadoApp) {
    // Se obtienen las tareas del servidor filtradas por el ID del usuario
    const tareas = await obtenerTareasPorUsuario(idUsuario);
    // Se guardan las tareas en la variable interna para filtrado/ordenamiento posterior
    _todasLasTareas = tareas;
    // Se renderizan las tareas en el DOM
    _renderizarTareas(tareas, estadoApp);
}

// ============================================================
// RF01 + RF02 – FILTRO Y ORDENAMIENTO
// ============================================================

/**
 * Aplica filtros y ordenamiento sobre las tareas en memoria.
 * @param {Object} criterios - Criterios de filtrado (estado, etc.).
 * @param {Object} ordenConfig - Configuración de orden (campo, dirección).
 * @param {Object} estadoApp - Estado global de la aplicación.
 */
export function aplicarFiltroYOrden(criterios, ordenConfig, estadoApp) {
    // Se aplican los filtros y el ordenamiento sobre la lista completa de tareas
    const resultado = aplicarFiltrosYOrden(_todasLasTareas, criterios, ordenConfig);
    // Se renderizan solo las tareas que pasaron el filtro
    _renderizarTareas(resultado, estadoApp);
    // Se notifica al usuario cuántas tareas se están mostrando
    notificarInfo(`Mostrando ${resultado.length} tarea(s) con los filtros aplicados.`);
}

// ============================================================
// RF04 – EXPORTACIÓN
// ============================================================

/**
 * Exporta las tareas visibles en pantalla como archivo JSON descargable.
 */
export function exportarTareasVisibles() {
    try {
        // Se extraen los datos de las tarjetas visibles en el DOM
        const tareas = obtenerTareasVisiblasDelDOM(contenedorTareas);
        // Se genera y descarga el archivo JSON con las tareas
        exportarTareasComoJSON(tareas, 'tareas');
        // Se notifica al usuario cuántas tareas se exportaron
        notificarExito(`Se exportaron ${tareas.length} tarea(s) en formato JSON.`);
    } catch (error) {
        // Si no hay tareas o hay un error, se muestra la notificación
        notificarError(error.message);
    }
}

// ============================================================
// CREAR TAREA
// ============================================================

/**
 * Crea una nueva tarea en el servidor y la agrega a la pantalla.
 * @param {Object} datosTarea - Datos del formulario de tarea.
 * @param {Object} estadoApp - Estado global de la aplicación.
 */
export async function crearNuevaTarea(datosTarea, estadoApp) {
    // Se envían los datos al servidor y se recibe la tarea creada con su ID
    const tareaCreada = await crearTareaEnServidor(datosTarea);
    // Se agrega la tarea creada a la lista interna en memoria
    _todasLasTareas.push(tareaCreada);

    // Se crea una tarjeta visual para la nueva tarea con sus botones de acción
    const nuevaTarjeta = crearTarjetaTarea(tareaCreada, {
        alEditar: estadoApp.alEditar,
        alEliminar: estadoApp.alEliminar
    });
    // Se agrega la tarjeta al contenedor de tareas en el DOM
    contenedorTareas.appendChild(nuevaTarjeta);
    // Se incrementa el contador de tareas en el estado
    estadoApp.cantidadTareas++;
    // Se actualiza el contador visual en la UI
    actualizarContador(estadoApp.cantidadTareas);
    // Se notifica al usuario que la tarea fue creada exitosamente
    notificarExito('Tarea creada correctamente.');
}

// ============================================================
// EDITAR TAREA
// ============================================================

/**
 * Actualiza una tarea existente en el servidor y refresca su tarjeta.
 * @param {number} id - ID de la tarea a editar.
 * @param {Object} datosTarea - Nuevos datos de la tarea.
 * @param {Object} estadoApp - Estado global de la aplicación.
 */
export async function editarTarea(id, datosTarea, estadoApp) {
    // Se envían los datos actualizados al servidor
    const tareaActualizada = await actualizarTareaEnServidor(id, datosTarea);

    // Se busca la tarea en la lista interna y se reemplaza con la versión actualizada
    const indice = _todasLasTareas.findIndex(t => t.id === id);
    if (indice !== -1) _todasLasTareas[indice] = tareaActualizada;

    // Se busca la tarjeta anterior en el DOM usando el atributo data-id
    const tarjetaAnterior = contenedorTareas.querySelector(`[data-id="${id}"]`);
    if (tarjetaAnterior) {
        // Se crea una nueva tarjeta con los datos actualizados
        const tarjetaNueva = crearTarjetaTarea(tareaActualizada, {
            alEditar: estadoApp.alEditar,
            alEliminar: estadoApp.alEliminar
        });
        // Se reemplaza la tarjeta vieja por la nueva en el DOM
        tarjetaAnterior.replaceWith(tarjetaNueva);
    }
    // Se notifica al usuario que la tarea fue actualizada
    notificarExito('Tarea actualizada correctamente.');
}

// ============================================================
// ELIMINAR TAREA
// ============================================================

/**
 * Pide confirmación y elimina una tarea del servidor.
 * @param {number} id - ID de la tarea a eliminar.
 * @param {HTMLElement} elementoTarjeta - Elemento DOM de la tarjeta.
 * @param {Object} estadoApp - Estado global de la aplicación.
 */
export async function eliminarTarea(id, elementoTarjeta, estadoApp) {
    // Se pide confirmación al usuario antes de eliminar
    const confirmado = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
    // Si el usuario cancela, se detiene la ejecución
    if (!confirmado) return;

    try {
        // Se envía la petición DELETE al servidor
        const eliminado = await borrarTareaEnServidor(id);

        if (eliminado) {
            // Se remueve la tarea de la lista interna en memoria
            _todasLasTareas = _todasLasTareas.filter(t => t.id !== id);
            // Se agrega la clase CSS de animación de salida a la tarjeta
            elementoTarjeta.classList.add('eliminando');
            // Se espera a que termine la animación CSS para remover el elemento del DOM
            elementoTarjeta.addEventListener('transitionend', () => {
                // Se elimina la tarjeta del DOM
                elementoTarjeta.remove();
                // Se decrementa el contador de tareas (mínimo 0)
                estadoApp.cantidadTareas = Math.max(0, estadoApp.cantidadTareas - 1);
                // Se actualiza el contador visual en la UI
                actualizarContador(estadoApp.cantidadTareas);
            }, { once: true }); // once: true asegura que el listener se ejecute solo una vez
            // Se notifica al usuario que la tarea fue eliminada
            notificarExito('Tarea eliminada correctamente.');
        } else {
            // Si el servidor no pudo eliminar, se muestra un error
            notificarError('No se pudo eliminar la tarea en el servidor.');
        }
    } catch (error) {
        // Si hay error de conexión, se muestra la notificación
        notificarError('Error de conexión al intentar eliminar.');
    }
}

// ============================================================
// UTILIDAD INTERNA
// ============================================================

/**
 * Limpia el contenedor y renderiza las tarjetas de tareas.
 * @param {Array} tareas - Lista de tareas a renderizar.
 * @param {Object} estadoApp - Estado global de la aplicación.
 */
function _renderizarTareas(tareas, estadoApp) {
    // Se limpian todas las tarjetas existentes del contenedor
    limpiarContenedorTareas();

    // Se crea un DocumentFragment para agregar todas las tarjetas de una vez (mejor rendimiento)
    const fragmento = document.createDocumentFragment();
    // Se recorre cada tarea y se crea su tarjeta visual
    tareas.forEach(tarea => {
        const tarjeta = crearTarjetaTarea(tarea, {
            alEditar: estadoApp.alEditar,
            alEliminar: estadoApp.alEliminar
        });
        // Se agrega la tarjeta al fragmento (no al DOM directamente)
        fragmento.appendChild(tarjeta);
    });
    // Se insertan todas las tarjetas en el DOM de una sola vez
    contenedorTareas.appendChild(fragmento);

    // Se actualiza la cantidad de tareas en el estado global
    estadoApp.cantidadTareas = tareas.length;
    // Se actualiza el contador visual en la UI
    actualizarContador(estadoApp.cantidadTareas);
}
