import { iniciarHero } from './animaciones.js';
import { registrarGalerias } from './galerias.js';

export function registrarEventos() {
    const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
    const punteroPreciso = window.matchMedia('(hover: hover) and (pointer: fine)');
    const hero = document.querySelector('.hero');

    iniciarHero(hero, movimientoReducido);
    registrarGalerias(movimientoReducido, punteroPreciso);

    movimientoReducido.addEventListener('change', () => {
        if (movimientoReducido.matches) hero?.removeAttribute('data-animacion');
    });
}
