// ============================================================
// CAPA UI — usuariosUI.js
// Responsabilidad: renderizado de la tabla de usuarios y
// el modal de creación/edición. Sin lógica de negocio.
// ============================================================

// --- Referencias al DOM ---
const contenedorTablaUsuarios = document.getElementById('tablaUsuariosContenedor');
const modalUsuario             = document.getElementById('modalUsuario');
const tituloModalUsuario       = document.getElementById('modalUsuarioTitulo');
const formUsuario              = document.getElementById('formUsuario');

// Campos del formulario de usuario
export const inputNombreUsuario    = document.getElementById('usuNombre');
export const inputCorreoUsuario    = document.getElementById('usuCorreo');
export const inputDocumentoUsuario = document.getElementById('usuDocumento');
export const selectorRolUsuario    = document.getElementById('usuRol');

// Spans de error del formulario de usuario
const spanErrorNombre    = document.getElementById('usuNombreError');
const spanErrorCorreo    = document.getElementById('usuCorreoError');
const spanErrorDocumento = document.getElementById('usuDocumentoError');
const spanErrorRol       = document.getElementById('usuRolError');

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
    contenedorTablaUsuarios.innerHTML = '';

    if (usuarios.length === 0) {
        contenedorTablaUsuarios.innerHTML = '<p class="tabla__vacia">No hay usuarios registrados.</p>';
        return;
    }

    const tabla = document.createElement('table');
    tabla.className = 'tabla-admin';

    // Encabezado
    const encabezado = document.createElement('thead');
    encabezado.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Documento</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
        </tr>
    `;
    tabla.appendChild(encabezado);

    // Cuerpo
    const cuerpo = document.createElement('tbody');
    const fragmento = document.createDocumentFragment();
    usuarios.forEach(usuario => {
        fragmento.appendChild(_crearFilaUsuario(usuario, manejadores));
    });
    cuerpo.appendChild(fragmento);
    tabla.appendChild(cuerpo);

    contenedorTablaUsuarios.appendChild(tabla);
}

/**
 * Crea una fila <tr> con los datos de un usuario.
 * @param {Object} usuario
 * @param {Object} manejadores
 * @returns {HTMLElement}
 */
function _crearFilaUsuario(usuario, manejadores) {
    const { id, nombre, correo, documento, rol, activo } = usuario;

    const fila = document.createElement('tr');
    fila.dataset.id = id;
    if (!activo) fila.classList.add('fila--inactiva');

    // Estructura estática en innerHTML (sin datos del servidor) para evitar XSS
    fila.innerHTML = `
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td><span class="tag tag--rol"></span></td>
        <td><span class="badge badge--${activo ? 'activo' : 'inactivo'}"></span></td>
        <td class="tabla__acciones"></td>
    `;

    // Datos del servidor asignados con textContent (seguro contra XSS)
    const celdas = fila.querySelectorAll('td');
    celdas[0].textContent = id;
    celdas[1].textContent = nombre;
    celdas[2].textContent = correo;
    celdas[3].textContent = documento;
    celdas[4].querySelector('span').textContent = rol ?? '—';
    celdas[5].querySelector('span').textContent = activo ? 'Activo' : 'Inactivo';

    const celdaAcciones = fila.querySelector('.tabla__acciones');

    // Botón Editar
    const botonEditar = document.createElement('button');
    botonEditar.className = 'btn btn--small btn--edit';
    botonEditar.textContent = 'Editar';
    botonEditar.addEventListener('click', () => manejadores.alEditar?.(usuario));

    // Botón Eliminar
    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn btn--small btn--danger';
    botonEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
    botonEliminar.addEventListener('click', () => manejadores.alEliminar?.(id));

    // Botón Activar/Desactivar
    const botonEstado = document.createElement('button');
    botonEstado.className = `btn btn--small ${activo ? 'btn--warning' : 'btn--success'}`;
    botonEstado.textContent = activo ? 'Desactivar' : 'Activar';
    botonEstado.addEventListener('click', () => manejadores.alCambiarEstado?.(id, !activo));

    celdaAcciones.append(botonEditar, botonEstado, botonEliminar);
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
    formUsuario.reset();
    limpiarErroresUsuario();

    if (usuario) {
        tituloModalUsuario.textContent = 'Editar Usuario';
        inputNombreUsuario.value    = usuario.nombre    ?? '';
        inputCorreoUsuario.value    = usuario.correo    ?? '';
        inputDocumentoUsuario.value = usuario.documento ?? '';
        selectorRolUsuario.value    = usuario.rol       ?? '';
        formUsuario.dataset.idEditando = usuario.id;
    } else {
        tituloModalUsuario.textContent = 'Crear Usuario';
        delete formUsuario.dataset.idEditando;
    }

    modalUsuario.classList.remove('hidden');
    inputNombreUsuario.focus();
}

/**
 * Cierra el modal de usuario.
 */
export function cerrarModalUsuario() {
    modalUsuario.classList.add('hidden');
    formUsuario.reset();
    delete formUsuario.dataset.idEditando;
    limpiarErroresUsuario();
}

// ============================================================
// MANEJO DE ERRORES DEL FORMULARIO DE USUARIO
// ============================================================

export function mostrarErroresUsuario(errores) {
    limpiarErroresUsuario();
    for (const [campo, mensaje] of Object.entries(errores)) {
        const ref = referenciasCamposUsuario[campo];
        if (ref) {
            ref.input.classList.add('error');
            ref.span.textContent = mensaje;
        }
    }
}

export function limpiarErroresUsuario() {
    for (const { input, span } of Object.values(referenciasCamposUsuario)) {
        input.classList.remove('error');
        span.textContent = '';
    }
}

export function limpiarErrorCampoUsuario(nombreCampo) {
    const ref = referenciasCamposUsuario[nombreCampo];
    if (ref) {
        ref.input.classList.remove('error');
        ref.span.textContent = '';
    }
}

// Exportar referencias que necesita admin.js
export { formUsuario };
