import { animarFotoAlScroll, iniciarHero, previsualizarProyecto } from './animaciones.js';
import { registrarGalerias } from './galerias.js';

function observarFotos(movimientoReducido, vistas) {
    if (movimientoReducido.matches || !('IntersectionObserver' in window) ||
        !Element.prototype.animate) return () => {};

    const activas = new Set();
    const observador = new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
            if (!entrada.isIntersecting) continue;

            const foto = entrada.target;
            observador.unobserve(foto);
            vistas.add(foto);

            // Si la descarga va tarde, dejamos que la imagen aparezca sin efecto.
            const imagen = foto.matches('img') ? foto : foto.querySelector('img.is-current');
            if (movimientoReducido.matches || !imagen?.complete || !imagen.naturalWidth) continue;

            const animacion = animarFotoAlScroll(imagen);
            activas.add(animacion);
            animacion.finished.then(() => activas.delete(animacion)).catch(() => {
                activas.delete(animacion);
            });
        }
    }, { rootMargin: '0px 0px 4% 0px', threshold: 0 });

    document.querySelectorAll('.project-media, .call-step img').forEach((foto) => {
        if (vistas.has(foto)) return;

        const caja = foto.getBoundingClientRect();
        if ((caja.top < window.innerHeight && caja.bottom > 0) || caja.bottom <= 0) {
            vistas.add(foto); // Nunca ocultar una foto que ya estaba a la vista.
        } else {
            observador.observe(foto);
        }
    });

    return () => {
        observador.disconnect();
        activas.forEach((animacion) => animacion.cancel());
        activas.clear();
    };
}

export function registrarEventos() {
    const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
    const punteroPreciso = window.matchMedia('(hover: hover) and (pointer: fine)');
    const hero = document.querySelector('.hero');
    const fotosVistas = new WeakSet();

    iniciarHero(hero, movimientoReducido);
    let detenerScroll = observarFotos(movimientoReducido, fotosVistas);
    registrarGalerias(movimientoReducido, punteroPreciso);

    const enlaces = document.querySelectorAll('.project-card > a:not(.call-button)');

    function actualizarProyecto(enlace) {
        const enfocado = enlace.matches(':focus-visible');
        const bajoPuntero = punteroPreciso.matches && enlace.matches(':hover');
        previsualizarProyecto(enlace, !movimientoReducido.matches && (enfocado || bajoPuntero));
    }

    enlaces.forEach((enlace) => {
        for (const evento of ['pointerenter', 'pointerleave', 'focus', 'blur']) {
            enlace.addEventListener(evento, () => actualizarProyecto(enlace));
        }
    });

    movimientoReducido.addEventListener('change', () => {
        if (!movimientoReducido.matches) {
            detenerScroll = observarFotos(movimientoReducido, fotosVistas);
            return;
        }

        hero?.removeAttribute('data-animacion');
        enlaces.forEach((enlace) => previsualizarProyecto(enlace, false));
        detenerScroll();
    });
}
