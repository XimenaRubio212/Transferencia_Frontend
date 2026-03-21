// ============================================================
// PUNTO DE ENTRADA — misTareas.js
// Responsabilidad: vista de usuario donde consulta sus tareas
// asignadas y puede marcarlas como completadas.
// ============================================================

// Se importa la función de validación desde las utilidades
import { validar } from './utils/validaciones.js';

// Se importan las referencias al DOM desde la capa UI de mis tareas
import {
    inputDocMisTareas,
    errorMisTareas
} from './ui/misTareasUI.js';

// Se importa la función del servicio que busca el usuario y carga sus tareas
import { buscarMisTareas } from './services/misTareasService.js';

// ============================================================
// FORMULARIO DE BÚSQUEDA
// ============================================================
// Se obtiene la referencia al formulario de búsqueda de "Mis Tareas" por su ID
const formularioBusquedaMisTareas = document.getElementById('formBuscarMisTareas');

// Reglas de validación para el campo de documento
const reglasDocumento = {
    inputDocMisTareas: { required: true, min: 3, max: 15, mensaje: 'El documento es obligatorio' }
};

// Se limpia el error del campo de documento cuando el usuario empieza a escribir
inputDocMisTareas?.addEventListener('input', () => {
    // Se borra el texto de error
    errorMisTareas.textContent = '';
    // Se quita la clase CSS de error del campo de entrada
    inputDocMisTareas.classList.remove('error');
});

// Se escucha el evento submit del formulario de búsqueda
formularioBusquedaMisTareas?.addEventListener('submit', async (evento) => {
    // Se previene el comportamiento por defecto (recargar la página)
    evento.preventDefault();

    // Se valida el formulario con las reglas de documento
    const { valido, errores } = validar(formularioBusquedaMisTareas, reglasDocumento);
    // Si la validación falla, se muestran los errores y se detiene
    if (!valido) {
        // Se marca el campo con la clase CSS de error
        inputDocMisTareas.classList.add('error');
        // Se muestra el mensaje de error debajo del campo
        errorMisTareas.textContent = errores.inputDocMisTareas ?? 'Documento inválido';
        return;
    }

    // Se quita la clase de error del campo
    inputDocMisTareas.classList.remove('error');
    // Se borra cualquier mensaje de error previo
    errorMisTareas.textContent = '';

    // Se obtiene el valor del documento eliminando espacios
    const documento = inputDocMisTareas.value.trim();
    // Se llama al servicio para buscar el usuario y cargar sus tareas asignadas
    await buscarMisTareas(documento);
});
