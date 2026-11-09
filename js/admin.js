/* RF03: administración de inventario y temáticas. Cada operación exige un token JWT con rol admin (RNF02). */
const Admin = (() => {
  const $ = id => document.getElementById(id);
  function exigir() { if (!Auth.verificar('admin')) throw new Error('Acceso denegado: se requiere autenticación de administrador.'); }
  function registrarCalcetin(d) {
    exigir();
    const bd = Catalogo.datos();
    let o = bd.obras.find(x => x.id === d.obraId);
    if (!o) { o = { id: Math.max(0, ...bd.obras.map(x => x.id)) + 1, titulo: d.obraTitulo, tipo: d.obraTipo }; bd.obras.push(o); }
    const c = { id: Math.max(0, ...bd.calcetines.map(x => x.id)) + 1, nombre: d.nombre, coleccionId: d.coleccionId, obraId: o.id, foto: 'imagenes/nuevo.svg', precio: d.precio, stock: { S: d.stock, M: d.stock, L: d.stock } };
    bd.calcetines.push(c); Catalogo.guardar(); Catalogo.dibujar(); return c;
  }
  function actualizarStock(id, talla, cantidad) { exigir(); Catalogo.obtener(id).stock[talla] = cantidad; Catalogo.guardar(); Catalogo.dibujar(); }
  function modificarPrecio(id, precio) { exigir(); Catalogo.obtener(id).precio = precio; Catalogo.guardar(); Catalogo.dibujar(); }

  function llenar() {
    const bd = Catalogo.datos(), op = a => a.map(x => `<option value="${x.id}">${Catalogo.esc(x.nombre || x.titulo)}</option>`).join('');
    $('adm-col').innerHTML = op(bd.colecciones);
    $('adm-obra').innerHTML = op(bd.obras) + '<option value="0">+ Nueva película / serie…</option>';
    $('adm-prod-stock').innerHTML = $('adm-prod-precio').innerHTML = op(bd.calcetines);
    $('adm-nueva-obra').hidden = $('adm-obra').value !== '0';
  }
  const aviso = (t, ok = true) => { $('adm-msg').textContent = t; $('adm-msg').className = ok ? 'ok' : 'error'; };
  function envolver(fn) { return e => { e.preventDefault(); try { fn(); llenar(); } catch (er) { aviso(er.message, false); } }; }
  function iniciar() {
    document.addEventListener('catalogo:cambio', llenar);
    $('adm-obra').addEventListener('change', () => { $('adm-nueva-obra').hidden = $('adm-obra').value !== '0'; });
    $('f-nuevo').addEventListener('submit', envolver(() => {
      const oid = Number($('adm-obra').value);
      const c = registrarCalcetin({ nombre: $('adm-nombre').value.trim(), coleccionId: Number($('adm-col').value), obraId: oid, obraTitulo: $('adm-obra-titulo').value.trim() || 'Sin título', obraTipo: $('adm-obra-tipo').value, precio: Number($('adm-precio').value), stock: Number($('adm-stock').value) });
      aviso(`Modelo "${c.nombre}" registrado y asociado a su obra.`); $('f-nuevo').reset();
    }));
    $('f-stock').addEventListener('submit', envolver(() => { actualizarStock(Number($('adm-prod-stock').value), $('adm-talla').value, Math.max(0, Number($('adm-cant').value))); aviso('Stock actualizado.'); }));
    $('f-precio').addEventListener('submit', envolver(() => { modificarPrecio(Number($('adm-prod-precio').value), Number($('adm-nuevo-precio').value)); aviso('Precio modificado.'); }));
    $('btn-reset').addEventListener('click', () => { try { exigir(); Catalogo.restablecer(); aviso('Catálogo restablecido a productos.json.'); } catch (er) { aviso(er.message, false); } });
  }
  return { iniciar, registrarCalcetin, actualizarStock, modificarPrecio };
})();
