/* RF04: reseñas de 1 a 5 estrellas y comentario; solo usuarios registrados (cliente) con token válido. */
const Resenas = (() => {
  const KEY = 'sb_resenas';
  const $ = id => document.getElementById(id);
  let actual = null;
  const leer = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const listar = id => leer()[id] || [];
  function publicar(id, estrellas, comentario) {
    const s = Auth.sesion();
    if (!s || s.rol !== 'cliente') return { ok: false, msg: 'Debes iniciar sesión como cliente para publicar una reseña.' };
    estrellas = Number(estrellas);
    if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) return { ok: false, msg: 'Las estrellas deben ser de 1 a 5.' };
    if (!String(comentario).trim()) return { ok: false, msg: 'Escribe un comentario.' };
    const todo = leer();
    (todo[id] = todo[id] || []).push({ estrellas, comentario: String(comentario).trim(), autor: s.nombre, fecha: new Date().toLocaleDateString('es-CL') });
    try { localStorage.setItem(KEY, JSON.stringify(todo)); } catch (e) {}
    return { ok: true };
  }
  function dibujar() {
    const l = listar(actual.id), esc = Catalogo.esc;
    const prom = l.length ? (l.reduce((s, r) => s + r.estrellas, 0) / l.length).toFixed(1) : '—';
    $('ficha-titulo').textContent = actual.nombre;
    $('ficha-prom').textContent = `Promedio: ${prom} ★ (${l.length} reseña${l.length === 1 ? '' : 's'})`;
    $('ficha-lista').innerHTML = l.map(r => `<li><strong>${'★'.repeat(r.estrellas)}${'☆'.repeat(5 - r.estrellas)}</strong> ${esc(r.autor)} <small>${esc(r.fecha)}</small><br>${esc(r.comentario)}</li>`).join('') || '<li class="vacio">Aún no hay reseñas.</li>';
    $('form-resena').hidden = !Auth.verificar('cliente');
    $('ficha-aviso').hidden = Auth.verificar('cliente');
  }
  function abrirFicha(c) { actual = c; $('msg-resena').textContent = ''; dibujar(); $('dlg-ficha').showModal(); }
  function iniciar() {
    $('form-resena').addEventListener('submit', e => {
      e.preventDefault();
      const r = publicar(actual.id, $('res-estrellas').value, $('res-comentario').value);
      $('msg-resena').textContent = r.ok ? 'Reseña publicada.' : r.msg;
      if (r.ok) { $('res-comentario').value = ''; dibujar(); }
    });
    document.addEventListener('sesion:cambio', () => { if ($('dlg-ficha').open) dibujar(); });
  }
  return { iniciar, abrirFicha, publicar, listar };
})();
