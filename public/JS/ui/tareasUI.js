// ============================================================
// CAPA UI — tareasUI.js
// Responsabilidad: todo lo que toca y modifica el DOM.
// No hace llamadas a la API ni contiene lógica de negocio.
// ============================================================

// --- Referencias a elementos del DOM ---
const panelUsuario = document.getElementById('userInfo');
const seccionTareas = document.getElementById('taskSection');
const contenedorTareas = document.getElementById('messagesContainer');
const mensajeVacio = document.getElementById('emptyState');
const contadorTareas = document.getElementById('messageCount');
const errorBusqueda = document.getElementById('searchError');
const inputDocumento = document.getElementById('userDoc');

// Campos del formulario de tareas
const inputTitulo = document.getElementById('usertarea');
const inputDescripcion = document.getElementById('userMessage');
const selectorEstado = document.getElementById('taskStatus');
const selectorPrioridad = document.getElementById('taskPriority');

// Spans donde se muestran los mensajes de error por campo
const spanErrorTitulo = document.getElementById('userNameError');
const spanErrorDescripcion = document.getElementById('userMessageError');
const spanErrorEstado = document.getElementById('taskStatusError');
const spanErrorPrioridad = document.getElementById('taskPriorityError');

/**
 * Mapa campo → { input, span } para poder limpiar/marcar errores
 * de forma genérica sin repetir código.
 */
const referenciasCampos = {
    usertarea: { input: inputTitulo, span: spanErrorTitulo },
    userMessage: { input: inputDescripcion, span: spanErrorDescripcion },
    taskStatus: { input: selectorEstado, span: spanErrorEstado },
    taskPriority: { input: selectorPrioridad, span: spanErrorPrioridad }
};

// ============================================================
// COMPONENTE: Tarjeta de tarea
// ============================================================

/**
 * Crea y devuelve un elemento HTMLElement que representa una tarea.
 *
 * @param {Object} tarea - { id, titulo, descripcion, estado, prioridad }
 * @param {Object} manejadores - { alEditar(tarea), alEliminar(id, elemento) }
 * @returns {HTMLElement} Tarjeta lista para insertar en el DOM.
 */
export function crearTarjetaTarea(tarea, manejadores = {}) {
    const { id, titulo, descripcion, estado, prioridad } = tarea;

    // Color del borde izquierdo según prioridad
    const colorPrioridad = {
        Alta: '#ef4444',
        Media: '#f59e0b',
        Baja: '#10b981'
    }[prioridad] ?? '#10b981';

    // --- Construcción de la tarjeta ---
    const tarjeta = document.createElement('div');
    tarjeta.className = 'message-card';
    tarjeta.dataset.id = id;
    tarjeta.style.borderLeft = `5px solid ${colorPrioridad}`;

    // Encabezado: título + etiqueta de estado
    const encabezado = document.createElement('div');
    encabezado.className = 'message-card__header';

    const tituloDestacado = document.createElement('strong');
    tituloDestacado.textContent = titulo;

    const etiquetaEstado = document.createElement('span');
    etiquetaEstado.className = 'tag';
    etiquetaEstado.textContent = estado;

    encabezado.append(tituloDestacado, etiquetaEstado);

    // Descripción
    const parrafoDescripcion = document.createElement('p');
    parrafoDescripcion.textContent = descripcion;

    // Prioridad con color
    const textoPrioridad = document.createElement('small');
    textoPrioridad.textContent = 'Prioridad: ';
    const etiquetaPrioridad = document.createElement('span');
    etiquetaPrioridad.style.color = colorPrioridad;
    etiquetaPrioridad.textContent = prioridad;
    textoPrioridad.appendChild(etiquetaPrioridad);

    // Botones de acción
    const contenedorAcciones = document.createElement('div');
    contenedorAcciones.className = 'message-card__actions';

    const botonEditar = document.createElement('button');
    botonEditar.className = 'btn btn--small btn--edit';
    botonEditar.textContent = 'Editar';
    botonEditar.addEventListener('click', () => manejadores.alEditar?.(tarea));

    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn btn--small btn--danger';
    const iconoEliminar = document.createElement('i');
    iconoEliminar.classList.add('fa-solid', 'fa-trash');
    botonEliminar.appendChild(iconoEliminar);
    botonEliminar.addEventListener('click', () => manejadores.alEliminar?.(id, tarjeta));

    contenedorAcciones.append(botonEditar, botonEliminar);

    // Ensamblar la tarjeta completa
    tarjeta.append(encabezado, parrafoDescripcion, textoPrioridad, contenedorAcciones);
    return tarjeta;
}

// ============================================================
// FUNCIONES DE INTERFAZ
// ============================================================

/**
 * Muestra el panel con el nombre y correo del usuario encontrado.
 * @param {Object} usuario - { nombre, correo }
 */
export function mostrarInfoUsuario(usuario) {
    document.getElementById('infoNombre').textContent = usuario.nombre;
    document.getElementById('infoCorreo').textContent = usuario.correo;
    panelUsuario.classList.remove('hidden');
    seccionTareas?.classList.remove('hidden');
}

/**
 * Actualiza el contador de tareas y muestra/oculta el mensaje de vacío.
 * @param {number} cantidad - Número actual de tareas en pantalla.
 */
export function actualizarContador(cantidad) {
    contadorTareas.textContent = `${cantidad} Tareas`;
    mensajeVacio.classList.toggle('hidden', cantidad > 0);
}

/**
 * Elimina todas las tarjetas del contenedor, conservando el mensajeVacio.
 */
export function limpiarContenedorTareas() {
    Array.from(contenedorTareas.children).forEach(hijo => {
        if (hijo !== mensajeVacio) contenedorTareas.removeChild(hijo);
    });
}

/**
 * Muestra un error de búsqueda y oculta la sección de tareas.
 * @param {string} mensaje - Texto del error a mostrar.
 */
export function mostrarErrorBusqueda(mensaje) {
    errorBusqueda.textContent = mensaje;
    panelUsuario.classList.add('hidden');
    seccionTareas?.classList.add('hidden');
    limpiarContenedorTareas();
    actualizarContador(0);
}

// ============================================================
// MANEJO DE ERRORES DEL FORMULARIO DE TAREAS
// ============================================================

/**
 * Marca visualmente los campos con error y muestra sus mensajes.
 * @param {Object} errores - { nombreCampo: 'mensaje de error' }
 */
export function mostrarErroresTarea(errores) {
    limpiarErroresTarea(); // Primero limpia para evitar errores acumulados
    for (const [nombreCampo, mensaje] of Object.entries(errores)) {
        const ref = referenciasCampos[nombreCampo];
        if (ref) {
            ref.input.classList.add('error');
            ref.span.textContent = mensaje;
        }
    }
}

/**
 * Quita todas las marcas de error del formulario de tareas.
 */
export function limpiarErroresTarea() {
    for (const { input, span } of Object.values(referenciasCampos)) {
        input.classList.remove('error');
        span.textContent = '';
    }
}

/**
 * Quita la marca de error de un campo específico (útil al escribir).
 * @param {string} nombreCampo - name del campo a limpiar.
 */
export function limpiarErrorCampo(nombreCampo) {
    const ref = referenciasCampos[nombreCampo];
    if (ref) {
        ref.input.classList.remove('error');
        ref.span.textContent = '';
    }
}

// ============================================================
// Exportar referencias DOM que necesitan main.js y tareasService.js
// ============================================================
export {
    contenedorTareas,
    errorBusqueda,
    inputDocumento,
    inputTitulo,
    inputDescripcion,
    selectorEstado,
    selectorPrioridad
};