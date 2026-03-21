// ============================================================
// MÓDULO DE EXPORTACIÓN — exportacion.js
// Responsabilidad: procesar y exportar los datos de tareas
// visibles en pantalla como archivo JSON descargable.
// No contiene lógica de interfaz ni llamadas a la API.
// ============================================================

/**
 * Exporta un arreglo de tareas como archivo JSON descargable.
 * @param {Array} tareas - Lista de objetos de tarea a exportar.
 * @param {string} nombreArchivo - Nombre del archivo descargado (sin extensión).
 */
export function exportarTareasComoJSON(tareas, nombreArchivo = 'tareas') {
    // Si no hay tareas o el arreglo está vacío, se lanza un error
    if (!tareas || tareas.length === 0) {
        throw new Error('No hay tareas visibles para exportar.');
    }

    // Se convierte el arreglo de tareas a una cadena JSON con indentación de 2 espacios
    const contenidoJSON = JSON.stringify(tareas, null, 2);
    // Se crea un Blob (objeto binario) con el contenido JSON y tipo MIME de aplicación JSON
    const blob = new Blob([contenidoJSON], { type: 'application/json' });
    // Se genera una URL temporal que apunta al Blob creado
    const urlTemporal = URL.createObjectURL(blob);

    // Se crea un enlace <a> invisible para simular la descarga del archivo
    const enlace = document.createElement('a');
    // Se asigna la URL temporal como destino del enlace
    enlace.href = urlTemporal;
    // Se establece el nombre del archivo con la fecha actual para identificarlo
    enlace.download = `${nombreArchivo}_${_obtenerFechaActual()}.json`;
    // Se agrega el enlace al DOM temporalmente (necesario para Firefox)
    document.body.appendChild(enlace);
    // Se simula un clic en el enlace para iniciar la descarga
    enlace.click();
    // Se elimina el enlace del DOM ya que no se necesita más
    document.body.removeChild(enlace);
    // Se libera la URL temporal de la memoria del navegador
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
    // Se seleccionan todas las tarjetas visibles (que no tengan display: none)
    const tarjetas = Array.from(
        contenedor.querySelectorAll('.message-card:not([style*="display: none"])')
    );

    // Se mapea cada tarjeta a un objeto con los datos extraídos de sus elementos internos
    return tarjetas.map(tarjeta => ({
        // Se obtiene el ID desde el atributo data-id de la tarjeta
        id:          tarjeta.dataset.id,
        // Se obtiene el título desde el elemento <strong> dentro de la tarjeta
        titulo:      tarjeta.querySelector('strong')?.textContent ?? '',
        // Se obtiene la descripción desde el elemento <p>
        descripcion: tarjeta.querySelector('p')?.textContent ?? '',
        // Se obtiene el estado desde el elemento con clase .tag
        estado:      tarjeta.querySelector('.tag')?.textContent ?? '',
        // Se obtiene la prioridad desde el <span> dentro de <small>
        prioridad:   tarjeta.querySelector('small span')?.textContent ?? ''
    }));
}

// --- Utilidad interna ---

/**
 * Devuelve la fecha actual en formato YYYY-MM-DD para el nombre del archivo.
 * @returns {string}
 */
function _obtenerFechaActual() {
    // Se crea un objeto Date con la fecha/hora actual, se convierte a ISO y se toma solo la fecha
    return new Date().toISOString().split('T')[0];
}
