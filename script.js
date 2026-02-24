import { getUserByDocument } from './use-case/usuarios.js';
import { getTasksByUser, createTask, deleteTask, updateTask } from './use-case/tasks.js';
import { crearTarjetaTarea } from './components/taskCard.js';
import { validar } from './helpers/validarFormulario.js';

/*
 * BLOQUE ANTERIOR (comentado para evitar conflictos con el código mejorado abajo).
 * Se conserva como referencia del ejercicio original de manipulación del DOM.
 */

// --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
const searchForm = document.getElementById('searchForm');
const userDocInput = document.getElementById('userDoc');
const searchError = document.getElementById('searchError');
const userInfo = document.getElementById('userInfo');

const messageForm = document.getElementById('messageForm');
const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const messageCountLabel = document.getElementById('messageCount');
const taskSection = document.getElementById('taskSection');

const tareaInput = document.getElementById('usertarea');
const descripcionInput = document.getElementById('userMessage');
const estadoSelect = document.getElementById('taskStatus');
const prioridadSelect = document.getElementById('taskPriority');

const userNameError = document.getElementById('userNameError');
const userMessageError = document.getElementById('userMessageError');
const taskStatusError = document.getElementById('taskStatusError');
const taskPriorityError = document.getElementById('taskPriorityError');

// --- 2. ESTADO GLOBAL ---
let currentUser = null;
let taskCounter = 0;
let idTareaEditando = null;

// --- 3. REGLAS DE VALIDACIÓN ---
const reglasDocumento = {
    documento: { required: true, min: 3, max: 15, mensaje: "El documento es obligatorio" }
};

const reglasTarea = {
    usertarea: { required: true, min: 3, max: 100, mensaje: "El titulo de la tarea es obligatorio" },
    userMessage: { required: true, min: 5, max: 500, mensaje: "La descripcion de la tarea es obligatoria" },
    taskStatus: { required: true, mensaje: "Seleccione el estado de la tarea" },
    taskPriority: { required: true, mensaje: "Seleccione la prioridad de la tarea" }
};

// Mapa de campos a sus spans de error (para aplicar/limpiar clase 'error' via DOM)
const camposErrorTarea = {
    usertarea: { input: tareaInput, span: userNameError },
    userMessage: { input: descripcionInput, span: userMessageError },
    taskStatus: { input: estadoSelect, span: taskStatusError },
    taskPriority: { input: prioridadSelect, span: taskPriorityError }
};

// --- 4. FUNCIONES DE VALIDACIÓN VISUAL (puro DOM, sin innerHTML) ---

function mostrarErroresTarea(errores) {
    // Primero limpiar todos los errores
    limpiarErroresTarea();

    // Luego marcar solo los campos con error
    for (const name in errores) {
        const ref = camposErrorTarea[name];
        if (ref) {
            ref.input.classList.add('error');
            ref.span.textContent = errores[name];
        }
    }
}

function limpiarErroresTarea() {
    for (const name in camposErrorTarea) {
        const ref = camposErrorTarea[name];
        ref.input.classList.remove('error');
        ref.span.textContent = '';
    }
}

function limpiarErrorCampo(name) {
    const ref = camposErrorTarea[name];
    if (ref) {
        ref.input.classList.remove('error');
        ref.span.textContent = '';
    }
}

// --- 5. COMPONENTES (puro DOM) ---

function UserComponent(user) {
    document.getElementById('infoNombre').textContent = user.nombre;
    document.getElementById('infoCorreo').textContent = user.correo;
    userInfo.classList.remove('hidden');
    if (taskSection) taskSection.classList.remove('hidden');
    console.log("Usuario cargado:", user.nombre);
}

// --- Manejador de EDITAR (carga datos en el formulario para PATCH) ---
function manejarEditar(tarea) {
    tareaInput.value = tarea.titulo;
    descripcionInput.value = tarea.descripcion;
    estadoSelect.value = tarea.estado;
    prioridadSelect.value = tarea.prioridad;
    idTareaEditando = tarea.id;
    tareaInput.focus();
}

// --- Manejador de ELIMINAR (DELETE en el servidor y remover del DOM) ---
async function manejarEliminar(id, elementoTarjeta) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
    try {
        const respuesta = await fetch('http://localhost:3000/tasks/' + id, { method: 'DELETE' });
        if (respuesta.ok) {
            elementoTarjeta.classList.add('eliminando');
            elementoTarjeta.addEventListener('transitionend', () => {
                elementoTarjeta.remove();
                taskCounter = Math.max(0, taskCounter - 1);
                updateUI();
            }, { once: true });
        } else {
            alert('No se pudo eliminar la tarea en el servidor.');
        }
    } catch (error) {
        alert('Error de conexión al eliminar.');
    }
}

// --- Función auxiliar para crear tarjeta con manejadores conectados ---
function crearTarjetaConAcciones(tarea) {
    return crearTarjetaTarea(tarea, {
        alEditar: manejarEditar,
        alEliminar: manejarEliminar
    });
}

// --- 6. FUNCIONES DE UTILIDAD (puro DOM) ---

function limpiarContenedor(contenedor) {
    // Eliminar hijos uno a uno via DOM en lugar de innerHTML = ""
    // Se preserva el emptyState para que updateUI() pueda seguir mostrándolo/ocultándolo
    const hijos = Array.from(contenedor.children);
    hijos.forEach(hijo => {
        if (hijo !== emptyState) {
            contenedor.removeChild(hijo);
        }
    });
}

function updateUI() {
    messageCountLabel.textContent = taskCounter + ' Tareas';
    if (taskCounter > 0) {
        emptyState.classList.add('hidden');
    } else {
        emptyState.classList.remove('hidden');
    }
}

function showSearchError(msg) {
    searchError.textContent = msg;
    userInfo.classList.add('hidden');
    if (taskSection) taskSection.classList.add('hidden');
    limpiarContenedor(messagesContainer);
    taskCounter = 0;
    updateUI();
}

// --- 7. LÓGICA DEL SISTEMA ---

// Limpiar error de documento al escribir
userDocInput.addEventListener('input', () => {
    searchError.textContent = '';
    userDocInput.classList.remove('error');
});

// Limpiar errores de tarea al escribir/cambiar
tareaInput.addEventListener('input', () => limpiarErrorCampo('usertarea'));
descripcionInput.addEventListener('input', () => limpiarErrorCampo('userMessage'));
estadoSelect.addEventListener('change', () => limpiarErrorCampo('taskStatus'));
prioridadSelect.addEventListener('change', () => limpiarErrorCampo('taskPriority'));

// Búsqueda de Usuario y sus Tareas
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar campo documento con el sistema de reglas
    const { valido, errores } = validar(searchForm, reglasDocumento);
    if (!valido) {
        userDocInput.classList.add('error');
        searchError.textContent = errores.documento || 'Documento invalido';
        return;
    }

    userDocInput.classList.remove('error');
    searchError.textContent = '';

    const docId = userDocInput.value.trim();

    try {
        const response = await fetch('http://localhost:3000/usuarios?documento=' + docId);

        if (response.ok) {
            const users = await response.json();

            if (users.length > 0) {
                currentUser = users[0];
                UserComponent(currentUser);
                searchError.textContent = '';

                // Cargar tareas del usuario desde la DB
                const tasksResponse = await fetch('http://localhost:3000/tasks?userId=' + currentUser.id);
                const tasks = await tasksResponse.json();

                // Limpiar contenedor via DOM (sin innerHTML)
                limpiarContenedor(messagesContainer);

                // Usar DocumentFragment para inserción eficiente
                const fragmento = document.createDocumentFragment();
                tasks.forEach(tarea => {
                    const tarjeta = crearTarjetaConAcciones(tarea);
                    fragmento.appendChild(tarjeta);
                });
                messagesContainer.appendChild(fragmento);

                taskCounter = tasks.length;
                updateUI();

            } else {
                showSearchError("No existe un usuario con ese documento.");
            }
        } else {
            showSearchError("Error al consultar la base de datos.");
        }
    } catch (error) {
        showSearchError("Error de conexión con el servidor.");
    }
});

// Registro y Edición de Tareas (POST para crear, PATCH para editar)
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert("Primero debes buscar un usuario para asignarle tareas.");
        return;
    }

    // Validar formulario con el sistema de reglas
    const { valido, errores } = validar(messageForm, reglasTarea);
    if (!valido) {
        mostrarErroresTarea(errores);
        return;
    }

    // Si es válido, limpiar errores visuales
    limpiarErroresTarea();

    const titulo = tareaInput.value.trim();
    const descripcionVal = descripcionInput.value.trim();
    const estadoVal = estadoSelect.value;
    const prioridadVal = prioridadSelect.value;

    // Objeto con los datos de la tarea
    const datosTarea = {
        userId: currentUser.id,
        titulo: titulo,
        descripcion: descripcionVal,
        estado: estadoVal,
        prioridad: prioridadVal
    };

    try {
        // --- Modo EDICIÓN (PATCH) ---
        if (idTareaEditando) {
            const respuesta = await fetch('http://localhost:3000/tasks/' + idTareaEditando, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosTarea)
            });

            if (respuesta.ok) {
                const tareaActualizada = await respuesta.json();

                // Reemplazar la tarjeta vieja en el DOM
                const tarjetaVieja = messagesContainer.querySelector('[data-id="' + idTareaEditando + '"]');
                if (tarjetaVieja) {
                    const tarjetaNueva = crearTarjetaConAcciones(tareaActualizada);
                    tarjetaVieja.replaceWith(tarjetaNueva);
                }

                idTareaEditando = null;
                messageForm.reset();
                limpiarErroresTarea();
            } else {
                alert('No se pudo actualizar la tarea en el servidor.');
            }
            return;
        }

        // --- Modo CREACIÓN (POST) ---
        const respuesta = await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosTarea)
        });

        if (respuesta.ok) {
            const tareaGuardada = await respuesta.json();

            // Pintar en la UI via DOM con botones de acción
            const nuevaTarjeta = crearTarjetaConAcciones(tareaGuardada);
            messagesContainer.appendChild(nuevaTarjeta);

            taskCounter++;
            updateUI();
            messageForm.reset();
            limpiarErroresTarea();
        }
    } catch (error) {
        alert("No se pudo guardar la tarea en el servidor.");
    }
});