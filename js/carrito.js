/* RF02: carrito, modificación de cantidades y checkout simulado (resumen con ID único). */
const Carrito = (() => {
  const KEY = 'sb_carrito';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
  const $ = id => document.getElementById(id);
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} dibujar(); }

  function agregarProducto(c, talla, cantidad) {
    const disp = c.stock[talla] || 0;
    const it = items.find(i => i.id === c.id && i.talla === talla);
    const nueva = (it ? it.cantidad : 0) + cantidad;
    if (nueva > disp) return { ok: false, msg: `Stock disponible en talla ${talla}: ${disp}` };
    if (it) it.cantidad = nueva; else items.push({ id: c.id, talla, cantidad });
    guardar(); return { ok: true };
  }
  function modificarCantidad(item, cantidad) {
    const c = Catalogo.obtener(item.id);
    if (cantidad <= 0) items = items.filter(i => i !== item);
    else if (cantidad <= (c.stock[item.talla] || 0)) item.cantidad = cantidad;
    guardar();
  }
  const calcularTotal = () => items.reduce((s, i) => { const c = Catalogo.obtener(i.id); return s + (c ? c.precio * i.cantidad : 0); }, 0);

  /* Procesos concurrentes del diagrama de secuencia: generar ID y verificar pago; se sincroniza con Promise.all. */
  const generarId = () => new Promise(r => setTimeout(() => r('SB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()), 300));
  const verificarPago = () => new Promise(r => setTimeout(() => r('APROBADO (simulado)'), 800));

  function generarResumen(p) {
    const l = p.detalle.map(d => `- ${d.nombre} | talla ${d.talla} | ${d.cantidad} x ${Catalogo.clp(d.precioUnitario)}`);
    return [`Pedido: ${p.idPedido}`, `Fecha: ${p.fecha}`, `Pago: ${p.estadoPago}`, '', ...l, '', `Total: ${Catalogo.clp(p.total)}`].join('\n');
  }
  async function checkout() {
    if (!items.length) return null;
    const total = calcularTotal();
    const detalle = items.map(i => { const c = Catalogo.obtener(i.id); return { nombre: c.nombre, talla: i.talla, cantidad: i.cantidad, precioUnitario: c.precio }; });
    const [idPedido, estadoPago] = await Promise.all([generarId(), verificarPago()]);
    const pedido = { idPedido, estadoPago, total, detalle, fecha: new Date().toLocaleString('es-CL') };
    pedido.resumen = generarResumen(pedido);
    items = []; guardar();
    return pedido;
  }
  function dibujar() {
    if (!$('carrito-lista')) return;
    $('carrito-lista').innerHTML = items.map((i, n) => {
      const c = Catalogo.obtener(i.id); if (!c) return '';
      return `<li><div><strong>${Catalogo.esc(c.nombre)}</strong><br><small>Talla ${i.talla} · ${Catalogo.clp(c.precio)}</small></div>
        <div class="cant"><button data-n="${n}" data-d="-1" aria-label="Quitar uno">−</button><span>${i.cantidad}</span><button data-n="${n}" data-d="1" aria-label="Agregar uno">+</button></div></li>`;
    }).join('') || '<li class="vacio">El carrito está vacío.</li>';
    $('carrito-total').textContent = Catalogo.clp(calcularTotal());
    $('carrito-cuenta').textContent = items.reduce((s, i) => s + i.cantidad, 0);
    $('btn-checkout').disabled = !items.length;
  }
  function iniciar() {
    $('carrito-lista').addEventListener('click', e => {
      const b = e.target.closest('[data-n]'); if (!b) return;
      const it = items[Number(b.dataset.n)]; modificarCantidad(it, it.cantidad + Number(b.dataset.d));
    });
    $('btn-checkout').addEventListener('click', async e => {
      e.target.disabled = true; e.target.textContent = 'Verificando pago…';
      const p = await checkout();
      e.target.textContent = 'Realizar checkout';
      if (p) { $('resumen-texto').textContent = p.resumen; $('dlg-resumen').showModal(); }
    });
    document.addEventListener('catalogo:cambio', dibujar);
    dibujar();
  }
  return { iniciar, agregarProducto, modificarCantidad, calcularTotal, checkout };
})();
