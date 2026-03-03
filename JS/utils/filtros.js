// ============================================================
// MÓDULO DE FILTROS Y ORDENAMIENTO — filtros.js
// Responsabilidad: filtrar y ordenar tareas por estado, usuario
// y otros criterios, sin modificar el DOM directamente.
// ============================================================

/**
 * Filtra un arreglo de tareas según los criterios proporcionados.
 * Los criterios vacíos o 'todos' se ignoran (no filtran).
 *
 * @param {Array}  tareas   - Lista completa de tareas.
 * @param {Object} criterios - { estado: string, userId: string|number }
 * @returns {Array} Lista de tareas que cumplen todos los filtros activos.
 */
export function filtrarTareas(tareas, criterios = {}) {
    return tareas.filter(tarea => {
        const pasaEstado =
            !criterios.estado || criterios.estado === 'todos'
                ? true
                : tarea.estado === criterios.estado;

        const pasaUsuario =
            !criterios.userId || criterios.userId === 'todos'
                ? true
                : String(tarea.userId) === String(criterios.userId);

        return pasaEstado && pasaUsuario;
    });
}

/**
 * Ordena un arreglo de tareas según el campo y dirección indicados.
 * No muta el arreglo original (devuelve una copia ordenada).
 *
 * @param {Array}  tareas   - Lista de tareas a ordenar.
 * @param {string} campo    - Campo por el que ordenar: 'titulo' | 'estado' | 'id'
 * @param {string} direccion - 'asc' (ascendente) o 'desc' (descendente).
 * @returns {Array} Nueva lista ordenada.
 */
export function ordenarTareas(tareas, campo = 'id', direccion = 'asc') {
    const copia = [...tareas];

    copia.sort((a, b) => {
        let valorA = a[campo] ?? '';
        let valorB = b[campo] ?? '';

        // Comparación numérica para IDs y fechas numéricas
        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return direccion === 'asc' ? valorA - valorB : valorB - valorA;
        }

        // Comparación de texto (insensible a mayúsculas)
        valorA = String(valorA).toLowerCase();
        valorB = String(valorB).toLowerCase();

        if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
        return 0;
    });

    return copia;
}

/**
 * Aplica filtros y ordenamiento en una sola llamada.
 *
 * @param {Array}  tareas      - Lista completa de tareas.
 * @param {Object} criterios   - Criterios de filtrado.
 * @param {Object} ordenConfig - { campo: string, direccion: string }
 * @returns {Array} Lista filtrada y ordenada.
 */
export function aplicarFiltrosYOrden(tareas, criterios = {}, ordenConfig = {}) {
    const filtradas = filtrarTareas(tareas, criterios);
    return ordenarTareas(filtradas, ordenConfig.campo, ordenConfig.direccion);
}
