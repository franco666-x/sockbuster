# Sockbuster Video & Socks

Evaluación Sumativa 03 · Modelamiento de soluciones informáticas (TI3025).
Prototipo web y modelo de arquitectura con el Paradigma 4+1 (PlantUML).

**Sitio publicado:** https://franco666-x.github.io/sockbuster/  <!-- reemplazar por el enlace real -->

## Integrantes
- Franco Carimoney
- Jorge Leal
- Gustavo Pavez

## Contenido
- `index.html`: inicio con la marca y los integrantes.
- `catalogo.html`: catálogo por colecciones, carrito, checkout simulado, reseñas y administración.
- `diagramas.html`: las 5 vistas del paradigma 4+1.
- `js/`: `catalogo.js` (RF01), `carrito.js` (RF02), `admin.js` (RF03), `resenas.js` (RF04), `auth.js` (RNF02).
- `productos.json`, `imagenes/`, `estilos.css`.
- `diagramas/`: imágenes de los diagramas y sus archivos `.puml`.

## Cuentas de prueba
- Cliente: `cliente@sockbuster.cl` / `cliente123`
- Administrador: `admin@sockbuster.cl` / `admin123`

## Nota técnica
Es un prototipo estático sin backend: el token JWT, el pago y los datos (carrito, reseñas, cambios del administrador) se simulan en el navegador con `localStorage`.
