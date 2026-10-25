export function registrarGalerias(movimientoReducido, punteroPreciso) {
    const galerias = [];

    document.querySelectorAll('.project-media').forEach((media) => {
        const fotos = [...media.querySelectorAll('img')];
        if (fotos.length < 2) return;

        const controles = media.querySelector('.project-gallery-controls');
        const contador = media.querySelector('.project-gallery-count');
        let indice = 0;
        let ocupada = false;
        const pendientes = [];
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

        function prepararFoto(foto) {
            if (foto.dataset.src) {
                foto.loading = 'eager';
                foto.src = foto.dataset.src;
                delete foto.dataset.src;
            }
            return foto.decode();
        }

        function desocupar() {
            ocupada = false;
            if (pendientes.length) void pasarCarta(pendientes.shift(), true);
        }

        async function pasarCarta(direccion, manual) {
            if (ocupada) {
                // No perder un segundo toque mientras se decodifica o revela la foto.
                if (manual && pendientes.length < 2) pendientes.push(direccion);
                return;
            }

            ocupada = true;
            const siguiente = (indice + direccion + fotos.length) % fotos.length;
            const saliente = fotos[indice];
            const entrante = fotos[siguiente];

            try {
                await prepararFoto(entrante);
            } catch {
                desocupar(); // Una foto que no cargó nunca deja un hueco en la galería.
                return;
            }

            if (!manual && !puedeAvanzarSolo()) {
                desocupar();
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

                animaciones = [
                    entrante.animate([
                        { transform: `translateX(${direccion * 8}px)`, opacity: .72 },
                        { transform: 'none', opacity: 1 },
                    ], { duration: 280, easing: 'ease-out', fill: 'both' }),
                ];
            } else {
                saliente.classList.remove('is-current');
                entrante.classList.add('is-current');
                // El cambio sin animación y el número se pintan juntos.
                if (document.visibilityState === 'visible') {
                    await new Promise((resolve) => requestAnimationFrame(resolve));
                }
            }

            // Imagen y contador quedan listos en el mismo frame, no al final del efecto.
            indice = siguiente;
            saliente.setAttribute('aria-hidden', 'true');
            entrante.removeAttribute('aria-hidden');
            contador.setAttribute('aria-live', manual ? 'polite' : 'off');
            contador.textContent = `${indice + 1} / ${fotos.length}`;

            if (animaciones.length) {
                await Promise.allSettled(animaciones.map((animacion) => animacion.finished));
                animaciones.forEach((animacion) => animacion.cancel());
                animaciones = [];
            }

            saliente.classList.remove('is-current', 'is-outgoing');
            entrante.classList.remove('is-incoming');
            entrante.classList.add('is-current');
            desocupar();
        }

        media.addEventListener('pointerenter', (evento) => {
            if (evento.pointerType === 'mouse') {
                void prepararFoto(fotos[(indice + 1) % fotos.length]).catch(() => {});
                programar(550);
            }
        });
        media.addEventListener('pointerleave', detener);
        controles.addEventListener('pointerenter', detener);
        controles.addEventListener('pointerleave', () => programar(2500));
        media.addEventListener('focusin', () => {
            detener();
            void prepararFoto(fotos[(indice + 1) % fotos.length]).catch(() => {});
        });
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
