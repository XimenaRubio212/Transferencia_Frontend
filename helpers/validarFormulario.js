// Sistema de validación adaptado del patrón de DavidPineda02/11-Actividad-Clase
// Valida formularios usando reglas definidas por campo, sin insertar HTML directo.

/**
 * Valida un formulario según un objeto de reglas.
 * @param {HTMLFormElement} form - Formulario a validar
 * @param {Object} reglas - { nombreCampo: { required, min, max, mensaje } }
 * @returns {{ valido: boolean, errores: Object }}
 */
export const validar = (form, reglas) => {
    const errores = {};
    let valido = true;

    for (const name in reglas) {
        const campo = form.elements[name];
        const regla = reglas[name];

        if (!campo) continue;

        if (campo instanceof NodeList) {
            if (regla.required) {
                const { esValido, mensaje } = validarNodos(campo, regla);
                if (!esValido) {
                    valido = false;
                    errores[name] = mensaje;
                }
            }
        } else if (campo.type === "text" || campo.tagName === "TEXTAREA") {
            const { esValido, mensaje } = validarCamposTipoText(campo, regla);
            if (!esValido) {
                valido = false;
                errores[name] = mensaje;
            }
        } else if (campo.type === "select-one") {
            const { esValido, mensaje } = validarCamposTipoSelect(campo, regla);
            if (!esValido) {
                valido = false;
                errores[name] = mensaje;
            }
        }
    }

    if (Object.keys(errores).length !== 0) {
        valido = false;
    }

    return { valido, errores };
};

/**
 * Valida un grupo de radio buttons (NodeList).
 */
const validarNodos = (nodo, regla) => {
    for (const key of nodo) {
        if (key.checked) {
            return { esValido: true };
        }
    }
    return { esValido: false, mensaje: regla.mensaje };
};

/**
 * Valida campos de tipo texto / textarea.
 */
const validarCamposTipoText = (elemento, regla) => {
    const valor = elemento.value.trim();

    if (regla.required && valor === "") {
        return { esValido: false, mensaje: regla.mensaje };
    }

    if (regla.required && regla.min && valor.length < regla.min) {
        return {
            esValido: false,
            mensaje: `El campo debe tener como minimo ${regla.min} caracteres`,
        };
    }

    if (regla.required && regla.max && valor.length > regla.max) {
        return {
            esValido: false,
            mensaje: `El campo debe tener como maximo ${regla.max} caracteres`,
        };
    }

    return { esValido: true };
};

/**
 * Valida campos de tipo select.
 */
const validarCamposTipoSelect = (elemento, regla) => {
    if (regla.required && elemento.selectedIndex === 0) {
        return { esValido: false, mensaje: regla.mensaje };
    }
    return { esValido: true };
};
