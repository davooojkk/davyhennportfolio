# Paleta DavoTech

`css/basics/colores.css` define un único color de marca: **fucsia eléctrico `#f808b8`** (`--c-rosa`). Las demás intensidades se calculan mezclándolo con el blanco; no son rosas independientes.

| Token | Mezcla de fucsia | Uso |
| --- | ---: | --- |
| `--c-rosa` | 100 % | Foco de teclado, trazos y acentos pequeños |
| `--c-rosa-calmo` | 52 % | Texto y enlaces sobre fondos oscuros |
| `--c-rosa-aire` | 30 % | Botones y detalles con texto oscuro |
| `--c-rosa-niebla` | 16 % | Paneles amplios y bordes claros |

Carbón `#0d0d0d` y tinta `#21142b` son neutros de lectura. Los tonos translúcidos, los bordes y los estados hover se derivan de la escala anterior en `css/basics/tema.css`. Para ajustar la marca, modificar el fucsia base o los porcentajes y luego ejecutar `node scripts/build-css.mjs`; no editar `css/site.css` a mano.

La sección de contacto usa `--c-rosa-fondo-contacto` (30 % de fucsia mezclado con carbón), no tinta azulada. Los enlaces con forma de botón comparten `--radio-boton` y los tokens `--c-boton-*`: contorno y texto rosas, fondo transparente también al pasar el cursor. El control de cada galería usa la misma regla; su soporte oscuro es solo un respaldo de contraste sobre las fotografías.

Las sombras comparten `--sombra-desplazamiento` y `--sombra-difusion`. `--sombra-captura` aplica profundidad suave a las capturas rectangulares; `--sombra-retrato` usa esa misma geometría como `drop-shadow` para respetar la silueta transparente de la foto. Sus colores (`--c-sombra-base` y `--c-sombra-acento`) derivan del carbón y del fucsia de la marca, respectivamente. Las fotos del proceso no llevan sombra: así su elevación al hover se lee sin ruido.
