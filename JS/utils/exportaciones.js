// ============================================================
// MÓDULO DE EXPORTACIÓN — exportacion.js
// Responsabilidad: procesar y exportar los datos de tareas
// visibles en pantalla como archivo JSON descargable.
// No contiene lógica de interfaz ni llamadas a la API.
// ============================================================

/**
 * @param {Array} tareas - Lista de objetos de tarea a exportar.
 * @param {string} nombreArchivo - Nombre del archivo descargado (sin extensión).
 */
export function exportarTareasComoJSON(tareas, nombreArchivo = 'tareas') {
    if (!tareas || tareas.length === 0) {
        throw new Error('No hay tareas visibles para exportar.');
    }

    const contenidoJSON = JSON.stringify(tareas, null, 2);
    const blob = new Blob([contenidoJSON], { type: 'application/json' });
    const urlTemporal = URL.createObjectURL(blob);

    // Crear enlace de descarga invisible, hacer clic y limpiar
    const enlace = document.createElement('a');
    enlace.href = urlTemporal;
    enlace.download = `${nombreArchivo}_${_obtenerFechaActual()}.json`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(urlTemporal);
}

/**
 * Extrae los datos de tareas a partir de los nodos del DOM visibles
 * en el contenedor de tarjetas.
 *
 * @param {HTMLElement} contenedor - El elemento del DOM que contiene las tarjetas.
 * @returns {Array} Arreglo de objetos con los datos de cada tarea visible.
 */
export function obtenerTareasVisiblasDelDOM(contenedor) {
    const tarjetas = Array.from(
        contenedor.querySelectorAll('.message-card:not([style*="display: none"])')
    );

    return tarjetas.map(tarjeta => ({
        id:          tarjeta.dataset.id,
        titulo:      tarjeta.querySelector('strong')?.textContent ?? '',
        descripcion: tarjeta.querySelector('p')?.textContent ?? '',
        estado:      tarjeta.querySelector('.tag')?.textContent ?? '',
        prioridad:   tarjeta.querySelector('small span')?.textContent ?? ''
    }));
}

// --- Utilidad interna ---

/**
 * Devuelve la fecha actual en formato YYYY-MM-DD para el nombre del archivo.
 * @returns {string}
 */
function _obtenerFechaActual() {
    return new Date().toISOString().split('T')[0];
}
