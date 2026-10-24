# Paleta DavoTech

`css/basics/colores.css` define un único color de marca: **fucsia eléctrico `#f808b8`** (`--c-rosa`). Las demás intensidades se calculan mezclándolo con el blanco; no son rosas independientes.

| Token | Mezcla de fucsia | Uso |
| --- | ---: | --- |
| `--c-rosa` | 100 % | Foco de teclado, trazos y acentos pequeños |
| `--c-rosa-calmo` | 52 % | Texto y enlaces sobre fondos oscuros |
| `--c-rosa-aire` | 30 % | Botones y detalles con texto oscuro |
| `--c-rosa-niebla` | 16 % | Paneles amplios y bordes claros |

Carbón `#0d0d0d` y tinta `#21142b` son neutros de lectura. Los tonos translúcidos, los bordes y los estados hover se derivan de la escala anterior en `css/basics/tema.css`. Para ajustar la marca, modificar el fucsia base o los porcentajes y luego ejecutar `node scripts/build-css.mjs`; no editar `css/site.css` a mano.
