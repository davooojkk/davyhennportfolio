export function registrarGalerias(movimientoReducido, punteroPreciso) {
    const galerias = [];

    document.querySelectorAll('.project-media').forEach((media) => {
        const fotos = [...media.querySelectorAll('img')];
        if (fotos.length < 2) return;

        const controles = media.querySelector('.project-gallery-controls');
        const contador = media.querySelector('.project-gallery-count');
        let indice = 0;
        let ocupada = false;
        let temporizador;
        let animaciones = [];

        media.dataset.galleryReady = '';

        function detener() {
            window.clearTimeout(temporizador);
            temporizador = undefined;
        }

        function puedeAvanzarSolo() {
            return !movimientoReducido.matches && punteroPreciso.matches &&
                media.matches(':hover') && !controles.matches(':hover') &&
                !media.closest('.project-card').contains(document.activeElement);
        }

        function programar(demora) {
            detener();
            if (!puedeAvanzarSolo()) return;

            temporizador = window.setTimeout(async () => {
                temporizador = undefined;
                if (media.querySelector('img.is-current').getAnimations().length) {
                    programar(250); // El barrido inicial de scroll tiene prioridad.
                    return;
                }
                await pasarCarta(1, false);
                programar(2500);
            }, demora);
        }

        async function pasarCarta(direccion, manual) {
            if (ocupada) return;

            ocupada = true;
            const siguiente = (indice + direccion + fotos.length) % fotos.length;
            const saliente = fotos[indice];
            const entrante = fotos[siguiente];
            entrante.loading = 'eager';

            try {
                await entrante.decode();
            } catch {
                ocupada = false; // Una foto que no cargó nunca deja un hueco en la galería.
                return;
            }

            if (!manual && !puedeAvanzarSolo()) {
                ocupada = false;
                return;
            }

            // Si alguien pulsa una flecha durante la entrada al scroll,
            // terminamos ese barrido antes de pasar la carta.
            if (manual) {
                saliente.getAnimations().forEach((animacion) => {
                    if (animacion.effect?.getKeyframes().some((fotograma) => 'clipPath' in fotograma)) {
                        animacion.finish();
                    }
                });
            }

            if (!movimientoReducido.matches && Element.prototype.animate) {
                saliente.classList.add('is-outgoing');
                entrante.classList.add('is-incoming');

                const opciones = {
                    duration: 650,
                    easing: 'cubic-bezier(.22, 1, .36, 1)',
                    fill: 'both',
                };

                animaciones = [
                    saliente.animate([
                        { transform: 'translateX(0) rotate(0deg)', opacity: 1 },
                        { transform: `translateX(${direccion * -108}%) rotate(${direccion * -9}deg)`, opacity: .8 },
                    ], opciones),
                    entrante.animate([
                        { transform: `translateX(${direccion * 14}%) rotate(${direccion * 4}deg) scale(.97)`, opacity: .9 },
                        { transform: 'none', opacity: 1 },
                    ], opciones),
                ];

                await Promise.allSettled(animaciones.map((animacion) => animacion.finished));
                animaciones.forEach((animacion) => animacion.cancel());
                animaciones = [];
            }

            saliente.classList.remove('is-current', 'is-outgoing');
            saliente.setAttribute('aria-hidden', 'true');
            entrante.classList.remove('is-incoming');
            entrante.classList.add('is-current');
            entrante.removeAttribute('aria-hidden');
            indice = siguiente;
            contador.setAttribute('aria-live', manual ? 'polite' : 'off');
            contador.textContent = `${indice + 1} / ${fotos.length}`;
            ocupada = false;
        }

        media.addEventListener('pointerenter', (evento) => {
            if (evento.pointerType === 'mouse') programar(550);
        });
        media.addEventListener('pointerleave', detener);
        controles.addEventListener('pointerenter', detener);
        controles.addEventListener('pointerleave', () => programar(2500));
        media.addEventListener('focusin', detener);
        media.addEventListener('focusout', () => programar(2500));

        for (const [selector, direccion] of [['.project-gallery-prev', -1], ['.project-gallery-next', 1]]) {
            controles.querySelector(selector).addEventListener('click', () => {
                detener();
                pasarCarta(direccion, true);
            });
        }

        media.addEventListener('keydown', (evento) => {
            if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
            evento.preventDefault();
            detener();
            pasarCarta(evento.key === 'ArrowRight' ? 1 : -1, true);
        });

        galerias.push({ detener, terminar: () => {
            animaciones.forEach((animacion) => {
                if (animacion.playState === 'running' || animacion.playState === 'paused') {
                    animacion.finish();
                }
            });
        }, programar });
    });

    movimientoReducido.addEventListener('change', () => {
        galerias.forEach((galeria) => {
            if (movimientoReducido.matches) {
                galeria.detener();
                galeria.terminar();
            } else {
                galeria.programar(2500);
            }
        });
    });
}
