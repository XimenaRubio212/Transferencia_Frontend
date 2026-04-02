// ============================================================
// PUNTO DE ENTRADA — admin.js
// Responsabilidad: orquestar el panel administrativo.
// Gestiona usuarios y tareas con sus respectivos modales.
// ============================================================

// Se importa la función de validación desde las utilidades
import { validar } from './utils/validaciones.js';

// UI — Usuarios: se importan las referencias del DOM y funciones de interfaz de usuarios
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

// UI — Tareas Admin: se importan las referencias del DOM y funciones de interfaz de tareas
import {
    formTareaAdmin,
    inputTituloAdmin,
    inputDescAdmin,
    selectorEstadoAdmin,
    selectorPrioAdmin,
    selectUsuarios,
    cerrarModalTareaAdmin,
    mostrarErroresTareaAdmin,
    limpiarErroresTareaAdmin,
    limpiarErrorCampoTarea,
    referenciasCamposTarea
} from './ui/adminTareasUI.js';

// Servicios — Usuarios: se importan las funciones de lógica de negocio de usuarios
import {
    cargarTodosLosUsuarios,
    obtenerUsuariosCacheados,
    crearUsuario,
    iniciarEdicionUsuario,
    guardarEdicionUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario
} from './services/usuariosService.js';

// Servicios — Tareas Admin: se importan las funciones de lógica de negocio de tareas
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
// Se obtienen las referencias a los botones del panel administrativo
const botonNuevoUsuario    = document.getElementById('btnNuevoUsuario');     // Botón "Nuevo Usuario"
const botonNuevaTareaAdmin = document.getElementById('btnNuevaTareaAdmin'); // Botón "Nueva Tarea"
const botonCerrarModalUsu  = document.getElementById('btnCerrarModalUsuario'); // Botón cerrar modal usuario
const botonCerrarModalTar  = document.getElementById('btnCerrarModalTarea');   // Botón cerrar modal tarea

// Se obtienen las referencias a los controles de filtro de tareas
const filtroUsuarioAdmin = document.getElementById('filtroUsuarioAdmin'); // Select de filtro por usuario
const filtroEstadoAdmin  = document.getElementById('filtroEstadoAdmin');  // Select de filtro por estado
const botonFiltrarAdmin  = document.getElementById('btnFiltrarAdmin');    // Botón "Filtrar"
const botonLimpiarFiltro = document.getElementById('btnLimpiarFiltro');   // Botón "Limpiar"

// ============================================================
// REGLAS DE VALIDACIÓN
// ============================================================
// Reglas para validar el formulario de creación/edición de usuarios
const reglasUsuario = {
    usuNombre:    { required: true, min: 2, max: 80,  mensaje: 'El nombre es obligatorio (mín. 2 caracteres)' },
    usuCorreo:    { required: true, min: 5, max: 100, mensaje: 'El correo es obligatorio' },
    usuDocumento: { required: true, min: 3, max: 20,  mensaje: 'El documento es obligatorio' },
    usuRol:       { required: true,                   mensaje: 'Selecciona un rol' }
};

// Reglas para validar el formulario de creación/edición de tareas admin
const reglasTareaAdmin = {
    adminTitulo:      { required: true, min: 3, max: 100, mensaje: 'El título es obligatorio (mín. 3 caracteres)' },
    adminDescripcion: { required: true, min: 5, max: 500, mensaje: 'La descripción es obligatoria' },
    adminEstado:      { required: true,                   mensaje: 'Selecciona el estado de la tarea' },
    adminPrioridad:   { required: true,                   mensaje: 'Selecciona la prioridad de la tarea' }
};

// ============================================================
// MANEJADORES DE TABLA — se definen aquí y se pasan a los servicios
// ============================================================
// Objeto con los callbacks que se ejecutan al interactuar con la tabla de usuarios
const manejadoresUsuarios = {
    // Se ejecuta al hacer clic en "Editar" un usuario en la tabla
    alEditar:        (usuario) => iniciarEdicionUsuario(usuario),
    // Se ejecuta al hacer clic en "Eliminar" un usuario; luego actualiza el filtro
    alEliminar:      async (id) => { await eliminarUsuario(id, manejadoresUsuarios); _poblarFiltroUsuarios(); },
    // Se ejecuta al hacer clic en "Activar/Desactivar" un usuario
    alCambiarEstado: (id, activo) => cambiarEstadoUsuario(id, activo, manejadoresUsuarios)
};

// Objeto con los callbacks que se ejecutan al interactuar con la tabla de tareas
const manejadoresTareas = {
    // Se ejecuta al hacer clic en "Editar" una tarea; pasa también la lista de usuarios
    alEditar:   (tarea) => iniciarEdicionTareaAdmin(tarea, obtenerUsuariosCacheados()),
    // Se ejecuta al hacer clic en "Eliminar" una tarea
    alEliminar: (id)    => eliminarTareaAdmin(id, manejadoresTareas)
};

// ============================================================
// INICIALIZACIÓN — carga inicial de datos
// ============================================================
// Función autoejecutable que carga los datos al abrir la página
(async function inicializar() {
    // Se cargan todos los usuarios del servidor y se renderizan en la tabla
    await cargarTodosLosUsuarios(manejadoresUsuarios);
    // Se cargan todas las tareas del servidor y se renderizan en la tabla
    await cargarTodasLasTareas(manejadoresTareas);
    // Se puebla el selector de filtro con los nombres de los usuarios cargados
    _poblarFiltroUsuarios();
})();

/**
 * Puebla el selector de filtro de usuarios con los usuarios cacheados.
 */
function _poblarFiltroUsuarios() {
    // Si el selector no existe en el DOM, se sale
    if (!filtroUsuarioAdmin) return;
    // Se limpia el selector y se agrega la opción por defecto
    filtroUsuarioAdmin.innerHTML = '<option value="">Todos los usuarios</option>';
    // Se recorren los usuarios cacheados para crear una opción por cada uno
    obtenerUsuariosCacheados().forEach(u => {
        // Se crea un elemento <option> para el select
        const op = document.createElement('option');
        // Se asigna el ID del usuario como valor de la opción
        op.value = u.id;
        // Se asigna el nombre del usuario como texto visible
        op.textContent = u.nombre;
        // Se agrega la opción al selector
        filtroUsuarioAdmin.appendChild(op);
    });
}

// ============================================================
// EVENTOS — MODAL DE USUARIO
// ============================================================

// Al hacer clic en "Nuevo Usuario", se abre el modal vacío (modo creación)
botonNuevoUsuario?.addEventListener('click', () => abrirModalUsuario());

// Al hacer clic en el botón de cerrar, se cierra el modal de usuario
botonCerrarModalUsu?.addEventListener('click', cerrarModalUsuario);

// Se limpian los errores de cada campo cuando el usuario escribe o cambia valor
inputNombreUsuario?.addEventListener('input',    () => limpiarErrorCampoUsuario('usuNombre'));
inputCorreoUsuario?.addEventListener('input',    () => limpiarErrorCampoUsuario('usuCorreo'));
inputDocumentoUsuario?.addEventListener('input', () => limpiarErrorCampoUsuario('usuDocumento'));
selectorRolUsuario?.addEventListener('change',   () => limpiarErrorCampoUsuario('usuRol'));

// Se escucha el evento submit del formulario de usuario
formUsuario?.addEventListener('submit', async (evento) => {
    // Se previene el comportamiento por defecto del formulario
    evento.preventDefault();

    // Se valida el formulario con las reglas de usuario
    const { valido, errores } = validar(formUsuario, reglasUsuario);
    // Si la validación falla, se muestran los errores en cada campo
    if (!valido) {
        mostrarErroresUsuario(errores);
        return;
    }
    // Se limpian los errores visuales
    limpiarErroresUsuario();

    // Se construye el objeto con los datos del formulario
    const datos = {
        nombre:    inputNombreUsuario.value.trim(),     // Nombre del usuario
        email:    inputCorreoUsuario.value.trim(),     // Correo electrónico
        documento: inputDocumentoUsuario.value.trim(),  // Número de documento
        rol:       selectorRolUsuario.value              // Rol seleccionado
    };

    try {
        // Se obtiene el ID de edición del dataset del formulario (null si es creación)
        const idEditando = formUsuario.dataset.idEditando || null;

        // Si hay ID, se está editando un usuario existente
        if (idEditando) {
            await guardarEdicionUsuario(idEditando, datos, manejadoresUsuarios);
        } else {
            // Si no hay ID, se crea un nuevo usuario
            await crearUsuario(datos, manejadoresUsuarios);
        }
        // Se actualiza el filtro de tareas con la nueva lista de usuarios
        _poblarFiltroUsuarios();
    } catch (error) {
        // Si hay error, se muestra una alerta al usuario
        alert('No se pudo guardar el usuario. Verifica los datos e intenta de nuevo.');
    }
});

// ============================================================
// EVENTOS — MODAL DE TAREA ADMIN
// ============================================================

// Al hacer clic en "Nueva Tarea", se abre el modal con la lista de usuarios
botonNuevaTareaAdmin?.addEventListener('click', () => {
    // Se pasa la lista de usuarios cacheados para el selector múltiple
    iniciarCreacionTareaAdmin(obtenerUsuariosCacheados());
});

// Al hacer clic en el botón de cerrar, se cierra el modal de tarea
botonCerrarModalTar?.addEventListener('click', cerrarModalTareaAdmin);

// Se limpian los errores individuales al escribir en cada campo
inputTituloAdmin?.addEventListener('input',    () => limpiarErrorCampoTarea('adminTitulo'));
inputDescAdmin?.addEventListener('input',      () => limpiarErrorCampoTarea('adminDescripcion'));
selectorEstadoAdmin?.addEventListener('change',() => limpiarErrorCampoTarea('adminEstado'));
selectorPrioAdmin?.addEventListener('change',  () => limpiarErrorCampoTarea('adminPrioridad'));

// Se escucha el evento submit del formulario de tarea admin
formTareaAdmin?.addEventListener('submit', async (evento) => {
    // Se previene el comportamiento por defecto del formulario
    evento.preventDefault();

    // Se valida el formulario con las reglas de tarea admin
    const { valido, errores } = validar(formTareaAdmin, reglasTareaAdmin);
    // Si la validación falla, se muestran los errores en cada campo
    if (!valido) {
        mostrarErroresTareaAdmin(errores);
        return;
    }
    // Se limpian los errores visuales
    limpiarErroresTareaAdmin();

    // Se obtiene el usuario seleccionado en el selector múltiple (primer seleccionado)
    const opcionSeleccionada = selectUsuarios.selectedOptions[0];
    const usuarioIdSeleccionado = opcionSeleccionada ? opcionSeleccionada.value : undefined;

    // Se construye el objeto con los datos de la tarea desde el formulario
    const datosTarea = {
        title:       inputTituloAdmin.value.trim(),   // Título de la tarea
        description: inputDescAdmin.value.trim(),      // Descripción
        estado:      selectorEstadoAdmin.value,        // Estado seleccionado
        priority:    selectorPrioAdmin.value,          // Prioridad seleccionada
        ...(usuarioIdSeleccionado && { userId: usuarioIdSeleccionado }) // Usuario asignado
    };

    try {
        // Se obtiene el ID de edición del dataset del formulario
        const idEditando = formTareaAdmin.dataset.idEditando || null;

        // Si hay ID, se actualiza la tarea existente
        if (idEditando) {
            await guardarEdicionTareaAdmin(idEditando, datosTarea, manejadoresTareas);
        } else {
            // Si no hay ID, se crea una nueva tarea
            await crearTareaAdmin(datosTarea, manejadoresTareas);
        }
    } catch (error) {
        // Si hay error, se muestra una alerta
        alert('No se pudo guardar la tarea. Verifica los datos e intenta de nuevo.');
    }
});

// ============================================================
// EVENTOS — FILTROS DE TAREAS
// ============================================================

// Al hacer clic en "Filtrar", se aplican los filtros seleccionados
botonFiltrarAdmin?.addEventListener('click', () => {
    // Se construye el objeto de criterios de filtrado
    const criterios = {
        userId: filtroUsuarioAdmin?.value || undefined, // ID del usuario seleccionado (o undefined si es "todos")
        estado:    filtroEstadoAdmin?.value  || undefined  // Estado seleccionado (o undefined si es "todos")
    };
    // Se llama al servicio para filtrar las tareas con los criterios
    aplicarFiltroTareasAdmin(criterios, manejadoresTareas);
});

// Al hacer clic en "Limpiar", se resetean los filtros y se recargan todas las tareas
botonLimpiarFiltro?.addEventListener('click', () => {
    // Se resetea el selector de usuario a la opción por defecto
    if (filtroUsuarioAdmin) filtroUsuarioAdmin.value = '';
    // Se resetea el selector de estado a la opción por defecto
    if (filtroEstadoAdmin)  filtroEstadoAdmin.value  = '';
    // Se recargan todas las tareas sin filtros
    cargarTodasLasTareas(manejadoresTareas);
});

// Se cierra cualquier modal al hacer clic fuera de su contenido (en el fondo oscuro)
document.addEventListener('click', (evento) => {
    // Se obtienen las referencias a los modales
    const modalUsu = document.getElementById('modalUsuario');
    const modalTar = document.getElementById('modalTareaAdmin');

    // Si el clic fue en el fondo del modal de usuario, se cierra
    if (evento.target === modalUsu) cerrarModalUsuario();
    // Si el clic fue en el fondo del modal de tarea, se cierra
    if (evento.target === modalTar) cerrarModalTareaAdmin();
});
