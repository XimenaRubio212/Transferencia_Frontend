// ============================================================
// CAPA UI — misTareasUI.js
// Responsabilidad: renderizado de tarjetas en la vista
// "Mis Tareas" del usuario final.
// ============================================================

// --- Referencias al DOM ---
// Se obtiene el campo de entrada del documento del usuario (se exporta para misTareas.js)
export const inputDocMisTareas  = document.getElementById('inputDocMisTareas');
// Se obtiene el span donde se muestran errores de búsqueda
export const errorMisTareas     = document.getElementById('errorMisTareas');
// Se obtiene el panel que muestra la información del usuario encontrado
const panelInfoUsuario           = document.getElementById('panelInfoMisTareas');
// Se obtiene la sección que contiene las tarjetas de tareas
const seccionMisTareas           = document.getElementById('seccionMisTareas');
// Se obtiene el contenedor donde se insertan las tarjetas dinámicamente
export const contenedorMisTareas = document.getElementById('contenedorMisTareas');
// Se obtiene el mensaje que se muestra cuando no hay tareas asignadas
const estadoVacioMisTareas       = document.getElementById('estadoVacioMisTareas');
// Se obtiene el elemento que muestra el contador de tareas
const contadorMisTareas          = document.getElementById('contadorMisTareas');

// ============================================================
// INFO DEL USUARIO
// ============================================================

/**
 * Muestra el nombre del usuario y revela la sección de tareas.
 * @param {Object} usuario - { nombre, correo }
 */
export function mostrarInfoUsuarioMisTareas(usuario) {
    // Se muestra el nombre del usuario en el span correspondiente
    document.getElementById('miTareasNombre').textContent = usuario.nombre;
    // Se muestra el correo del usuario
    document.getElementById('miTareasCorreo').textContent = usuario.correo;
    // Se hace visible el panel de información del usuario
    panelInfoUsuario.classList.remove('hidden');
    // Se hace visible la sección de tareas
    seccionMisTareas.classList.remove('hidden');
}

/**
 * Muestra un error de búsqueda y oculta las secciones de tareas.
 * @param {string} mensaje
 */
export function mostrarErrorMisTareas(mensaje) {
    // Se muestra el mensaje de error debajo del campo de búsqueda
    errorMisTareas.textContent = mensaje;
    // Se oculta el panel de información del usuario
    panelInfoUsuario.classList.add('hidden');
    // Se oculta la sección de tareas
    seccionMisTareas.classList.add('hidden');
    // Se limpian las tarjetas existentes
    limpiarContenedorMisTareas();
    // Se resetea el contador a cero
    actualizarContadorMisTareas(0);
}

// ============================================================
// TARJETAS DE TAREAS
// ============================================================

/**
 * Renderiza todas las tarjetas de tareas del usuario.
 * @param {Array} tareas
 * @param {Object} manejadores - { alMarcarCompletada(id, tarjeta) }
 */
export function renderizarMisTareas(tareas, manejadores) {
    // Se limpian las tarjetas anteriores del contenedor
    limpiarContenedorMisTareas();

    // Se crea un DocumentFragment para agregar todas las tarjetas de una vez
    const fragmento = document.createDocumentFragment();
    // Se recorre cada tarea y se crea su tarjeta visual
    tareas.forEach(tarea => {
        fragmento.appendChild(crearTarjetaMiTarea(tarea, manejadores));
    });
    // Se insertan todas las tarjetas en el DOM de una sola vez
    contenedorMisTareas.appendChild(fragmento);
    // Se actualiza el contador con la cantidad de tareas
    actualizarContadorMisTareas(tareas.length);
}

/**
 * Crea una tarjeta de tarea para la vista del usuario.
 * @param {Object} tarea - { id, titulo, descripcion, estado, prioridad }
 * @param {Object} manejadores - { alMarcarCompletada(id, tarjeta) }
 * @returns {HTMLElement}
 */
export function crearTarjetaMiTarea(tarea, manejadores = {}) {
    // Se desestructuran los datos de la tarea
    const { id, titulo, descripcion, estado, prioridad } = tarea;

    // Se define el color según la prioridad de la tarea
    const colorPrioridad = {
        Alta:  '#ef4444',   // Rojo para prioridad alta
        Media: '#f59e0b',   // Amarillo para prioridad media
        Baja:  '#10b981'    // Verde para prioridad baja
    }[prioridad] ?? '#10b981';

    // Se crea el elemento div principal de la tarjeta
    const tarjeta = document.createElement('div');
    tarjeta.className = 'message-card';
    // Se guarda el ID de la tarea como atributo data-id
    tarjeta.dataset.id = id;
    // Se aplica un borde izquierdo con el color de la prioridad
    tarjeta.style.borderLeft = `5px solid ${colorPrioridad}`;

    // Si la tarea ya está terminada, se agrega una clase CSS especial
    if (estado === 'Terminado') tarjeta.classList.add('card--completada');

    // Encabezado: título + etiqueta de estado
    const encabezado = document.createElement('div');
    encabezado.className = 'message-card__header';

    // Se crea un <strong> para el título en negrita
    const tituloEl = document.createElement('strong');
    tituloEl.textContent = titulo;

    // Se crea un <span> para la etiqueta del estado
    const etiquetaEstado = document.createElement('span');
    etiquetaEstado.className = 'tag';
    etiquetaEstado.textContent = estado;

    // Se agregan título y etiqueta al encabezado
    encabezado.append(tituloEl, etiquetaEstado);

    // Descripción de la tarea
    const desc = document.createElement('p');
    desc.textContent = descripcion;

    // Prioridad con color
    const prioEl = document.createElement('small');
    prioEl.textContent = 'Prioridad: ';
    // Se crea un span coloreado para el texto de la prioridad
    const prioSpan = document.createElement('span');
    prioSpan.style.color = colorPrioridad;
    prioSpan.style.fontWeight = '600';
    prioSpan.textContent = prioridad;
    prioEl.appendChild(prioSpan);

    // Acciones: botón para marcar como completada
    const acciones = document.createElement('div');
    acciones.className = 'message-card__actions';

    // Se determina si la tarea ya está completada
    const estaCompleta = estado === 'Terminado';
    // Se crea el botón de marcar como completada
    const botonCompletar = document.createElement('button');
    // Se usa clase diferente según si ya está completada o no
    botonCompletar.className = `btn btn--small ${estaCompleta ? 'btn--completada' : 'btn--success'}`;
    // Si ya está completada, se desactiva el botón
    botonCompletar.disabled = estaCompleta;

    // Se crea el icono del botón con createElement
    const iconoBoton = document.createElement('i');
    iconoBoton.className = estaCompleta ? 'fa-solid fa-circle-check' : 'fa-solid fa-check';
    botonCompletar.appendChild(iconoBoton);

    // Se agrega el texto del botón después del icono
    const textoBoton = document.createTextNode(estaCompleta ? ' Completada' : ' Marcar como completada');
    botonCompletar.appendChild(textoBoton);

    // Al hacer clic, se ejecuta el callback para marcar la tarea como completada
    botonCompletar.addEventListener('click', () => manejadores.alMarcarCompletada?.(id, tarjeta));

    // Se agrega el botón al contenedor de acciones
    acciones.appendChild(botonCompletar);
    // Se ensambla la tarjeta con todos sus elementos
    tarjeta.append(encabezado, desc, prioEl, acciones);
    // Se retorna la tarjeta lista para insertar en el DOM
    return tarjeta;
}

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Elimina todas las tarjetas del contenedor, conservando el estado vacío.
 */
export function limpiarContenedorMisTareas() {
    // Se recorren todos los hijos del contenedor
    Array.from(contenedorMisTareas.children).forEach(hijo => {
        // Se elimina cada hijo excepto el mensaje de estado vacío
        if (hijo !== estadoVacioMisTareas) contenedorMisTareas.removeChild(hijo);
    });
}

/**
 * Actualiza el contador de tareas y muestra/oculta el estado vacío.
 * @param {number} cantidad - Número de tareas en pantalla.
 */
export function actualizarContadorMisTareas(cantidad) {
    // Se actualiza el texto del contador
    if (contadorMisTareas) contadorMisTareas.textContent = `${cantidad} Tarea(s)`;
    // Se muestra el estado vacío si no hay tareas, se oculta si hay
    if (estadoVacioMisTareas) estadoVacioMisTareas.classList.toggle('hidden', cantidad > 0);
}
