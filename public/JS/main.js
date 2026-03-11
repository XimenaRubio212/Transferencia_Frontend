// ============================================================
// PUNTO DE ENTRADA — main.js
// Responsabilidad: conectar la interfaz con los servicios.
// Aquí se define el estado global, las reglas de validación
// y los event listeners de los formularios.
// ============================================================

import { validar } from './utils/validaciones.js';
import {
    mostrarErroresTarea,
    limpiarErroresTarea,
    limpiarErrorCampo,
    errorBusqueda,
    inputDocumento,
    inputTitulo,
    inputDescripcion,
    selectorEstado,
    selectorPrioridad
} from './ui/tareasUI.js';
import {
    buscarUsuario,
    cargarTareasDeUsuario,
    crearNuevaTarea,
    editarTarea,
    eliminarTarea,
    aplicarFiltroYOrden,
    exportarTareasVisibles
} from './services/tareasService.js';

// --- Formularios del HTML ---
const formularioBusqueda = document.getElementById('searchForm');
const formularioTarea    = document.getElementById('messageForm');

// --- Controles RF01 / RF02 / RF04 ---
const selectorFiltroEstado = document.getElementById('filtroEstado');
const selectorOrdenCampo   = document.getElementById('ordenCampo');
const selectorOrdenDir     = document.getElementById('ordenDireccion');
const botonExportar        = document.getElementById('btnExportar');

// ============================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ============================================================
const estadoApp = {
    usuarioActual:   null,
    cantidadTareas:  0,
    idTareaEditando: null,
    alEditar:        null,
    alEliminar:      null
};

// --- Manejadores de tarjetas ---
estadoApp.alEditar = function (tarea) {
    inputTitulo.value       = tarea.titulo;
    inputDescripcion.value  = tarea.descripcion;
    selectorEstado.value    = tarea.estado;
    selectorPrioridad.value = tarea.prioridad;
    estadoApp.idTareaEditando = tarea.id;
    inputTitulo.focus();
};

estadoApp.alEliminar = function (id, elementoTarjeta) {
    eliminarTarea(id, elementoTarjeta, estadoApp);
};

// ============================================================
// REGLAS DE VALIDACIÓN
// ============================================================
const reglasDocumento = {
    documento: { required: true, min: 3, max: 15, mensaje: 'El documento es obligatorio' }
};

const reglasTarea = {
    usertarea:    { required: true, min: 3, max: 100, mensaje: 'El título de la tarea es obligatorio' },
    userMessage:  { required: true, min: 5, max: 500, mensaje: 'La descripción es obligatoria' },
    taskStatus:   { required: true, mensaje: 'Selecciona el estado de la tarea' },
    taskPriority: { required: true, mensaje: 'Selecciona la prioridad de la tarea' }
};

// ============================================================
// LIMPIAR ERRORES AL ESCRIBIR
// ============================================================
inputDocumento.addEventListener('input', () => {
    errorBusqueda.textContent = '';
    inputDocumento.classList.remove('error');
});
inputTitulo.addEventListener('input',      () => limpiarErrorCampo('usertarea'));
inputDescripcion.addEventListener('input', () => limpiarErrorCampo('userMessage'));
selectorEstado.addEventListener('change',  () => limpiarErrorCampo('taskStatus'));
selectorPrioridad.addEventListener('change', () => limpiarErrorCampo('taskPriority'));

// ============================================================
// FORMULARIO DE BÚSQUEDA
// ============================================================
formularioBusqueda.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const { valido, errores } = validar(formularioBusqueda, reglasDocumento);
    if (!valido) {
        inputDocumento.classList.add('error');
        errorBusqueda.textContent = errores.documento ?? 'Documento inválido';
        return;
    }

    inputDocumento.classList.remove('error');
    const documento = inputDocumento.value.trim();
    await buscarUsuario(documento, estadoApp);
});

// ============================================================
// FORMULARIO DE CREACIÓN / EDICIÓN DE TAREAS
// ============================================================
formularioTarea.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (!estadoApp.usuarioActual) {
        alert('Primero debes buscar un usuario para asignarle tareas.');
        return;
    }

    const { valido, errores } = validar(formularioTarea, reglasTarea);
    if (!valido) {
        mostrarErroresTarea(errores);
        return;
    }

    limpiarErroresTarea();

    const datosTarea = {
        userId:      estadoApp.usuarioActual.id,
        titulo:      inputTitulo.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        estado:      selectorEstado.value,
        prioridad:   selectorPrioridad.value
    };

    try {
        if (estadoApp.idTareaEditando) {
            await editarTarea(estadoApp.idTareaEditando, datosTarea, estadoApp);
            estadoApp.idTareaEditando = null;
        } else {
            await crearNuevaTarea(datosTarea, estadoApp);
        }
        formularioTarea.reset();
        limpiarErroresTarea();
    } catch (error) {
        alert('No se pudo guardar la tarea en el servidor.');
    }
});

// ============================================================
// RF01 + RF02 — FILTROS Y ORDENAMIENTO
// ============================================================

/**
 * Lee los controles del HTML y aplica filtros + orden
 * sobre las tareas en pantalla sin recargar la página.
 */
function aplicarControles() {
    if (!estadoApp.usuarioActual) return;

    const criterios = {
        estado: selectorFiltroEstado?.value ?? 'todos'
    };

    const ordenConfig = {
        campo:     selectorOrdenCampo?.value    ?? 'id',
        direccion: selectorOrdenDir?.value ?? 'asc'
    };

    aplicarFiltroYOrden(criterios, ordenConfig, estadoApp);
}

selectorFiltroEstado?.addEventListener('change', aplicarControles);
selectorOrdenCampo?.addEventListener('change',   aplicarControles);
selectorOrdenDir?.addEventListener('change',  aplicarControles);

// ============================================================
// RF04 — EXPORTAR TAREAS
// ============================================================
botonExportar?.addEventListener('click', () => {
    exportarTareasVisibles();
});
