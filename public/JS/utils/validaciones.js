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
    // Objeto que acumulará los mensajes de error por campo
    const errores = {};

    // Se recorre cada regla definida para validar su campo correspondiente
    for (const nombreCampo in reglas) {
        // Se obtiene el elemento del formulario por su atributo name
        const campo = formulario.elements[nombreCampo];
        // Se obtiene la regla de validación para ese campo
        const regla = reglas[nombreCampo];

        // Si el campo no existe en el DOM, se ignora esa regla
        if (!campo) continue;

        // Si el campo es un grupo de radio buttons, se valida como grupo
        if (campo instanceof NodeList) {
            // Solo se valida si la regla indica que es requerido
            if (regla.required) {
                // Se llama a la función de validación para radio buttons
                const resultado = validarGrupoRadio(campo, regla);
                // Si no es válido, se guarda el mensaje de error
                if (!resultado.esValido) errores[nombreCampo] = resultado.mensaje;
            }
        }
        // Si el campo es de tipo texto o textarea, se valida como texto
        else if (campo.type === 'text' || campo.tagName === 'TEXTAREA') {
            // Se llama a la función de validación de texto
            const resultado = validarTexto(campo, regla);
            // Si no es válido, se guarda el mensaje de error
            if (!resultado.esValido) errores[nombreCampo] = resultado.mensaje;
        }
        // Si el campo es un select (desplegable), se valida como select
        else if (campo.type === 'select-one') {
            // Se llama a la función de validación de selects
            const resultado = validarSelect(campo, regla);
            // Si no es válido, se guarda el mensaje de error
            if (!resultado.esValido) errores[nombreCampo] = resultado.mensaje;
        }
    }

    // El formulario es válido solo si no se registró ningún error
    const valido = Object.keys(errores).length === 0;
    // Se retorna un objeto con el resultado de la validación y los errores encontrados
    return { valido, errores };
};

// --- Funciones internas de validación ---

/**
 * Valida que al menos un radio button del grupo esté seleccionado.
 */
const validarGrupoRadio = (nodosRadio, regla) => {
    // Se verifica si alguno de los radio buttons del grupo está marcado
    const haySeleccion = Array.from(nodosRadio).some(radio => radio.checked);
    // Si hay selección, es válido; si no, se retorna el mensaje de error
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
    // Se obtiene el valor del campo eliminando espacios al inicio y al final
    const valor = campo.value.trim();

    // Si el campo es requerido y está vacío, se retorna el mensaje de error
    if (regla.required && valor === '') {
        return { esValido: false, mensaje: regla.mensaje };
    }
    // Si el valor tiene menos caracteres que el mínimo permitido
    if (regla.min && valor.length < regla.min) {
        return { esValido: false, mensaje: `Mínimo ${regla.min} caracteres requeridos` };
    }
    // Si el valor tiene más caracteres que el máximo permitido
    if (regla.max && valor.length > regla.max) {
        return { esValido: false, mensaje: `Máximo ${regla.max} caracteres permitidos` };
    }

    // Si pasó todas las validaciones, el campo es válido
    return { esValido: true };
};

/**
 * Valida que el select no esté en la opción por defecto (índice 0).
 */
const validarSelect = (campo, regla) => {
    // Si el campo es requerido y sigue en la primera opción (placeholder), es inválido
    if (regla.required && campo.selectedIndex === 0) {
        return { esValido: false, mensaje: regla.mensaje };
    }
    // Si se seleccionó una opción válida, es correcto
    return { esValido: true };
};
