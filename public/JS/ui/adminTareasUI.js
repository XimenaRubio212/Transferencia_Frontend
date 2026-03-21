// ============================================================
// CAPA UI — adminTareasUI.js
// Responsabilidad: tabla de tareas admin y modal con selector
// múltiple de usuarios para asignación.
// ============================================================

// --- Referencias al DOM ---
// Se obtiene el contenedor donde se inserta la tabla de tareas
const contenedorTablaTareas = document.getElementById('tablaTareasContenedor');
// Se obtiene el elemento del modal de tarea admin
const modalTareaAdmin       = document.getElementById('modalTareaAdmin');
// Se obtiene el título del modal (cambia entre "Crear" y "Editar")
const tituloModalTarea      = document.getElementById('modalTareaTitulo');
// Se obtiene la referencia al formulario del modal
const formTareaAdmin        = document.getElementById('formTareaAdmin');

// Campos del formulario de tarea admin (se exportan para que admin.js acceda)
// Se obtiene el campo de título de la tarea
export const inputTituloAdmin    = document.getElementById('adminTitulo');
// Se obtiene el campo de descripción
export const inputDescAdmin      = document.getElementById('adminDescripcion');
// Se obtiene el selector de estado
export const selectorEstadoAdmin = document.getElementById('adminEstado');
// Se obtiene el selector de prioridad
export const selectorPrioAdmin   = document.getElementById('adminPrioridad');
// Se obtiene el <select multiple> para asignar usuarios a la tarea
export const selectUsuarios      = document.getElementById('adminUsuarios');

// Spans de error para cada campo del formulario
const spanErrorTituloAdmin = document.getElementById('adminTituloError');
const spanErrorDescAdmin   = document.getElementById('adminDescripcionError');
const spanErrorEstAdmin    = document.getElementById('adminEstadoError');
const spanErrorPrioAdmin   = document.getElementById('adminPrioridadError');
const spanErrorUsuarios    = document.getElementById('adminUsuariosError');

// Mapa que asocia cada campo con su input y su span de error
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
    // Se limpia todo el contenido anterior del contenedor
    contenedorTablaTareas.innerHTML = '';

    // Si no hay tareas, se muestra un mensaje informativo
    if (tareas.length === 0) {
        // Se crea un párrafo con el mensaje de tabla vacía
        const parrafoVacio = document.createElement('p');
        parrafoVacio.className = 'tabla__vacia';
        parrafoVacio.textContent = 'No hay tareas registradas.';
        contenedorTablaTareas.appendChild(parrafoVacio);
        return;
    }

    // Se crea el elemento <table> con la clase CSS administrativa
    const tabla = document.createElement('table');
    tabla.className = 'tabla-admin';

    // Se crea el encabezado de la tabla
    const encabezado = document.createElement('thead');
    const filaEncabezado = document.createElement('tr');
    // Se define un array con los nombres de las columnas
    const titulos = ['ID', 'Título', 'Estado', 'Prioridad', 'Usuarios asignados', 'Acciones'];
    // Se recorre cada título y se crea un <th>
    titulos.forEach(texto => {
        const th = document.createElement('th');
        th.textContent = texto;
        filaEncabezado.appendChild(th);
    });
    encabezado.appendChild(filaEncabezado);
    tabla.appendChild(encabezado);

    // Se crea el cuerpo de la tabla
    const cuerpo = document.createElement('tbody');
    // Se usa un DocumentFragment para agregar todas las filas de una vez
    const fragmento = document.createDocumentFragment();
    // Se recorre cada tarea y se crea su fila
    tareas.forEach(tarea => {
        fragmento.appendChild(_crearFilaTarea(tarea, manejadores));
    });
    cuerpo.appendChild(fragmento);
    tabla.appendChild(cuerpo);

    // Se inserta la tabla completa en el contenedor del DOM
    contenedorTablaTareas.appendChild(tabla);
}

/**
 * Crea una fila <tr> con los datos de una tarea.
 */
function _crearFilaTarea(tarea, manejadores) {
    // Se desestructuran los datos de la tarea
    const { id, titulo, estado, prioridad, usuarios } = tarea;

    // Se define un mapa de colores según la prioridad
    const colorPrioridad = { Alta: '#ef4444', Media: '#f59e0b', Baja: '#10b981' }[prioridad] ?? '#10b981';

    // Se genera el texto de usuarios asignados (nombres separados por coma o guión si no hay)
    const usuariosTexto = Array.isArray(usuarios) && usuarios.length > 0
        ? usuarios.map(u => u.nombre ?? u).join(', ')
        : '—';

    // Se crea el elemento <tr> para la fila
    const fila = document.createElement('tr');
    // Se guarda el ID de la tarea como atributo data-id
    fila.dataset.id = id;

    // Se crea la celda del ID
    const celdaId = document.createElement('td');
    celdaId.textContent = id;

    // Se crea la celda del título con un <strong>
    const celdaTitulo = document.createElement('td');
    const tituloStrong = document.createElement('strong');
    tituloStrong.textContent = titulo;
    celdaTitulo.appendChild(tituloStrong);

    // Se crea la celda del estado con un <span> estilizado
    const celdaEstado = document.createElement('td');
    const spanEstado = document.createElement('span');
    spanEstado.className = 'tag';
    spanEstado.textContent = estado;
    celdaEstado.appendChild(spanEstado);

    // Se crea la celda de prioridad con color
    const celdaPrioridad = document.createElement('td');
    const spanPrioridad = document.createElement('span');
    spanPrioridad.style.color = colorPrioridad;
    spanPrioridad.style.fontWeight = '600';
    spanPrioridad.textContent = prioridad;
    celdaPrioridad.appendChild(spanPrioridad);

    // Se crea la celda de usuarios asignados
    const celdaUsuarios = document.createElement('td');
    celdaUsuarios.className = 'celda--usuarios';
    celdaUsuarios.textContent = usuariosTexto;

    // Se crea la celda de acciones con los botones
    const celdaAcciones = document.createElement('td');
    celdaAcciones.className = 'tabla__acciones';

    // Se agregan todas las celdas a la fila
    fila.append(celdaId, celdaTitulo, celdaEstado, celdaPrioridad, celdaUsuarios, celdaAcciones);

    // Se crea el botón de editar
    const botonEditar = document.createElement('button');
    botonEditar.className = 'btn btn--small btn--edit';
    botonEditar.textContent = 'Editar';
    // Al hacer clic, se ejecuta el callback alEditar con los datos de la tarea
    botonEditar.addEventListener('click', () => manejadores.alEditar?.(tarea));

    // Se crea el botón de eliminar con icono de FontAwesome
    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn btn--small btn--danger';
    // Se crea el icono con createElement en vez de innerHTML
    const iconoEliminar = document.createElement('i');
    iconoEliminar.className = 'fa-solid fa-trash';
    botonEliminar.appendChild(iconoEliminar);
    // Al hacer clic, se ejecuta el callback alEliminar con el ID de la tarea
    botonEliminar.addEventListener('click', () => manejadores.alEliminar?.(id));

    // Se agregan ambos botones a la celda de acciones
    celdaAcciones.append(botonEditar, botonEliminar);
    // Se retorna la fila completa
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
    // Se limpia el contenido anterior del selector
    selectUsuarios.innerHTML = '';
    // Se recorre cada usuario para crear una opción en el selector
    usuarios.forEach(u => {
        // Se crea un elemento <option>
        const opcion = document.createElement('option');
        // Se asigna el ID del usuario como valor
        opcion.value = u.id;
        // Se muestra el nombre y correo del usuario como texto
        opcion.textContent = `${u.nombre} (${u.correo})`;
        // Si el usuario ya estaba asignado, se marca como seleccionado
        if (seleccionados.includes(u.id)) opcion.selected = true;
        // Se agrega la opción al selector
        selectUsuarios.appendChild(opcion);
    });
}

/**
 * Devuelve los IDs de usuarios seleccionados en el <select multiple>.
 * @returns {number[]}
 */
export function obtenerUsuariosSeleccionados() {
    // Se obtienen las opciones seleccionadas y se extraen sus valores como números
    return Array.from(selectUsuarios.selectedOptions).map(op => Number(op.value));
}

/**
 * Abre el modal para crear o editar una tarea.
 * @param {Object|null} tarea - Si se pasa, modo edición.
 * @param {Array} usuarios - Lista de usuarios para el selector.
 */
export function abrirModalTareaAdmin(tarea = null, usuarios = []) {
    // Se limpia el formulario
    formTareaAdmin.reset();
    // Se limpian los errores de validación anteriores
    limpiarErroresTareaAdmin();

    // Se extraen los IDs de usuarios ya asignados (si es modo edición)
    const idsAsignados = (tarea?.usuarios ?? []).map(u => (typeof u === 'object' ? u.id : u));
    // Se puebla el selector múltiple con la lista de usuarios
    poblarSelectorUsuarios(usuarios, idsAsignados);

    // Si se recibe una tarea, se está en modo edición
    if (tarea) {
        // Se cambia el título del modal
        tituloModalTarea.textContent = 'Editar Tarea';
        // Se pre-rellenan los campos con los datos de la tarea
        inputTituloAdmin.value    = tarea.titulo       ?? '';
        inputDescAdmin.value      = tarea.descripcion  ?? '';
        selectorEstadoAdmin.value = tarea.estado       ?? '';
        selectorPrioAdmin.value   = tarea.prioridad    ?? '';
        // Se guarda el ID de la tarea en el dataset para saber que es edición
        formTareaAdmin.dataset.idEditando = tarea.id;
    } else {
        // Si no se recibe tarea, se está en modo creación
        tituloModalTarea.textContent = 'Crear Tarea';
        // Se elimina el atributo de edición
        delete formTareaAdmin.dataset.idEditando;
    }

    // Se hace visible el modal
    modalTareaAdmin.classList.remove('hidden');
    // Se pone el foco en el campo de título
    inputTituloAdmin.focus();
}

/**
 * Cierra el modal de tarea admin.
 */
export function cerrarModalTareaAdmin() {
    // Se oculta el modal
    modalTareaAdmin.classList.add('hidden');
    // Se limpia el formulario
    formTareaAdmin.reset();
    // Se elimina el atributo de edición
    delete formTareaAdmin.dataset.idEditando;
    // Se limpian los errores de validación
    limpiarErroresTareaAdmin();
}

// ============================================================
// MANEJO DE ERRORES
// ============================================================

/**
 * Marca visualmente los campos con error y muestra sus mensajes.
 * @param {Object} errores - { nombreCampo: 'mensaje de error' }
 */
export function mostrarErroresTareaAdmin(errores) {
    // Primero se limpian los errores anteriores
    limpiarErroresTareaAdmin();
    // Se recorren los errores y se marca cada campo
    for (const [campo, mensaje] of Object.entries(errores)) {
        const ref = referenciasCamposTarea[campo];
        if (ref) {
            // Se agrega la clase CSS de error al campo
            ref.input.classList.add('error');
            // Se muestra el mensaje de error
            ref.span.textContent = mensaje;
        }
    }
    // Se maneja el error del campo especial de usuarios (no está en el mapa general)
    if (errores.adminUsuarios) {
        spanErrorUsuarios.textContent = errores.adminUsuarios;
    }
}

/**
 * Quita todas las marcas de error del formulario.
 */
export function limpiarErroresTareaAdmin() {
    // Se recorren todos los campos y se limpian sus errores
    for (const { input, span } of Object.values(referenciasCamposTarea)) {
        input.classList.remove('error');
        span.textContent = '';
    }
    // Se limpia también el error del campo de usuarios
    if (spanErrorUsuarios) spanErrorUsuarios.textContent = '';
}

/**
 * Quita la marca de error de un campo específico.
 * @param {string} nombreCampo - name del campo a limpiar.
 */
export function limpiarErrorCampoTarea(nombreCampo) {
    const ref = referenciasCamposTarea[nombreCampo];
    if (ref) {
        ref.input.classList.remove('error');
        ref.span.textContent = '';
    }
}

// Exportar referencia que necesita admin.js
export { formTareaAdmin };
