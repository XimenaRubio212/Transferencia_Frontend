// ============================================================
// CAPA UI — adminTareasUI.js
// Responsabilidad: tabla de tareas admin y modal con selector
// múltiple de usuarios para asignación.
// ============================================================

// --- Referencias al DOM ---
const contenedorTablaTareas = document.getElementById('tablaTareasContenedor');
const modalTareaAdmin       = document.getElementById('modalTareaAdmin');
const tituloModalTarea      = document.getElementById('modalTareaTitulo');
const formTareaAdmin        = document.getElementById('formTareaAdmin');

// Campos del formulario de tarea admin
export const inputTituloAdmin    = document.getElementById('adminTitulo');
export const inputDescAdmin      = document.getElementById('adminDescripcion');
export const selectorEstadoAdmin = document.getElementById('adminEstado');
export const selectorPrioAdmin   = document.getElementById('adminPrioridad');
export const selectUsuarios      = document.getElementById('adminUsuarios');  // <select multiple>

// Spans de error
const spanErrorTituloAdmin = document.getElementById('adminTituloError');
const spanErrorDescAdmin   = document.getElementById('adminDescripcionError');
const spanErrorEstAdmin    = document.getElementById('adminEstadoError');
const spanErrorPrioAdmin   = document.getElementById('adminPrioridadError');
const spanErrorUsuarios    = document.getElementById('adminUsuariosError');

export const referenciasCamposTarea = {
    adminTitulo:      { input: inputTituloAdmin,    span: spanErrorTituloAdmin },
    adminDescripcion: { input: inputDescAdmin,      span: spanErrorDescAdmin },
    adminEstado:      { input: selectorEstadoAdmin, span: spanErrorEstAdmin },
    adminPrioridad:   { input: selectorPrioAdmin,   span: spanErrorPrioAdmin }
};

// ============================================================
// TABLA DE TAREAS
// ============================================================

/**
 * Renderiza la tabla de tareas en el panel admin.
 * @param {Array} tareas
 * @param {Object} manejadores - { alEditar(tarea), alEliminar(id) }
 */
export function renderizarTablaTareas(tareas, manejadores) {
    contenedorTablaTareas.innerHTML = '';

    if (tareas.length === 0) {
        contenedorTablaTareas.innerHTML = '<p class="tabla__vacia">No hay tareas registradas.</p>';
        return;
    }

    const tabla = document.createElement('table');
    tabla.className = 'tabla-admin';

    const encabezado = document.createElement('thead');
    encabezado.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Usuarios asignados</th>
            <th>Acciones</th>
        </tr>
    `;
    tabla.appendChild(encabezado);

    const cuerpo = document.createElement('tbody');
    const fragmento = document.createDocumentFragment();
    tareas.forEach(tarea => {
        fragmento.appendChild(_crearFilaTarea(tarea, manejadores));
    });
    cuerpo.appendChild(fragmento);
    tabla.appendChild(cuerpo);

    contenedorTablaTareas.appendChild(tabla);
}

/**
 * Crea una fila <tr> con los datos de una tarea.
 */
function _crearFilaTarea(tarea, manejadores) {
    const { id, titulo, estado, prioridad, usuarios } = tarea;

    const colorPrioridad = { Alta: '#ef4444', Media: '#f59e0b', Baja: '#10b981' }[prioridad] ?? '#10b981';

    const usuariosTexto = Array.isArray(usuarios) && usuarios.length > 0
        ? usuarios.map(u => u.nombre ?? u).join(', ')
        : '—';

    const fila = document.createElement('tr');
    fila.dataset.id = id;

    // Estructura estática en innerHTML (sin datos del servidor) para evitar XSS
    fila.innerHTML = `
        <td></td>
        <td><strong></strong></td>
        <td><span class="tag"></span></td>
        <td><span style="color:${colorPrioridad}; font-weight:600"></span></td>
        <td class="celda--usuarios"></td>
        <td class="tabla__acciones"></td>
    `;

    // Datos del servidor asignados con textContent (seguro contra XSS)
    const celdas = fila.querySelectorAll('td');
    celdas[0].textContent = id;
    celdas[1].querySelector('strong').textContent = titulo;
    celdas[2].querySelector('span').textContent = estado;
    celdas[3].querySelector('span').textContent = prioridad;
    celdas[4].textContent = usuariosTexto;

    const celdaAcciones = fila.querySelector('.tabla__acciones');

    const botonEditar = document.createElement('button');
    botonEditar.className = 'btn btn--small btn--edit';
    botonEditar.textContent = 'Editar';
    botonEditar.addEventListener('click', () => manejadores.alEditar?.(tarea));

    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn btn--small btn--danger';
    botonEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
    botonEliminar.addEventListener('click', () => manejadores.alEliminar?.(id));

    celdaAcciones.append(botonEditar, botonEliminar);
    return fila;
}

// ============================================================
// MODAL DE TAREA ADMIN (con selector múltiple de usuarios)
// ============================================================

/**
 * Rellena el <select multiple> con la lista de usuarios.
 * @param {Array} usuarios - Lista completa de usuarios.
 * @param {number[]} seleccionados - IDs ya asignados (modo edición).
 */
export function poblarSelectorUsuarios(usuarios, seleccionados = []) {
    selectUsuarios.innerHTML = '';
    usuarios.forEach(u => {
        const opcion = document.createElement('option');
        opcion.value = u.id;
        opcion.textContent = `${u.nombre} (${u.correo})`;
        if (seleccionados.includes(u.id)) opcion.selected = true;
        selectUsuarios.appendChild(opcion);
    });
}

/**
 * Devuelve los IDs de usuarios seleccionados en el <select multiple>.
 * @returns {number[]}
 */
export function obtenerUsuariosSeleccionados() {
    return Array.from(selectUsuarios.selectedOptions).map(op => Number(op.value));
}

/**
 * Abre el modal para crear o editar una tarea.
 * @param {Object|null} tarea - Si se pasa, modo edición.
 * @param {Array} usuarios - Lista de usuarios para el selector.
 */
export function abrirModalTareaAdmin(tarea = null, usuarios = []) {
    formTareaAdmin.reset();
    limpiarErroresTareaAdmin();

    const idsAsignados = (tarea?.usuarios ?? []).map(u => (typeof u === 'object' ? u.id : u));
    poblarSelectorUsuarios(usuarios, idsAsignados);

    if (tarea) {
        tituloModalTarea.textContent = 'Editar Tarea';
        inputTituloAdmin.value    = tarea.titulo       ?? '';
        inputDescAdmin.value      = tarea.descripcion  ?? '';
        selectorEstadoAdmin.value = tarea.estado       ?? '';
        selectorPrioAdmin.value   = tarea.prioridad    ?? '';
        formTareaAdmin.dataset.idEditando = tarea.id;
    } else {
        tituloModalTarea.textContent = 'Crear Tarea';
        delete formTareaAdmin.dataset.idEditando;
    }

    modalTareaAdmin.classList.remove('hidden');
    inputTituloAdmin.focus();
}

/**
 * Cierra el modal de tarea admin.
 */
export function cerrarModalTareaAdmin() {
    modalTareaAdmin.classList.add('hidden');
    formTareaAdmin.reset();
    delete formTareaAdmin.dataset.idEditando;
    limpiarErroresTareaAdmin();
}

// ============================================================
// MANEJO DE ERRORES
// ============================================================

export function mostrarErroresTareaAdmin(errores) {
    limpiarErroresTareaAdmin();
    for (const [campo, mensaje] of Object.entries(errores)) {
        const ref = referenciasCamposTarea[campo];
        if (ref) {
            ref.input.classList.add('error');
            ref.span.textContent = mensaje;
        }
    }
    // Error de usuarios (campo especial)
    if (errores.adminUsuarios) {
        spanErrorUsuarios.textContent = errores.adminUsuarios;
    }
}

export function limpiarErroresTareaAdmin() {
    for (const { input, span } of Object.values(referenciasCamposTarea)) {
        input.classList.remove('error');
        span.textContent = '';
    }
    if (spanErrorUsuarios) spanErrorUsuarios.textContent = '';
}

export function limpiarErrorCampoTarea(nombreCampo) {
    const ref = referenciasCamposTarea[nombreCampo];
    if (ref) {
        ref.input.classList.remove('error');
        ref.span.textContent = '';
    }
}

// Exportar referencia que necesita admin.js
export { formTareaAdmin };
