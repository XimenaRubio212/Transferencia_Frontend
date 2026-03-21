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
    // Se filtran las tareas que cumplan todos los criterios activos
    return tareas.filter(tarea => {
        // Se verifica si la tarea pasa el filtro de estado
        // Si no hay criterio de estado o es 'todos', la tarea pasa automáticamente
        const pasaEstado =
            !criterios.estado || criterios.estado === 'todos'
                ? true
                : tarea.estado === criterios.estado;

        // Se verifica si la tarea pasa el filtro de usuario
        // Si no hay criterio de userId o es 'todos', la tarea pasa automáticamente
        const pasaUsuario =
            !criterios.userId || criterios.userId === 'todos'
                ? true
                // Se comparan como strings para evitar problemas de tipo
                : String(tarea.userId) === String(criterios.userId);

        // La tarea solo se incluye si pasa ambos filtros
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
    // Se crea una copia del arreglo para no mutar el original
    const copia = [...tareas];

    // Se ordena la copia usando el método sort con una función de comparación
    copia.sort((a, b) => {
        // Se obtienen los valores del campo a comparar (si no existe, se usa cadena vacía)
        let valorA = a[campo] ?? '';
        let valorB = b[campo] ?? '';

        // Si ambos valores son números, se hace comparación numérica
        if (typeof valorA === 'number' && typeof valorB === 'number') {
            // Para ascendente se resta A - B, para descendente B - A
            return direccion === 'asc' ? valorA - valorB : valorB - valorA;
        }

        // Si son texto, se convierten a minúsculas para comparación insensible a mayúsculas
        valorA = String(valorA).toLowerCase();
        valorB = String(valorB).toLowerCase();

        // Se comparan los textos y se aplica la dirección de ordenamiento
        if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
        // Si son iguales, se mantiene el orden actual
        return 0;
    });

    // Se retorna la copia ordenada
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
    // Primero se filtran las tareas según los criterios
    const filtradas = filtrarTareas(tareas, criterios);
    // Luego se ordenan las tareas filtradas y se retorna el resultado
    return ordenarTareas(filtradas, ordenConfig.campo, ordenConfig.direccion);
}
