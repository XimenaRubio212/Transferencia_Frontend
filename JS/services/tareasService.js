// ============================================================
// CAPA SERVICIOS — tareasService.js
// ============================================================

import {
    obtenerUsuarioPorDocumento,
    obtenerTareasPorUsuario,
    crearTareaEnServidor,
    actualizarTareaEnServidor,
    borrarTareaEnServidor
} from '../api/tareasApi.js';

import {
    crearTarjetaTarea,
    mostrarInfoUsuario,
    actualizarContador,
    limpiarContenedorTareas,
    mostrarErrorBusqueda,
    contenedorTareas
} from '../ui/tareasUI.js';

import { notificarExito, notificarError, notificarInfo } from '../utils/notificaciones.js';
import { aplicarFiltrosYOrden } from '../utils/filtros.js';
import { exportarTareasComoJSON, obtenerTareasVisiblasDelDOM } from '../utils/exportaciones.js';

// ============================================================
// ESTADO INTERNO DEL SERVICIO
// Guarda la lista completa de tareas para filtrar/ordenar
// sin hacer peticiones adicionales al servidor.
// ============================================================
let _todasLasTareas = [];

// ============================================================
// BÚSQUEDA DE USUARIO
// ============================================================

export async function buscarUsuario(documento, estadoApp) {
    try {
        const usuario = await obtenerUsuarioPorDocumento(documento);

        if (usuario) {
            estadoApp.usuarioActual = usuario;
            mostrarInfoUsuario(usuario);
            await cargarTareasDeUsuario(usuario.id, estadoApp);
            notificarExito(`Usuario "${usuario.nombre}" encontrado.`);
        } else {
            estadoApp.usuarioActual = null;
            _todasLasTareas = [];
            mostrarErrorBusqueda('No existe un usuario con ese documento.');
            estadoApp.cantidadTareas = 0;
            notificarError('No se encontró ningún usuario con ese documento.');
        }
    } catch (error) {
        estadoApp.usuarioActual = null;
        _todasLasTareas = [];
        mostrarErrorBusqueda('Error de conexión con el servidor.');
        estadoApp.cantidadTareas = 0;
        // notificarError('Error de conexión con el servidor.');
    }
}

// ============================================================
// CARGA DE TAREAS
// ============================================================

export async function cargarTareasDeUsuario(idUsuario, estadoApp) {
    const tareas = await obtenerTareasPorUsuario(idUsuario);
    _todasLasTareas = tareas;
    _renderizarTareas(tareas, estadoApp);
}

// ============================================================
// RF01 + RF02 – FILTRO Y ORDENAMIENTO
// ============================================================

export function aplicarFiltroYOrden(criterios, ordenConfig, estadoApp) {
    const resultado = aplicarFiltrosYOrden(_todasLasTareas, criterios, ordenConfig);
    _renderizarTareas(resultado, estadoApp);
    notificarInfo(`Mostrando ${resultado.length} tarea(s) con los filtros aplicados.`);
}

// ============================================================
// RF04 – EXPORTACIÓN
// ============================================================

export function exportarTareasVisibles() {
    try {
        const tareas = obtenerTareasVisiblasDelDOM(contenedorTareas);
        exportarTareasComoJSON(tareas, 'tareas');
        notificarExito(`Se exportaron ${tareas.length} tarea(s) en formato JSON.`);
    } catch (error) {
        notificarError(error.message);
    }
}

// ============================================================
// CREAR TAREA
// ============================================================

export async function crearNuevaTarea(datosTarea, estadoApp) {
    const tareaCreada = await crearTareaEnServidor(datosTarea);
    _todasLasTareas.push(tareaCreada);

    const nuevaTarjeta = crearTarjetaTarea(tareaCreada, {
        alEditar: estadoApp.alEditar,
        alEliminar: estadoApp.alEliminar
    });
    contenedorTareas.appendChild(nuevaTarjeta);
    estadoApp.cantidadTareas++;
    actualizarContador(estadoApp.cantidadTareas);
    notificarExito('Tarea creada correctamente.');
}

// ============================================================
// EDITAR TAREA
// ============================================================

export async function editarTarea(id, datosTarea, estadoApp) {
    const tareaActualizada = await actualizarTareaEnServidor(id, datosTarea);

    const indice = _todasLasTareas.findIndex(t => t.id === id);
    if (indice !== -1) _todasLasTareas[indice] = tareaActualizada;

    const tarjetaAnterior = contenedorTareas.querySelector(`[data-id="${id}"]`);
    if (tarjetaAnterior) {
        const tarjetaNueva = crearTarjetaTarea(tareaActualizada, {
            alEditar: estadoApp.alEditar,
            alEliminar: estadoApp.alEliminar
        });
        tarjetaAnterior.replaceWith(tarjetaNueva);
    }
    notificarExito('Tarea actualizada correctamente.');
}

// ============================================================
// ELIMINAR TAREA
// ============================================================

export async function eliminarTarea(id, elementoTarjeta, estadoApp) {
    const confirmado = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
    if (!confirmado) return;

    try {
        const eliminado = await borrarTareaEnServidor(id);

        if (eliminado) {
            _todasLasTareas = _todasLasTareas.filter(t => t.id !== id);
            elementoTarjeta.classList.add('eliminando');
            elementoTarjeta.addEventListener('transitionend', () => {
                elementoTarjeta.remove();
                estadoApp.cantidadTareas = Math.max(0, estadoApp.cantidadTareas - 1);
                actualizarContador(estadoApp.cantidadTareas);
            }, { once: true });
            notificarExito('Tarea eliminada correctamente.');
        } else {
            notificarError('No se pudo eliminar la tarea en el servidor.');
        }
    } catch (error) {
        notificarError('Error de conexión al intentar eliminar.');
    }
}

// ============================================================
// UTILIDAD INTERNA
// ============================================================

function _renderizarTareas(tareas, estadoApp) {
    limpiarContenedorTareas();

    const fragmento = document.createDocumentFragment();
    tareas.forEach(tarea => {
        const tarjeta = crearTarjetaTarea(tarea, {
            alEditar: estadoApp.alEditar,
            alEliminar: estadoApp.alEliminar
        });
        fragmento.appendChild(tarjeta);
    });
    contenedorTareas.appendChild(fragmento);

    estadoApp.cantidadTareas = tareas.length;
    actualizarContador(estadoApp.cantidadTareas);
}
