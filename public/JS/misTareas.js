// ============================================================
// PUNTO DE ENTRADA — misTareas.js
// Responsabilidad: vista de usuario donde consulta sus tareas
// asignadas y puede marcarlas como completadas.
// ============================================================

import { validar } from './utils/validaciones.js';
import {
    inputDocMisTareas,
    errorMisTareas
} from './ui/misTareasUI.js';

import { buscarMisTareas } from './services/misTareasService.js';

// ============================================================
// FORMULARIO DE BÚSQUEDA
// ============================================================
const formularioBusquedaMisTareas = document.getElementById('formBuscarMisTareas');

const reglasDocumento = {
    inputDocMisTareas: { required: true, min: 3, max: 15, mensaje: 'El documento es obligatorio' }
};

inputDocMisTareas?.addEventListener('input', () => {
    errorMisTareas.textContent = '';
    inputDocMisTareas.classList.remove('error');
});

formularioBusquedaMisTareas?.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const { valido, errores } = validar(formularioBusquedaMisTareas, reglasDocumento);
    if (!valido) {
        inputDocMisTareas.classList.add('error');
        errorMisTareas.textContent = errores.inputDocMisTareas ?? 'Documento inválido';
        return;
    }

    inputDocMisTareas.classList.remove('error');
    errorMisTareas.textContent = '';

    const documento = inputDocMisTareas.value.trim();
    await buscarMisTareas(documento);
});
