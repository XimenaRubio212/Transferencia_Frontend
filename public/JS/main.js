// ============================================================
// PUNTO DE ENTRADA — main.js
// Responsabilidad: conectar la interfaz con los servicios.
// Aquí se define el estado global, las reglas de validación
// y los event listeners de los formularios.
// ============================================================

// Se importa la función de validación desde el módulo de utilidades
import { validar } from './utils/validaciones.js';

// Se importan las funciones y referencias del DOM desde la capa UI de tareas
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

// Se importan las funciones de la capa de servicios que contienen la lógica de negocio
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
// Se obtiene la referencia al formulario de búsqueda de usuario por su ID
const formularioBusqueda = document.getElementById('searchForm');
// Se obtiene la referencia al formulario de creación/edición de tareas
const formularioTarea    = document.getElementById('messageForm');

// --- Controles RF01 / RF02 / RF04 ---
// Se obtiene el selector de filtro por estado de la tarea
const selectorFiltroEstado = document.getElementById('filtroEstado');
// Se obtiene el selector de campo para ordenar las tareas
const selectorOrdenCampo   = document.getElementById('ordenCampo');
// Se obtiene el selector de dirección de ordenamiento (ascendente/descendente)
const selectorOrdenDir     = document.getElementById('ordenDireccion');
// Se obtiene el botón para exportar las tareas visibles como JSON
const botonExportar        = document.getElementById('btnExportar');

// ============================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ============================================================
// Objeto que mantiene el estado actual de la aplicación en memoria
const estadoApp = {
    usuarioActual:   null,    // Usuario encontrado por documento (o null si no hay)
    cantidadTareas:  0,       // Número de tareas actualmente en pantalla
    idTareaEditando: null,    // ID de la tarea que se está editando (null si es nueva)
    alEditar:        null,    // Callback que se ejecuta al hacer clic en "Editar" una tarjeta
    alEliminar:      null     // Callback que se ejecuta al hacer clic en "Eliminar" una tarjeta
};

// --- Manejadores de tarjetas ---
// Se define la función que se ejecuta cuando el usuario hace clic en "Editar" una tarea
estadoApp.alEditar = function (tarea) {
    // Se pre-rellenan los campos del formulario con los datos de la tarea seleccionada
    inputTitulo.value       = tarea.title;
    inputDescripcion.value  = tarea.description;
    selectorEstado.value    = tarea.estado;
    selectorPrioridad.value = tarea.priority;
    // Se guarda el ID de la tarea para saber que estamos en modo edición
    estadoApp.idTareaEditando = tarea.id;
    // Se pone el foco en el campo de título para que el usuario empiece a editar
    inputTitulo.focus();
};

// Se define la función que se ejecuta cuando el usuario hace clic en "Eliminar" una tarea
estadoApp.alEliminar = function (id, elementoTarjeta) {
    // Se delega la eliminación al servicio, pasando el ID, la tarjeta DOM y el estado
    eliminarTarea(id, elementoTarjeta, estadoApp);
};

// ============================================================
// REGLAS DE VALIDACIÓN
// ============================================================
// Reglas para validar el campo de documento en el formulario de búsqueda
const reglasDocumento = {
    documento: { required: true, min: 3, max: 15, mensaje: 'El documento es obligatorio' }
};

// Reglas para validar los campos del formulario de creación/edición de tareas
const reglasTarea = {
    usertarea:    { required: true, min: 3, max: 100, mensaje: 'El título de la tarea es obligatorio' },
    userMessage:  { required: true, min: 5, max: 500, mensaje: 'La descripción es obligatoria' },
    taskStatus:   { required: true, mensaje: 'Selecciona el estado de la tarea' },
    taskPriority: { required: true, mensaje: 'Selecciona la prioridad de la tarea' }
};

// ============================================================
// LIMPIAR ERRORES AL ESCRIBIR
// ============================================================
// Cuando el usuario escribe en el campo de documento, se limpian los errores de búsqueda
inputDocumento.addEventListener('input', () => {
    // Se borra el texto de error debajo del campo
    errorBusqueda.textContent = '';
    // Se quita la clase CSS de error del campo de entrada
    inputDocumento.classList.remove('error');
});
// Se limpian los errores individuales de cada campo cuando el usuario escribe o cambia valor
inputTitulo.addEventListener('input',      () => limpiarErrorCampo('usertarea'));
inputDescripcion.addEventListener('input', () => limpiarErrorCampo('userMessage'));
selectorEstado.addEventListener('change',  () => limpiarErrorCampo('taskStatus'));
selectorPrioridad.addEventListener('change', () => limpiarErrorCampo('taskPriority'));

// ============================================================
// FORMULARIO DE BÚSQUEDA
// ============================================================
// Se escucha el evento submit del formulario de búsqueda
formularioBusqueda.addEventListener('submit', async (evento) => {
    // Se previene el comportamiento por defecto del formulario (recargar la página)
    evento.preventDefault();

    // Se valida el formulario con las reglas de documento
    const { valido, errores } = validar(formularioBusqueda, reglasDocumento);
    // Si la validación falla, se muestran los errores y se detiene
    if (!valido) {
        // Se marca el campo con la clase CSS de error
        inputDocumento.classList.add('error');
        // Se muestra el mensaje de error debajo del campo
        errorBusqueda.textContent = errores.documento ?? 'Documento inválido';
        return;
    }

    // Se quita la clase de error del campo
    inputDocumento.classList.remove('error');
    // Se obtiene el valor del documento eliminando espacios al inicio y al final
    const documento = inputDocumento.value.trim();
    // Se llama al servicio para buscar el usuario y cargar sus tareas
    await buscarUsuario(documento, estadoApp);
});

// ============================================================
// FORMULARIO DE CREACIÓN / EDICIÓN DE TAREAS
// ============================================================
// Se escucha el evento submit del formulario de tareas
formularioTarea.addEventListener('submit', async (evento) => {
    // Se previene el comportamiento por defecto del formulario
    evento.preventDefault();

    // Se verifica que haya un usuario seleccionado antes de crear/editar una tarea
    if (!estadoApp.usuarioActual) {
        alert('Primero debes buscar un usuario para asignarle tareas.');
        return;
    }

    // Se valida el formulario con las reglas de tarea
    const { valido, errores } = validar(formularioTarea, reglasTarea);
    // Si la validación falla, se muestran los errores en cada campo
    if (!valido) {
        mostrarErroresTarea(errores);
        return;
    }

    // Se limpian los errores visuales antes de proceder
    limpiarErroresTarea();

    // Se construye el objeto con los datos de la tarea desde los campos del formulario
    const datosTarea = {
        userId:      estadoApp.usuarioActual.id,        // ID del usuario al que pertenece la tarea
        title:       inputTitulo.value.trim(),          // Título de la tarea
        description: inputDescripcion.value.trim(),     // Descripción de la tarea
        estado:      selectorEstado.value,              // Estado seleccionado
        priority:    selectorPrioridad.value            // Prioridad seleccionada
    };

    try {
        // Si hay un ID de tarea editando, se actualiza la tarea existente
        if (estadoApp.idTareaEditando) {
            await editarTarea(estadoApp.idTareaEditando, datosTarea, estadoApp);
            // Se limpia el ID de edición para volver al modo de creación
            estadoApp.idTareaEditando = null;
        } else {
            // Si no hay ID, se crea una nueva tarea
            await crearNuevaTarea(datosTarea, estadoApp);
        }
        // Se limpia el formulario después de guardar exitosamente
        formularioTarea.reset();
        // Se limpian los errores visuales
        limpiarErroresTarea();
    } catch (error) {
        // Si hay error de conexión, se muestra una alerta al usuario
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
    // Si no hay usuario seleccionado, no hay tareas que filtrar
    if (!estadoApp.usuarioActual) return;

    // Se construye el objeto de criterios de filtrado desde los selectores del HTML
    const criterios = {
        estado: selectorFiltroEstado?.value ?? 'todos' // Estado seleccionado o 'todos' por defecto
    };

    // Se construye la configuración de ordenamiento desde los selectores del HTML
    const ordenConfig = {
        campo:     selectorOrdenCampo?.value    ?? 'id',  // Campo por el que ordenar
        direccion: selectorOrdenDir?.value ?? 'asc'       // Dirección del orden
    };

    // Se aplican los filtros y el ordenamiento sobre las tareas
    aplicarFiltroYOrden(criterios, ordenConfig, estadoApp);
}

// ============================================================
// RESTAURAR USUARIO AL RECARGAR (sessionStorage)
// ============================================================
// Al cargar la página, si había un usuario guardado se restaura automáticamente
(async function restaurarSesion() {
    const guardado = sessionStorage.getItem('usuarioActual');
    if (!guardado) return;
    try {
        const usuario = JSON.parse(guardado);
        // Se restaura el usuario en el estado global
        estadoApp.usuarioActual = usuario;
        // Se muestra su información en el panel sin hacer otra petición al servidor
        const { mostrarInfoUsuario } = await import('./ui/tareasUI.js');
        mostrarInfoUsuario(usuario);
        // Se cargan sus tareas desde el servidor
        await cargarTareasDeUsuario(usuario.id, estadoApp);
        // Se pre-rellena el campo de documento para referencia visual
        inputDocumento.value = usuario.documento ?? '';
    } catch {
        // Si el JSON está corrupto, se limpia la sesión
        sessionStorage.removeItem('usuarioActual');
    }
})();

// Se escucha el evento change en cada selector para aplicar los controles automáticamente
selectorFiltroEstado?.addEventListener('change', aplicarControles);
selectorOrdenCampo?.addEventListener('change',   aplicarControles);
selectorOrdenDir?.addEventListener('change',  aplicarControles);

// ============================================================
// RF04 — EXPORTAR TAREAS
// ============================================================
// Se escucha el clic en el botón de exportar para descargar las tareas como JSON
botonExportar?.addEventListener('click', () => {
    // Se llama al servicio que genera y descarga el archivo JSON
    exportarTareasVisibles();
});
