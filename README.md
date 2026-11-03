# Figuras SMX · CECAC

Galería de figuras interactivas (dibujadas con el kit Anatomy) para el ciclo de Sistemas Microinformáticos y Redes del CECAC. **Uso educativo.**

Portada: `index.html`. Cada figura está en `figuras/<nombre>/` (`index.html` tema claro, `oscuro.html` tema oscuro) y funciona sin servidor.

| Figura | Módulo | Tema |
|---|---|---|
| Despiece de una semitorre ATX | MP0221 | Montaje |
| Despiece de un mini PC | MP0221 | Montaje |
| Arquitectura del ordenador (Von Neumann y Harvard) | MP0221 | Arquitectura |
| El cuello de botella del almacenamiento | MP0221 | Almacenamiento |
| Tipos de discos: interfaz y velocidad | MP0221 | Almacenamiento |
| Memoria RAM: celda 1T1C y generaciones | MP0221 | Memoria |

## Añadir o actualizar una figura

1. Reconstruir la figura en su carpeta de trabajo (`node build.mjs` y `node build.mjs --light`).
2. Si es nueva, añadir una entrada a `FIGURAS` en `build-galeria.mjs`.
3. `node build-galeria.mjs --shots` copia las figuras, rehace las miniaturas y la portada.

## Autoría y licencia

© 2026 Angel Ortiz. Código y contenido propios bajo licencia MIT (ver `LICENSE`).
Desarrollado con ayuda de IA (Claude).
Las figuras incrustan el kit Anatomy, MIT © 2026 Ryan (ver `LICENSE-anatomy-kit`).
El logo de CECAC (`cecac_logo.jpg`) es del centro y queda **excluido** de la licencia.
