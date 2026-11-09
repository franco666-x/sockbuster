/* RNF02: autenticación con token JWT (simulada en el navegador, sin backend). */
const Auth = (() => {
  const USUARIOS = [
    { id: 1, nombre: 'Cliente Demo', email: 'cliente@sockbuster.cl', password: 'cliente123', rol: 'cliente' },
    { id: 2, nombre: 'Administrador', email: 'admin@sockbuster.cl', password: 'admin123', rol: 'admin' }
  ];
  const KEY = 'sb_token';
  const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));

  function autenticar(email, password) {
    const u = USUARIOS.find(x => x.email === String(email).trim().toLowerCase() && x.password === password);
    if (!u) return null;
    const t = Math.floor(Date.now() / 1000);
    const token = [enc({ alg: 'HS256', typ: 'JWT' }), enc({ sub: u.id, nombre: u.nombre, rol: u.rol, iat: t, exp: t + 3600 }), 'firma-simulada'].join('.');
    try { localStorage.setItem(KEY, token); } catch (e) {}
    return token;
  }
  function cerrar() { try { localStorage.removeItem(KEY); } catch (e) {} }
  function sesion() {
    try {
      const token = localStorage.getItem(KEY);
      if (!token) return null;
      const p = dec(token.split('.')[1]);
      if (p.exp < Date.now() / 1000) { cerrar(); return null; }
      return p;
    } catch (e) { return null; }
  }
  function verificar(rol) { const s = sesion(); return !!s && (!rol || s.rol === rol); }
  return { autenticar, cerrar, sesion, verificar };
})();
