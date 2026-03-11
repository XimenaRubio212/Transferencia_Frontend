// ============================================================
// MÓDULO DE NOTIFICACIONES — notificaciones.js
// Responsabilidad: mostrar mensajes de éxito, error e información
// al usuario de forma visual. No depende del módulo API.
// ============================================================

// Tiempo en milisegundos que la notificación permanece visible
const DURACION_NOTIFICACION = 3500;

/**
 * Muestra una notificación flotante en la parte superior de la pantalla.
 *
 * @param {string} mensaje  - Texto que se mostrará al usuario.
 * @param {'exito'|'error'|'info'} tipo - Variante visual de la notificación.
 */
export function mostrarNotificacion(mensaje, tipo = 'info') {
    // Reutilizar el contenedor si ya existe, o crearlo la primera vez
    let contenedor = document.getElementById('notif-contenedor');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'notif-contenedor';
        contenedor.style.cssText = `
            position: fixed;
            top: 1.2rem;
            right: 1.2rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        `;
        document.body.appendChild(contenedor);
    }

    // Colores por tipo
    const estilos = {
        exito: { fondo: '#22c55e', icono: '✔' },
        error: { fondo: '#ef4444', icono: '✖' },
        info:  { fondo: '#3b82f6', icono: 'ℹ' }
    };
    const { fondo, icono } = estilos[tipo] ?? estilos.info;

    // Crear el elemento de la notificación
    const notif = document.createElement('div');
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
    notif.innerHTML = `<span>${icono}</span><span>${mensaje}</span>`;
    contenedor.appendChild(notif);

    // Animación de entrada
    requestAnimationFrame(() => {
        notif.style.opacity = '1';
        notif.style.transform = 'translateX(0)';
    });

    // Animación de salida y eliminación del DOM
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(60px)';
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
