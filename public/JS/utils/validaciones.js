// ============================================================
// CAPA UTILS — validaciones.js
// Responsabilidad: validar formularios usando un objeto de
// reglas declarativas, sin modificar el DOM directamente.
// ============================================================

/**
 * Valida todos los campos de un formulario según las reglas dadas.
 *
 * @param {HTMLFormElement} formulario - El formulario HTML a validar.
 * @param {Object} reglas - Objeto donde cada clave es un name de campo y
 *   su valor define las restricciones: { required, min, max, mensaje }.
 * @returns {{ valido: boolean, errores: Object }} Resultado de la validación.
 *
 * @example
 * const { valido, errores } = validar(miFormulario, {
 *   nombre: { required: true, min: 3, mensaje: 'El nombre es obligatorio' }
 * });
 */
export const validar = (formulario, reglas) => {
    const errores = {};

    for (const nombreCampo in reglas) {
        const campo = formulario.elements[nombreCampo];
        const regla = reglas[nombreCampo];

        // Si el campo no existe en el DOM se ignora
        if (!campo) continue;

        // Radio buttons → NodeList
        if (campo instanceof NodeList) {
            if (regla.required) {
                const resultado = validarGrupoRadio(campo, regla);
                if (!resultado.esValido) errores[nombreCampo] = resultado.mensaje;
            }
        }
        // Texto / Textarea
        else if (campo.type === 'text' || campo.tagName === 'TEXTAREA') {
            const resultado = validarTexto(campo, regla);
            if (!resultado.esValido) errores[nombreCampo] = resultado.mensaje;
        }
        // Select
        else if (campo.type === 'select-one') {
            const resultado = validarSelect(campo, regla);
            if (!resultado.esValido) errores[nombreCampo] = resultado.mensaje;
        }
    }

    // El formulario es válido solo si no hay ningún error
    const valido = Object.keys(errores).length === 0;
    return { valido, errores };
};

// --- Funciones internas de validación ---

/**
 * Valida que al menos un radio button del grupo esté seleccionado.
 */
const validarGrupoRadio = (nodosRadio, regla) => {
    const haySeleccion = Array.from(nodosRadio).some(radio => radio.checked);
    return haySeleccion
        ? { esValido: true }
        : { esValido: false, mensaje: regla.mensaje };
};

/**
 * Valida un campo de texto o textarea:
 * - No puede estar vacío si es requerido.
 * - Debe cumplir los límites de longitud min/max.
 */
const validarTexto = (campo, regla) => {
    const valor = campo.value.trim();

    if (regla.required && valor === '') {
        return { esValido: false, mensaje: regla.mensaje };
    }
    if (regla.min && valor.length < regla.min) {
        return { esValido: false, mensaje: `Mínimo ${regla.min} caracteres requeridos` };
    }
    if (regla.max && valor.length > regla.max) {
        return { esValido: false, mensaje: `Máximo ${regla.max} caracteres permitidos` };
    }

    return { esValido: true };
};

/**
 * Valida que el select no esté en la opción por defecto (índice 0).
 */
const validarSelect = (campo, regla) => {
    if (regla.required && campo.selectedIndex === 0) {
        return { esValido: false, mensaje: regla.mensaje };
    }
    return { esValido: true };
};