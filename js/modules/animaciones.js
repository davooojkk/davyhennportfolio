export function iniciarHero(hero, movimientoReducido) {
    const barra = hero?.querySelector('.hero-img');
    if (!barra || movimientoReducido.matches || document.visibilityState === 'hidden') return;

    hero.dataset.animacion = 'entrada';
    barra.addEventListener('animationend', (evento) => {
        if (evento.animationName === 'aparecer-halo') delete hero.dataset.animacion;
    }, { once: true });
}
