// ============================================================
// CAPA UI — tareasUI.js
// Responsabilidad: todo lo que toca y modifica el DOM.
// No hace llamadas a la API ni contiene lógica de negocio.
// ============================================================

// --- Referencias a elementos del DOM ---
// Se obtiene el panel que muestra la información del usuario encontrado
const panelUsuario = document.getElementById('userInfo');
// Se obtiene la sección que contiene las tareas (se oculta hasta encontrar un usuario)
const seccionTareas = document.getElementById('taskSection');
// Se obtiene el contenedor donde se insertan las tarjetas de tareas dinámicamente
const contenedorTareas = document.getElementById('messagesContainer');
// Se obtiene el mensaje que se muestra cuando no hay tareas
const mensajeVacio = document.getElementById('emptyState');
// Se obtiene el elemento que muestra el contador de tareas
const contadorTareas = document.getElementById('messageCount');
// Se obtiene el elemento donde se muestran errores de búsqueda
const errorBusqueda = document.getElementById('searchError');
// Se obtiene el campo de entrada del número de documento
const inputDocumento = document.getElementById('userDoc');

// Campos del formulario de tareas
// Se obtiene el campo de título de la tarea
const inputTitulo = document.getElementById('usertarea');
// Se obtiene el campo de descripción de la tarea
const inputDescripcion = document.getElementById('userMessage');
// Se obtiene el selector de estado de la tarea
const selectorEstado = document.getElementById('taskStatus');
// Se obtiene el selector de prioridad de la tarea
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
    // Se desestructuran los datos de la tarea para acceder fácilmente
    const { id, titulo, descripcion, estado, prioridad } = tarea;

    // Se define un mapa de colores según la prioridad de la tarea
    const colorPrioridad = {
        Alta: '#ef4444',    // Rojo para prioridad alta
        Media: '#f59e0b',   // Amarillo para prioridad media
        Baja: '#10b981'     // Verde para prioridad baja
    }[prioridad] ?? '#10b981'; // Por defecto verde si no hay prioridad

    // --- Construcción de la tarjeta ---
    // Se crea el elemento div principal de la tarjeta
    const tarjeta = document.createElement('div');
    // Se le asigna la clase CSS para aplicar estilos de tarjeta
    tarjeta.className = 'message-card';
    // Se guarda el ID de la tarea como atributo data-id para referencia futura
    tarjeta.dataset.id = id;
    // Se aplica un borde izquierdo con el color de la prioridad
    tarjeta.style.borderLeft = `5px solid ${colorPrioridad}`;

    // Encabezado: título + etiqueta de estado
    // Se crea un div para el encabezado de la tarjeta
    const encabezado = document.createElement('div');
    encabezado.className = 'message-card__header';

    // Se crea un elemento <strong> para mostrar el título en negrita
    const tituloDestacado = document.createElement('strong');
    // Se asigna el título de la tarea usando textContent (seguro contra XSS)
    tituloDestacado.textContent = titulo;

    // Se crea un <span> para la etiqueta del estado de la tarea
    const etiquetaEstado = document.createElement('span');
    etiquetaEstado.className = 'tag';
    etiquetaEstado.textContent = estado;

    // Se agregan el título y la etiqueta al encabezado
    encabezado.append(tituloDestacado, etiquetaEstado);

    // Descripción
    // Se crea un párrafo para la descripción de la tarea
    const parrafoDescripcion = document.createElement('p');
    parrafoDescripcion.textContent = descripcion;

    // Prioridad con color
    // Se crea un elemento <small> para mostrar la prioridad
    const textoPrioridad = document.createElement('small');
    textoPrioridad.textContent = 'Prioridad: ';
    // Se crea un <span> con el color de la prioridad
    const etiquetaPrioridad = document.createElement('span');
    etiquetaPrioridad.style.color = colorPrioridad;
    etiquetaPrioridad.textContent = prioridad;
    // Se agrega el span coloreado dentro del small
    textoPrioridad.appendChild(etiquetaPrioridad);

    // Botones de acción
    // Se crea un contenedor para los botones de editar y eliminar
    const contenedorAcciones = document.createElement('div');
    contenedorAcciones.className = 'message-card__actions';

    // Se crea el botón de editar
    const botonEditar = document.createElement('button');
    botonEditar.className = 'btn btn--small btn--edit';
    botonEditar.textContent = 'Editar';
    // Se agrega el event listener que llama al callback alEditar con los datos de la tarea
    botonEditar.addEventListener('click', () => manejadores.alEditar?.(tarea));

    // Se crea el botón de eliminar con icono de FontAwesome
    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn btn--small btn--danger';
    // Se crea el icono de papelera usando createElement en vez de innerHTML
    const iconoEliminar = document.createElement('i');
    iconoEliminar.classList.add('fa-solid', 'fa-trash');
    botonEliminar.appendChild(iconoEliminar);
    // Se agrega el event listener que llama al callback alEliminar con el ID y la tarjeta
    botonEliminar.addEventListener('click', () => manejadores.alEliminar?.(id, tarjeta));

    // Se agregan ambos botones al contenedor de acciones
    contenedorAcciones.append(botonEditar, botonEliminar);

    // Ensamblar la tarjeta completa agregando todos los elementos
    tarjeta.append(encabezado, parrafoDescripcion, textoPrioridad, contenedorAcciones);
    // Se retorna la tarjeta lista para insertar en el DOM
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
    // Se muestra el nombre del usuario en el span correspondiente
    document.getElementById('infoNombre').textContent = usuario.nombre;
    // Se muestra el correo del usuario
    document.getElementById('infoCorreo').textContent = usuario.correo;
    // Se hace visible el panel de información del usuario
    panelUsuario.classList.remove('hidden');
    // Se hace visible la sección de tareas
    seccionTareas?.classList.remove('hidden');
}

/**
 * Actualiza el contador de tareas y muestra/oculta el mensaje de vacío.
 * @param {number} cantidad - Número actual de tareas en pantalla.
 */
export function actualizarContador(cantidad) {
    // Se actualiza el texto del contador con la cantidad de tareas
    contadorTareas.textContent = `${cantidad} Tareas`;
    // Se muestra el mensaje vacío si no hay tareas, se oculta si hay
    mensajeVacio.classList.toggle('hidden', cantidad > 0);
}

/**
 * Elimina todas las tarjetas del contenedor, conservando el mensajeVacio.
 */
export function limpiarContenedorTareas() {
    // Se recorren todos los hijos del contenedor
    Array.from(contenedorTareas.children).forEach(hijo => {
        // Se elimina cada hijo excepto el mensaje de estado vacío
        if (hijo !== mensajeVacio) contenedorTareas.removeChild(hijo);
    });
}

/**
 * Muestra un error de búsqueda y oculta la sección de tareas.
 * @param {string} mensaje - Texto del error a mostrar.
 */
export function mostrarErrorBusqueda(mensaje) {
    // Se muestra el mensaje de error debajo del campo de búsqueda
    errorBusqueda.textContent = mensaje;
    // Se oculta el panel de información del usuario
    panelUsuario.classList.add('hidden');
    // Se oculta la sección de tareas
    seccionTareas?.classList.add('hidden');
    // Se limpian las tarjetas existentes
    limpiarContenedorTareas();
    // Se resetea el contador a cero
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
    // Primero se limpian todos los errores para evitar errores acumulados
    limpiarErroresTarea();
    // Se recorren los errores y se marca cada campo correspondiente
    for (const [nombreCampo, mensaje] of Object.entries(errores)) {
        // Se busca la referencia del campo en el mapa
        const ref = referenciasCampos[nombreCampo];
        if (ref) {
            // Se agrega la clase CSS de error al campo
            ref.input.classList.add('error');
            // Se muestra el mensaje de error en el span correspondiente
            ref.span.textContent = mensaje;
        }
    }
}

/**
 * Quita todas las marcas de error del formulario de tareas.
 */
export function limpiarErroresTarea() {
    // Se recorren todas las referencias de campos y se limpian sus errores
    for (const { input, span } of Object.values(referenciasCampos)) {
        // Se quita la clase CSS de error
        input.classList.remove('error');
        // Se borra el texto de error
        span.textContent = '';
    }
}

/**
 * Quita la marca de error de un campo específico (útil al escribir).
 * @param {string} nombreCampo - name del campo a limpiar.
 */
export function limpiarErrorCampo(nombreCampo) {
    // Se busca la referencia del campo por su nombre
    const ref = referenciasCampos[nombreCampo];
    if (ref) {
        // Se quita la clase CSS de error
        ref.input.classList.remove('error');
        // Se borra el texto de error
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
