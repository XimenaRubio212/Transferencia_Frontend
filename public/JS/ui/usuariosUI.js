// ============================================================
// CAPA UI — usuariosUI.js
// Responsabilidad: renderizado de la tabla de usuarios y
// el modal de creación/edición. Sin lógica de negocio.
// ============================================================

// --- Referencias al DOM ---
// Se obtiene el contenedor donde se inserta la tabla de usuarios
const contenedorTablaUsuarios = document.getElementById('tablaUsuariosContenedor');
// Se obtiene el elemento del modal de usuario
const modalUsuario             = document.getElementById('modalUsuario');
// Se obtiene el título del modal (cambia entre "Crear" y "Editar")
const tituloModalUsuario       = document.getElementById('modalUsuarioTitulo');
// Se obtiene la referencia al formulario del modal de usuario
const formUsuario              = document.getElementById('formUsuario');

// Campos del formulario de usuario (se exportan para que admin.js acceda a ellos)
export const inputNombreUsuario    = document.getElementById('usuNombre');
export const inputCorreoUsuario    = document.getElementById('usuCorreo');
export const inputDocumentoUsuario = document.getElementById('usuDocumento');
export const selectorRolUsuario    = document.getElementById('usuRol');

// Spans de error del formulario de usuario
const spanErrorNombre    = document.getElementById('usuNombreError');
const spanErrorCorreo    = document.getElementById('usuCorreoError');
const spanErrorDocumento = document.getElementById('usuDocumentoError');
const spanErrorRol       = document.getElementById('usuRolError');

// Mapa que asocia cada campo con su input y su span de error
// Se usa para limpiar/marcar errores de forma genérica
export const referenciasCamposUsuario = {
    usuNombre:    { input: inputNombreUsuario,    span: spanErrorNombre },
    usuCorreo:    { input: inputCorreoUsuario,    span: spanErrorCorreo },
    usuDocumento: { input: inputDocumentoUsuario, span: spanErrorDocumento },
    usuRol:       { input: selectorRolUsuario,    span: spanErrorRol }
};

// ============================================================
// TABLA DE USUARIOS
// ============================================================

/**
 * Renderiza la tabla completa con todos los usuarios.
 * @param {Array} usuarios - Lista de usuarios del servidor.
 * @param {Object} manejadores - { alEditar(usuario), alEliminar(id), alCambiarEstado(id, activo) }
 */
export function renderizarTablaUsuarios(usuarios, manejadores) {
    // Se limpia todo el contenido anterior del contenedor
    contenedorTablaUsuarios.innerHTML = '';

    // Si no hay usuarios, se muestra un mensaje informativo
    if (usuarios.length === 0) {
        // Se crea un párrafo con el mensaje de tabla vacía
        const parrafoVacio = document.createElement('p');
        parrafoVacio.className = 'tabla__vacia';
        parrafoVacio.textContent = 'No hay usuarios registrados.';
        contenedorTablaUsuarios.appendChild(parrafoVacio);
        return;
    }

    // Se crea el elemento <table> con la clase CSS de tabla administrativa
    const tabla = document.createElement('table');
    tabla.className = 'tabla-admin';

    // Encabezado de la tabla
    // Se crea el elemento <thead> para el encabezado
    const encabezado = document.createElement('thead');
    // Se crea una fila <tr> para los títulos de las columnas
    const filaEncabezado = document.createElement('tr');
    // Se define un array con los nombres de las columnas
    const encabezados = ['ID', 'Nombre', 'Correo', 'Documento', 'Rol', 'Estado', 'Acciones'];
    // Se recorre cada nombre y se crea un <th> para cada columna
    encabezados.forEach(texto => {
        const th = document.createElement('th');
        th.textContent = texto;
        filaEncabezado.appendChild(th);
    });
    // Se agrega la fila al thead
    encabezado.appendChild(filaEncabezado);
    // Se agrega el thead a la tabla
    tabla.appendChild(encabezado);

    // Cuerpo de la tabla
    // Se crea el elemento <tbody> para el cuerpo
    const cuerpo = document.createElement('tbody');
    // Se crea un DocumentFragment para agregar todas las filas de una vez (mejor rendimiento)
    const fragmento = document.createDocumentFragment();
    // Se recorre cada usuario y se crea su fila correspondiente
    usuarios.forEach(usuario => {
        fragmento.appendChild(_crearFilaUsuario(usuario, manejadores));
    });
    // Se agrega el fragmento con todas las filas al tbody
    cuerpo.appendChild(fragmento);
    // Se agrega el tbody a la tabla
    tabla.appendChild(cuerpo);

    // Se inserta la tabla completa en el contenedor del DOM
    contenedorTablaUsuarios.appendChild(tabla);
}

/**
 * Crea una fila <tr> con los datos de un usuario.
 * @param {Object} usuario
 * @param {Object} manejadores
 * @returns {HTMLElement}
 */
function _crearFilaUsuario(usuario, manejadores) {
    // Se desestructuran los datos del usuario (backend retorna 'email', no 'correo')
    const { id, nombre, email: correo, documento, rol, estado } = usuario;

    // Se crea el elemento <tr> para la fila
    const fila = document.createElement('tr');
    // Se guarda el ID del usuario como atributo data-id
    fila.dataset.id = id;
    // Si el usuario está inactivo, se agrega una clase CSS especial
    if (estado !== 'activo') fila.classList.add('fila--inactiva');

    // Celdas de datos simples
    // Se crea la celda del ID
    const celdaId = document.createElement('td');
    celdaId.textContent = id;

    // Se crea la celda del nombre
    const celdaNombre = document.createElement('td');
    celdaNombre.textContent = nombre;

    // Se crea la celda del correo
    const celdaCorreo = document.createElement('td');
    celdaCorreo.textContent = correo;

    // Se crea la celda del documento
    const celdaDocumento = document.createElement('td');
    celdaDocumento.textContent = documento;

    // Celda Rol con span estilizado
    const celdaRol = document.createElement('td');
    // Se crea un <span> con clases CSS para mostrar el rol como etiqueta
    const spanRol = document.createElement('span');
    spanRol.className = 'tag tag--rol';
    // Se muestra el rol o un guión si no tiene rol asignado
    spanRol.textContent = rol ?? '—';
    celdaRol.appendChild(spanRol);

    // Celda Estado con span estilizado
    const celdaEstado = document.createElement('td');
    // Se crea un <span> con clase CSS que cambia según el estado (activo/inactivo)
    const spanEstado = document.createElement('span');
    spanEstado.className = `badge badge--${estado === 'activo' ? 'activo' : 'inactivo'}`;
    spanEstado.textContent = estado === 'activo' ? 'Activo' : 'Inactivo';
    celdaEstado.appendChild(spanEstado);

    // Celda Acciones (contendrá los botones)
    const celdaAcciones = document.createElement('td');
    celdaAcciones.className = 'tabla__acciones';

    // Se agregan todas las celdas a la fila de una vez
    fila.append(celdaId, celdaNombre, celdaCorreo, celdaDocumento, celdaRol, celdaEstado, celdaAcciones);

    // Botón Editar
    const botonEditar = document.createElement('button');
    botonEditar.className = 'btn btn--small btn--edit';
    botonEditar.textContent = 'Editar';
    // Al hacer clic, se ejecuta el callback alEditar con los datos del usuario
    botonEditar.addEventListener('click', () => manejadores.alEditar?.(usuario));

    // Botón Eliminar con icono de papelera
    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn btn--small btn--danger';
    // Se crea el icono de FontAwesome con createElement
    const iconoEliminar = document.createElement('i');
    iconoEliminar.className = 'fa-solid fa-trash';
    botonEliminar.appendChild(iconoEliminar);
    // Al hacer clic, se ejecuta el callback alEliminar con el ID del usuario
    botonEliminar.addEventListener('click', () => manejadores.alEliminar?.(id));

    // Botón Activar/Desactivar (cambia su texto y estilo según el estado actual)
    const botonEstado = document.createElement('button');
    // Se usa clase warning si está activo (para desactivar), success si está inactivo (para activar)
    const estaActivo = estado === 'activo'
    botonEstado.className = `btn btn--small ${estaActivo ? 'btn--warning' : 'btn--success'}`;
    botonEstado.textContent = estaActivo ? 'Desactivar' : 'Activar';
    // Al hacer clic, se ejecuta el callback alCambiarEstado con el ID y el estado opuesto
    botonEstado.addEventListener('click', () => manejadores.alCambiarEstado?.(id, !estaActivo));

    // Se agregan los tres botones a la celda de acciones
    celdaAcciones.append(botonEditar, botonEstado, botonEliminar);
    // Se retorna la fila completa
    return fila;
}

// ============================================================
// MODAL DE USUARIO
// ============================================================

/**
 * Abre el modal para crear o editar un usuario.
 * @param {Object|null} usuario - Si se pasa, se pre-rellena el formulario (modo edición).
 */
export function abrirModalUsuario(usuario = null) {
    // Se limpia el formulario para empezar desde cero
    formUsuario.reset();
    // Se limpian los errores de validación anteriores
    limpiarErroresUsuario();

    // Si se recibe un usuario, se está en modo edición
    if (usuario) {
        // Se cambia el título del modal a "Editar Usuario"
        tituloModalUsuario.textContent = 'Editar Usuario';
        // Se pre-rellenan los campos con los datos del usuario (backend retorna 'email')
        inputNombreUsuario.value    = usuario.nombre    ?? '';
        inputCorreoUsuario.value    = usuario.email     ?? '';
        inputDocumentoUsuario.value = usuario.documento ?? '';
        selectorRolUsuario.value    = usuario.rol       ?? '';
        // Se guarda el ID del usuario en el dataset del formulario para saber que es edición
        formUsuario.dataset.idEditando = usuario.id;
    } else {
        // Si no se recibe usuario, se está en modo creación
        tituloModalUsuario.textContent = 'Crear Usuario';
        // Se elimina el atributo de edición del dataset
        delete formUsuario.dataset.idEditando;
    }

    // Se hace visible el modal quitando la clase 'hidden'
    modalUsuario.classList.remove('hidden');
    // Se pone el foco en el primer campo del formulario
    inputNombreUsuario.focus();
}

/**
 * Cierra el modal de usuario.
 */
export function cerrarModalUsuario() {
    // Se oculta el modal agregando la clase 'hidden'
    modalUsuario.classList.add('hidden');
    // Se limpia el formulario
    formUsuario.reset();
    // Se elimina el atributo de edición
    delete formUsuario.dataset.idEditando;
    // Se limpian los errores de validación
    limpiarErroresUsuario();
}

// ============================================================
// MANEJO DE ERRORES DEL FORMULARIO DE USUARIO
// ============================================================

/**
 * Marca visualmente los campos con error y muestra sus mensajes.
 * @param {Object} errores - { nombreCampo: 'mensaje de error' }
 */
export function mostrarErroresUsuario(errores) {
    // Primero se limpian los errores anteriores
    limpiarErroresUsuario();
    // Se recorren los errores y se marca cada campo
    for (const [campo, mensaje] of Object.entries(errores)) {
        // Se busca la referencia del campo en el mapa
        const ref = referenciasCamposUsuario[campo];
        if (ref) {
            // Se agrega la clase CSS de error al campo
            ref.input.classList.add('error');
            // Se muestra el mensaje de error en el span correspondiente
            ref.span.textContent = mensaje;
        }
    }
}

/**
 * Quita todas las marcas de error del formulario de usuario.
 */
export function limpiarErroresUsuario() {
    // Se recorren todos los campos y se limpian sus errores
    for (const { input, span } of Object.values(referenciasCamposUsuario)) {
        input.classList.remove('error');
        span.textContent = '';
    }
}

/**
 * Quita la marca de error de un campo específico.
 * @param {string} nombreCampo - name del campo a limpiar.
 */
export function limpiarErrorCampoUsuario(nombreCampo) {
    const ref = referenciasCamposUsuario[nombreCampo];
    if (ref) {
        ref.input.classList.remove('error');
        ref.span.textContent = '';
    }
}

// Exportar referencias que necesita admin.js
export { formUsuario };
