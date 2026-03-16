// ============================================================
// PUNTO DE ENTRADA — admin.js
// Responsabilidad: orquestar el panel administrativo.
// Gestiona usuarios y tareas con sus respectivos modales.
// ============================================================

import { validar } from './utils/validaciones.js';

// UI — Usuarios
import {
    formUsuario,
    inputNombreUsuario,
    inputCorreoUsuario,
    inputDocumentoUsuario,
    selectorRolUsuario,
    abrirModalUsuario,
    cerrarModalUsuario,
    mostrarErroresUsuario,
    limpiarErroresUsuario,
    limpiarErrorCampoUsuario,
    referenciasCamposUsuario
} from './ui/usuariosUI.js';

// UI — Tareas Admin
import {
    formTareaAdmin,
    inputTituloAdmin,
    inputDescAdmin,
    selectorEstadoAdmin,
    selectorPrioAdmin,
    cerrarModalTareaAdmin,
    mostrarErroresTareaAdmin,
    limpiarErroresTareaAdmin,
    limpiarErrorCampoTarea,
    referenciasCamposTarea
} from './ui/adminTareasUI.js';

// Servicios — Usuarios
import {
    cargarTodosLosUsuarios,
    obtenerUsuariosCacheados,
    crearUsuario,
    iniciarEdicionUsuario,
    guardarEdicionUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario
} from './services/usuariosService.js';

// Servicios — Tareas Admin
import {
    cargarTodasLasTareas,
    aplicarFiltroTareasAdmin,
    iniciarCreacionTareaAdmin,
    crearTareaAdmin,
    iniciarEdicionTareaAdmin,
    guardarEdicionTareaAdmin,
    eliminarTareaAdmin
} from './services/adminTareasService.js';

// ============================================================
// REFERENCIAS A CONTROLES DEL HTML
// ============================================================
const botonNuevoUsuario    = document.getElementById('btnNuevoUsuario');
const botonNuevaTareaAdmin = document.getElementById('btnNuevaTareaAdmin');
const botonCerrarModalUsu  = document.getElementById('btnCerrarModalUsuario');
const botonCerrarModalTar  = document.getElementById('btnCerrarModalTarea');

// Filtros de tareas admin
const filtroUsuarioAdmin = document.getElementById('filtroUsuarioAdmin');
const filtroEstadoAdmin  = document.getElementById('filtroEstadoAdmin');
const botonFiltrarAdmin  = document.getElementById('btnFiltrarAdmin');
const botonLimpiarFiltro = document.getElementById('btnLimpiarFiltro');

// ============================================================
// REGLAS DE VALIDACIÓN
// ============================================================
const reglasUsuario = {
    usuNombre:    { required: true, min: 2, max: 80,  mensaje: 'El nombre es obligatorio (mín. 2 caracteres)' },
    usuCorreo:    { required: true, min: 5, max: 100, mensaje: 'El correo es obligatorio' },
    usuDocumento: { required: true, min: 3, max: 20,  mensaje: 'El documento es obligatorio' },
    usuRol:       { required: true,                   mensaje: 'Selecciona un rol' }
};

const reglasTareaAdmin = {
    adminTitulo:      { required: true, min: 3, max: 100, mensaje: 'El título es obligatorio (mín. 3 caracteres)' },
    adminDescripcion: { required: true, min: 5, max: 500, mensaje: 'La descripción es obligatoria' },
    adminEstado:      { required: true,                   mensaje: 'Selecciona el estado de la tarea' },
    adminPrioridad:   { required: true,                   mensaje: 'Selecciona la prioridad de la tarea' }
};

// ============================================================
// MANEJADORES DE TABLA — se definen aquí y se pasan a los servicios
// ============================================================
const manejadoresUsuarios = {
    alEditar:        (usuario) => iniciarEdicionUsuario(usuario),
    alEliminar:      async (id) => { await eliminarUsuario(id, manejadoresUsuarios); _poblarFiltroUsuarios(); },
    alCambiarEstado: (id, activo) => cambiarEstadoUsuario(id, activo, manejadoresUsuarios)
};

const manejadoresTareas = {
    alEditar:   (tarea) => iniciarEdicionTareaAdmin(tarea, obtenerUsuariosCacheados()),
    alEliminar: (id)    => eliminarTareaAdmin(id, manejadoresTareas)
};

// ============================================================
// INICIALIZACIÓN — carga inicial de datos
// ============================================================
(async function inicializar() {
    await cargarTodosLosUsuarios(manejadoresUsuarios);
    await cargarTodasLasTareas(manejadoresTareas);
    _poblarFiltroUsuarios();
})();

/**
 * Puebla el selector de filtro de usuarios con los usuarios cacheados.
 */
function _poblarFiltroUsuarios() {
    if (!filtroUsuarioAdmin) return;
    filtroUsuarioAdmin.innerHTML = '<option value="">Todos los usuarios</option>';
    obtenerUsuariosCacheados().forEach(u => {
        const op = document.createElement('option');
        op.value = u.id;
        op.textContent = u.nombre;
        filtroUsuarioAdmin.appendChild(op);
    });
}

// ============================================================
// EVENTOS — MODAL DE USUARIO
// ============================================================

botonNuevoUsuario?.addEventListener('click', () => abrirModalUsuario());

botonCerrarModalUsu?.addEventListener('click', cerrarModalUsuario);

// Limpiar errores al escribir en el formulario de usuario
inputNombreUsuario?.addEventListener('input',    () => limpiarErrorCampoUsuario('usuNombre'));
inputCorreoUsuario?.addEventListener('input',    () => limpiarErrorCampoUsuario('usuCorreo'));
inputDocumentoUsuario?.addEventListener('input', () => limpiarErrorCampoUsuario('usuDocumento'));
selectorRolUsuario?.addEventListener('change',   () => limpiarErrorCampoUsuario('usuRol'));

formUsuario?.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const { valido, errores } = validar(formUsuario, reglasUsuario);
    if (!valido) {
        mostrarErroresUsuario(errores);
        return;
    }
    limpiarErroresUsuario();

    const datos = {
        nombre:    inputNombreUsuario.value.trim(),
        correo:    inputCorreoUsuario.value.trim(),
        documento: inputDocumentoUsuario.value.trim(),
        rol:       selectorRolUsuario.value
    };

    try {
        const idEditando = formUsuario.dataset.idEditando
            ? Number(formUsuario.dataset.idEditando)
            : null;

        if (idEditando) {
            await guardarEdicionUsuario(idEditando, datos, manejadoresUsuarios);
        } else {
            await crearUsuario(datos, manejadoresUsuarios);
        }
        _poblarFiltroUsuarios(); // actualizar el filtro de tareas con la lista nueva
    } catch (error) {
        alert('No se pudo guardar el usuario. Verifica los datos e intenta de nuevo.');
    }
});

// ============================================================
// EVENTOS — MODAL DE TAREA ADMIN
// ============================================================

botonNuevaTareaAdmin?.addEventListener('click', () => {
    iniciarCreacionTareaAdmin(obtenerUsuariosCacheados());
});

botonCerrarModalTar?.addEventListener('click', cerrarModalTareaAdmin);

// Limpiar errores al escribir
inputTituloAdmin?.addEventListener('input',    () => limpiarErrorCampoTarea('adminTitulo'));
inputDescAdmin?.addEventListener('input',      () => limpiarErrorCampoTarea('adminDescripcion'));
selectorEstadoAdmin?.addEventListener('change',() => limpiarErrorCampoTarea('adminEstado'));
selectorPrioAdmin?.addEventListener('change',  () => limpiarErrorCampoTarea('adminPrioridad'));

formTareaAdmin?.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const { valido, errores } = validar(formTareaAdmin, reglasTareaAdmin);
    if (!valido) {
        mostrarErroresTareaAdmin(errores);
        return;
    }
    limpiarErroresTareaAdmin();

    const datosTarea = {
        titulo:      inputTituloAdmin.value.trim(),
        descripcion: inputDescAdmin.value.trim(),
        estado:      selectorEstadoAdmin.value,
        prioridad:   selectorPrioAdmin.value
    };

    try {
        const idEditando = formTareaAdmin.dataset.idEditando
            ? Number(formTareaAdmin.dataset.idEditando)
            : null;

        if (idEditando) {
            await guardarEdicionTareaAdmin(idEditando, datosTarea, manejadoresTareas);
        } else {
            await crearTareaAdmin(datosTarea, manejadoresTareas);
        }
    } catch (error) {
        alert('No se pudo guardar la tarea. Verifica los datos e intenta de nuevo.');
    }
});

// ============================================================
// EVENTOS — FILTROS DE TAREAS
// ============================================================

botonFiltrarAdmin?.addEventListener('click', () => {
    const criterios = {
        userId: filtroUsuarioAdmin?.value || undefined,
        estado: filtroEstadoAdmin?.value  || undefined
    };
    aplicarFiltroTareasAdmin(criterios, manejadoresTareas);
});

botonLimpiarFiltro?.addEventListener('click', () => {
    if (filtroUsuarioAdmin) filtroUsuarioAdmin.value = '';
    if (filtroEstadoAdmin)  filtroEstadoAdmin.value  = '';
    cargarTodasLasTareas(manejadoresTareas);
});

// Cerrar modales al hacer clic fuera del contenido
document.addEventListener('click', (evento) => {
    const modalUsu = document.getElementById('modalUsuario');
    const modalTar = document.getElementById('modalTareaAdmin');

    if (evento.target === modalUsu) cerrarModalUsuario();
    if (evento.target === modalTar) cerrarModalTareaAdmin();
});
