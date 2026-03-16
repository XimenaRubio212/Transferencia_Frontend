// ============================================================
// CAPA UI — misTareasUI.js
// Responsabilidad: renderizado de tarjetas en la vista
// "Mis Tareas" del usuario final.
// ============================================================

// --- Referencias al DOM ---
export const inputDocMisTareas  = document.getElementById('inputDocMisTareas');
export const errorMisTareas     = document.getElementById('errorMisTareas');
const panelInfoUsuario           = document.getElementById('panelInfoMisTareas');
const seccionMisTareas           = document.getElementById('seccionMisTareas');
export const contenedorMisTareas = document.getElementById('contenedorMisTareas');
const estadoVacioMisTareas       = document.getElementById('estadoVacioMisTareas');
const contadorMisTareas          = document.getElementById('contadorMisTareas');

// ============================================================
// INFO DEL USUARIO
// ============================================================

/**
 * Muestra el nombre del usuario y revela la sección de tareas.
 * @param {Object} usuario - { nombre, correo }
 */
export function mostrarInfoUsuarioMisTareas(usuario) {
    document.getElementById('miTareasNombre').textContent = usuario.nombre;
    document.getElementById('miTareasCorreo').textContent = usuario.correo;
    panelInfoUsuario.classList.remove('hidden');
    seccionMisTareas.classList.remove('hidden');
}

/**
 * Muestra un error de búsqueda y oculta las secciones de tareas.
 * @param {string} mensaje
 */
export function mostrarErrorMisTareas(mensaje) {
    errorMisTareas.textContent = mensaje;
    panelInfoUsuario.classList.add('hidden');
    seccionMisTareas.classList.add('hidden');
    limpiarContenedorMisTareas();
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
    limpiarContenedorMisTareas();

    const fragmento = document.createDocumentFragment();
    tareas.forEach(tarea => {
        fragmento.appendChild(crearTarjetaMiTarea(tarea, manejadores));
    });
    contenedorMisTareas.appendChild(fragmento);
    actualizarContadorMisTareas(tareas.length);
}

/**
 * Crea una tarjeta de tarea para la vista del usuario.
 * @param {Object} tarea - { id, titulo, descripcion, estado, prioridad }
 * @param {Object} manejadores - { alMarcarCompletada(id, tarjeta) }
 * @returns {HTMLElement}
 */
export function crearTarjetaMiTarea(tarea, manejadores = {}) {
    const { id, titulo, descripcion, estado, prioridad } = tarea;

    const colorPrioridad = {
        Alta:  '#ef4444',
        Media: '#f59e0b',
        Baja:  '#10b981'
    }[prioridad] ?? '#10b981';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'message-card';
    tarjeta.dataset.id = id;
    tarjeta.style.borderLeft = `5px solid ${colorPrioridad}`;

    if (estado === 'Terminado') tarjeta.classList.add('card--completada');

    // Encabezado
    const encabezado = document.createElement('div');
    encabezado.className = 'message-card__header';

    const tituloEl = document.createElement('strong');
    tituloEl.textContent = titulo;

    const etiquetaEstado = document.createElement('span');
    etiquetaEstado.className = 'tag';
    etiquetaEstado.textContent = estado;

    encabezado.append(tituloEl, etiquetaEstado);

    // Descripción
    const desc = document.createElement('p');
    desc.textContent = descripcion;

    // Prioridad
    const prioEl = document.createElement('small');
    prioEl.textContent = 'Prioridad: ';
    const prioSpan = document.createElement('span');
    prioSpan.style.color = colorPrioridad;
    prioSpan.style.fontWeight = '600';
    prioSpan.textContent = prioridad;
    prioEl.appendChild(prioSpan);

    // Acciones
    const acciones = document.createElement('div');
    acciones.className = 'message-card__actions';

    const estaCompleta = estado === 'Terminado';
    const botonCompletar = document.createElement('button');
    botonCompletar.className = `btn btn--small ${estaCompleta ? 'btn--completada' : 'btn--success'}`;
    botonCompletar.disabled = estaCompleta;
    botonCompletar.innerHTML = estaCompleta
        ? '<i class="fa-solid fa-circle-check"></i> Completada'
        : '<i class="fa-solid fa-check"></i> Marcar como completada';

    botonCompletar.addEventListener('click', () => manejadores.alMarcarCompletada?.(id, tarjeta));

    acciones.appendChild(botonCompletar);
    tarjeta.append(encabezado, desc, prioEl, acciones);
    return tarjeta;
}

// ============================================================
// UTILIDADES
// ============================================================

export function limpiarContenedorMisTareas() {
    Array.from(contenedorMisTareas.children).forEach(hijo => {
        if (hijo !== estadoVacioMisTareas) contenedorMisTareas.removeChild(hijo);
    });
}

export function actualizarContadorMisTareas(cantidad) {
    if (contadorMisTareas) contadorMisTareas.textContent = `${cantidad} Tarea(s)`;
    if (estadoVacioMisTareas) estadoVacioMisTareas.classList.toggle('hidden', cantidad > 0);
}
