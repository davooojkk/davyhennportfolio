export function iniciarHero(hero, movimientoReducido) {
    const retrato = hero?.querySelector('.hero-img img');
    if (!retrato || movimientoReducido.matches || document.visibilityState === 'hidden') return;

    hero.dataset.animacion = 'entrada';
    retrato.addEventListener('animationend', () => {
        delete hero.dataset.animacion;
    }, { once: true });
}

export function animarFotoAlScroll(elemento) {
    const esProyecto = elemento.closest('.project-card') !== null;
    const fotogramas = esProyecto
        ? [
            { clipPath: 'polygon(0 0, 24% 0, 0 100%, 0 100%)' },
            { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        ]
        : [
            { opacity: .6, filter: 'brightness(.55) saturate(.65)' },
            { opacity: 1, filter: 'brightness(1) saturate(.8)' },
        ];

    const animacion = elemento.animate(fotogramas, {
        duration: esProyecto ? 750 : 600,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
        fill: 'both',
    });

    // Al terminar, el CSS retoma el control del hover y de las fotos.
    animacion.finished.then(() => animacion.cancel()).catch(() => {});
    return animacion;
}
