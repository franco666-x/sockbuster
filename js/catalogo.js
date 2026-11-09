/* RF01: catálogo por colecciones (carga productos.json, filtra y muestra foto, precio, stock y tallas). */
const Catalogo = (() => {
  const KEY = 'sb_catalogo';
  let datos = { colecciones: [], obras: [], calcetines: [] };
  let filtro = 0;
  const TALLAS = ['S', 'M', 'L'];
  const clp = n => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);

  async function cargar() {
    try { const g = JSON.parse(localStorage.getItem(KEY)); if (g && g.calcetines) { datos = g; return; } } catch (e) {}
    const r = await fetch('productos.json');
    datos = await r.json();
  }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(datos)); } catch (e) {} }
  async function restablecer() { try { localStorage.removeItem(KEY); } catch (e) {} await cargar(); filtro = 0; dibujar(); }
  const obtener = id => datos.calcetines.find(c => c.id === id);
  const coleccion = id => datos.colecciones.find(c => c.id === id);
  const obra = id => datos.obras.find(o => o.id === id);
  const stockTotal = c => TALLAS.reduce((s, t) => s + (c.stock[t] || 0), 0);

  function dibujarFiltros() {
    const op = [{ id: 0, nombre: 'Todas' }, ...datos.colecciones];
    $('filtros').innerHTML = op.map(c => `<button class="chip ${c.id === filtro ? 'activo' : ''}" data-col="${c.id}" aria-pressed="${c.id === filtro}">${esc(c.nombre)}</button>`).join('');
  }
  function dibujarGrilla() {
    const lista = datos.calcetines.filter(c => !filtro || c.coleccionId === filtro);
    $('contador').textContent = `${lista.length} modelo(s)`;
    $('grilla').innerHTML = lista.map(c => {
      const o = obra(c.obraId), col = coleccion(c.coleccionId), tot = stockTotal(c);
      const tallas = TALLAS.map(t => `<option value="${t}" ${!c.stock[t] ? 'disabled' : ''}>${t} (stock ${c.stock[t] || 0})</option>`).join('');
      return `<article class="tarjeta" data-id="${c.id}">
        <img src="${esc(c.foto)}" alt="Foto de ${esc(c.nombre)}" loading="lazy">
        <div class="cuerpo">
          <span class="etiqueta">${esc(col ? col.nombre : '')}</span>
          <h3>${esc(c.nombre)}</h3>
          <p class="obra">${o ? esc(o.tipo) + ': ' + esc(o.titulo) : ''}</p>
          <p class="precio">${clp(c.precio)}</p>
          <p class="stock ${tot ? '' : 'agotado'}">${tot ? 'Stock total: ' + tot : 'Agotado'}</p>
          <div class="fila"><select aria-label="Talla">${tallas}</select>
          <input type="number" min="1" value="1" aria-label="Cantidad"></div>
          <button class="btn" data-accion="agregar" ${tot ? '' : 'disabled'}>Agregar al carrito</button>
          <button class="btn sec" data-accion="resenas">Ver reseñas</button>
        </div></article>`;
    }).join('') || '<p>No hay modelos en esta colección.</p>';
  }
  function dibujar() { dibujarFiltros(); dibujarGrilla(); document.dispatchEvent(new Event('catalogo:cambio')); }
  function filtrar(id) { filtro = id; dibujar(); }

  async function iniciar() {
    try { await cargar(); }
    catch (e) { $('grilla').innerHTML = '<p class="aviso">No se pudo cargar productos.json. Abre el sitio desde GitHub Pages o con un servidor local (no con doble clic).</p>'; return; }
    dibujar();
    $('filtros').addEventListener('click', e => { const b = e.target.closest('[data-col]'); if (b) filtrar(Number(b.dataset.col)); });
    $('grilla').addEventListener('click', e => {
      const b = e.target.closest('[data-accion]'); if (!b) return;
      const card = b.closest('.tarjeta'), c = obtener(Number(card.dataset.id));
      if (b.dataset.accion === 'agregar') {
        const r = Carrito.agregarProducto(c, card.querySelector('select').value, Math.max(1, parseInt(card.querySelector('input').value, 10) || 1));
        if (!r.ok) alert(r.msg); else document.getElementById('carrito').classList.add('abierto');
      } else Resenas.abrirFicha(c);
    });
  }
  return { iniciar, guardar, restablecer, dibujar, obtener, datos: () => datos, clp, esc, TALLAS };
})();
