// ============================================================
// MÓDULO DE NOTIFICACIONES — notificaciones.js
// Responsabilidad: mostrar mensajes de éxito, error e información
// al usuario de forma visual. No depende del módulo API.
// ============================================================

// Tiempo en milisegundos que la notificación permanece visible antes de desaparecer
const DURACION_NOTIFICACION = 3500;

/**
 * Muestra una notificación flotante en la parte superior de la pantalla.
 *
 * @param {string} mensaje  - Texto que se mostrará al usuario.
 * @param {'exito'|'error'|'info'} tipo - Variante visual de la notificación.
 */
export function mostrarNotificacion(mensaje, tipo = 'info') {
    // Se busca el contenedor de notificaciones en el DOM por su ID
    let contenedor = document.getElementById('notif-contenedor');
    // Si el contenedor no existe todavía, se crea por primera vez
    if (!contenedor) {
        // Se crea un elemento div que servirá como contenedor de todas las notificaciones
        contenedor = document.createElement('div');
        // Se le asigna un ID para poder reutilizarlo en futuras notificaciones
        contenedor.id = 'notif-contenedor';
        // Se aplican estilos CSS inline para posicionarlo fijo en la esquina superior derecha
        contenedor.style.cssText = `
            position: fixed;
            top: 1.2rem;
            right: 1.2rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        `;
        // Se agrega el contenedor al final del body del documento
        document.body.appendChild(contenedor);
    }

    // Se definen los colores de fondo e iconos según el tipo de notificación
    const estilos = {
        exito: { fondo: '#22c55e', icono: '✔' },  // Verde para éxito
        error: { fondo: '#ef4444', icono: '✖' },  // Rojo para error
        info:  { fondo: '#3b82f6', icono: 'ℹ' }   // Azul para información
    };
    // Se obtienen el color de fondo y el icono según el tipo (por defecto: info)
    const { fondo, icono } = estilos[tipo] ?? estilos.info;

    // Se crea el elemento div que representa la notificación individual
    const notif = document.createElement('div');
    // Se aplican estilos CSS inline para la apariencia y animación de la notificación
    notif.style.cssText = `
        background: ${fondo};
        color: #fff;
        padding: 0.75rem 1.2rem;
        border-radius: 8px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateX(60px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        max-width: 320px;
    `;
    // Se inserta el icono y el mensaje dentro de la notificación
    notif.innerHTML = `<span>${icono}</span><span>${mensaje}</span>`;
    // Se agrega la notificación al contenedor
    contenedor.appendChild(notif);

    // Se usa requestAnimationFrame para iniciar la animación de entrada en el siguiente frame
    requestAnimationFrame(() => {
        // Se hace visible la notificación (transición de opacidad)
        notif.style.opacity = '1';
        // Se mueve la notificación a su posición final (transición de desplazamiento)
        notif.style.transform = 'translateX(0)';
    });

    // Después de la duración configurada, se inicia la animación de salida
    setTimeout(() => {
        // Se hace invisible la notificación gradualmente
        notif.style.opacity = '0';
        // Se desplaza la notificación hacia la derecha
        notif.style.transform = 'translateX(60px)';
        // Cuando termina la animación CSS, se elimina el elemento del DOM
        notif.addEventListener('transitionend', () => notif.remove(), { once: true });
    }, DURACION_NOTIFICACION);
}

/**
 * Atajo para notificación de éxito.
 * @param {string} mensaje
 */
export const notificarExito = (mensaje) => mostrarNotificacion(mensaje, 'exito');

/**
 * Atajo para notificación de error.
 * @param {string} mensaje
 */
export const notificarError = (mensaje) => mostrarNotificacion(mensaje, 'error');

/**
 * Atajo para notificación informativa.
 * @param {string} mensaje
 */
export const notificarInfo = (mensaje) => mostrarNotificacion(mensaje, 'info');
