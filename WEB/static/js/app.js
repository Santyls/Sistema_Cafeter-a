const API_BASE = 'http://localhost:5001/api';

const Auth = {
  getToken() { return localStorage.getItem('cf_token'); },
  setToken(t) { localStorage.setItem('cf_token', t); },
  getUser() { try { return JSON.parse(localStorage.getItem('cf_user')); } catch { return null; } },
  setUser(u) { localStorage.setItem('cf_user', JSON.stringify(u)); },
  clear() { localStorage.removeItem('cf_token'); localStorage.removeItem('cf_user'); },
  check() { if (!this.getToken()) { window.location.href = '/login'; return false; } return true; }
};

async function api(path, opts = {}) {
  var h = { 'Content-Type': 'application/json' };
  var t = Auth.getToken();
  if (t) h['Authorization'] = 'Bearer ' + t;
  var res = await fetch(API_BASE + path, Object.assign({}, opts, { headers: h }));
  if (res.status === 401) { Auth.clear(); window.location.href = '/login'; return null; }
  var data = await res.json().catch(function() { return {}; });
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

function fmt(n) { return '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('es-MX') : '-'; }
function fmtTime(d) { return d ? new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '-'; }
function toISO(d) { return d ? new Date(d).toISOString().slice(0, 10) : ''; }

function openModal(id) { var el = document.getElementById(id); if (el) el.classList.add('open'); }
function closeModal(id) { var el = document.getElementById(id); if (el) el.classList.remove('open'); }

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

function updateUserChip() {
  var u = Auth.getUser();
  if (!u) return;
  var av = document.querySelector('.user-chip .avatar');
  var nm = document.querySelector('.user-chip span');
  if (av) av.textContent = (u.nombre || 'U').substring(0, 2).toUpperCase();
  if (nm) nm.textContent = u.nombre || 'Usuario';
}

function handleLogout(e) {
  if (e) e.preventDefault();
  api('/auth/logout', { method: 'POST' }).catch(function() {});
  Auth.clear();
  window.location.href = '/login';
}

// ===================== FILTER BY PERIOD =====================

function getPeriodStart(period) {
  var now = new Date();
  if (period === 'Semanal' || period === 'Hoy') {
    if (period === 'Hoy') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    var d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10);
  }
  if (period === 'Mensual') { var d = new Date(now); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); }
  if (period === 'Anual') { var d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); }
  return '2000-01-01';
}

function filterByPeriod(data, dateField, period) {
  if (!period || period === 'Todos') return data;
  var start = getPeriodStart(period);
  return data.filter(function(item) {
    var f = toISO(item[dateField]);
    return f >= start;
  });
}

// ===================== SVG ICONS =====================

var IC = {
  eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>'
};

// ===================== EXPORT PDF / XLSX =====================

var _exportContext = { type: '', data: [], headers: [], mapFn: null, title: '', dateField: '' };

function openExportModal(type) {
  _exportContext.type = type;
  var today = new Date().toISOString().slice(0, 10);
  var monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  document.getElementById('exportFechaInicio').value = monthAgo;
  document.getElementById('exportFechaFin').value = today;
  document.getElementById('exportTitle').textContent = 'Exportar ' + type.charAt(0).toUpperCase() + type.slice(1);
  openModal('modalExport');
}

function getExportFiltered() {
  var desde = document.getElementById('exportFechaInicio').value;
  var hasta = document.getElementById('exportFechaFin').value;
  if (!desde || !hasta) { alert('Selecciona ambas fechas'); return null; }
  if (desde > hasta) { alert('La fecha inicio no puede ser mayor a la fecha fin'); return null; }
  var ctx = _exportContext;
  var dateField = ctx.dateField;
  var filtered = ctx.data.filter(function(item) {
    var f = toISO(item[dateField]);
    return f >= desde && f <= hasta;
  });
  if (filtered.length === 0) {
    alert('No hay registros en el rango de fechas seleccionado (' + desde + ' a ' + hasta + ').');
    return null;
  }
  return { data: filtered, desde: desde, hasta: hasta };
}

function buildFilename(base) {
  var desde = document.getElementById('exportFechaInicio').value;
  var hasta = document.getElementById('exportFechaFin').value;
  var hoy = new Date().toISOString().slice(0, 10);
  return base + '_' + hoy + '_del_' + desde + '_al_' + hasta;
}

function doExportPDF() {
  var result = getExportFiltered();
  if (!result) return;
  var ctx = _exportContext;
  var rows = result.data.map(ctx.mapFn);
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('Error: la libreria jsPDF no se cargo correctamente. Recarga la pagina.');
    return;
  }
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(ctx.title, 14, 20);
  doc.setFontSize(10);
  doc.text('Rango: ' + result.desde + ' a ' + result.hasta, 14, 28);
  doc.text('Generado: ' + new Date().toLocaleDateString('es-MX') + ' ' + new Date().toLocaleTimeString('es-MX'), 14, 34);
  doc.text('Total de registros: ' + result.data.length, 14, 40);
  doc.autoTable({
    head: [ctx.headers],
    body: rows,
    startY: 46,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [111, 78, 55] }
  });
  doc.save(buildFilename('reporte_' + _exportContext.type) + '.pdf');
  closeModal('modalExport');
}

function doExportXLSX() {
  var result = getExportFiltered();
  if (!result) return;
  var ctx = _exportContext;
  var rows = result.data.map(ctx.mapFn);
  var ws = XLSX.utils.aoa_to_sheet([ctx.headers].concat(rows));
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ctx.type.charAt(0).toUpperCase() + ctx.type.slice(1));
  XLSX.writeFile(wb, buildFilename('reporte_' + _exportContext.type) + '.xlsx');
  closeModal('modalExport');
}

function exportGastos() {
  _exportContext = {
    type: 'gastos', data: _gastosData, dateField: 'fecha',
    title: 'Reporte de Gastos', headers: ['Fecha', 'Categoria', 'Concepto', 'Comprobante', 'Monto'],
    mapFn: function(g) { return [fmtDate(g.fecha), g.categoria || '-', g.concepto || '-', g.comprobante || '-', fmt(g.monto)]; }
  };
  openExportModal('gastos');
}

function exportGanancias() {
  _exportContext = {
    type: 'ganancias', data: _gananciasData, dateField: 'fecha',
    title: 'Reporte de Ganancias', headers: ['Folio', 'Fecha', 'Total', 'Estado', 'Impuesto'],
    mapFn: function(t) { return [t.folio || '-', fmtDate(t.fecha), fmt(t.total), t.estado || '-', fmt(t.impuesto)]; }
  };
  openExportModal('ganancias');
}

function exportProductos() {
  _exportContext = {
    type: 'productos', data: _productosData, dateField: 'fecha_creacion',
    title: 'Reporte de Productos', headers: ['Producto', 'Categoria', 'Precio', 'Ventas', 'Ingreso'],
    mapFn: function(p) { return [p.nombre, p._categoria || '-', fmt(p.precio), p._ventas || 0, fmt(p._ingreso || 0)]; }
  };
  openExportModal('productos');
}

// ===================== CHARTS =====================

var _charts = {};
function destroyChart(key) { if (_charts[key]) { _charts[key].destroy(); delete _charts[key]; } }

// ===================== LOGIN (RF-03: 3 intentos, bloqueo 15 min) =====================

function initLogin() {
  if (Auth.getToken()) { window.location.href = '/dashboard'; return; }
  var form = document.getElementById('loginForm');
  if (!form) return;

  var lockKey = 'cf_login_lock';
  var attemptsKey = 'cf_login_attempts';

  function isLocked() {
    var lockUntil = localStorage.getItem(lockKey);
    if (!lockUntil) return false;
    if (Date.now() < Number(lockUntil)) return true;
    localStorage.removeItem(lockKey);
    localStorage.removeItem(attemptsKey);
    return false;
  }

  function getAttempts() { return Number(localStorage.getItem(attemptsKey) || 0); }
  function addAttempt() {
    var a = getAttempts() + 1;
    localStorage.setItem(attemptsKey, a);
    if (a >= 3) {
      localStorage.setItem(lockKey, Date.now() + 15 * 60 * 1000);
      return true;
    }
    return false;
  }
  function clearAttempts() { localStorage.removeItem(attemptsKey); localStorage.removeItem(lockKey); }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (isLocked()) {
      var mins = Math.ceil((Number(localStorage.getItem(lockKey)) - Date.now()) / 60000);
      alert('Acceso bloqueado por demasiados intentos fallidos. Intenta en ' + mins + ' minutos.');
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    var val = document.getElementById('loginUser').value.trim();
    var pass = document.getElementById('loginPass').value;
    if (!val || !pass) { alert('Ingresa tus credenciales'); return; }
    btn.disabled = true; btn.textContent = 'Ingresando...';
    var body = val.indexOf('@') >= 0 ? { correo: val, contrasena: pass } : { usuario: val, contrasena: pass };
    fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
      .then(function(r) {
        if (!r.ok) {
          var locked = addAttempt();
          var msg = r.data.error || 'Credenciales incorrectas';
          if (locked) msg += '\nSe han agotado los intentos. Acceso bloqueado por 15 minutos.';
          else msg += ' (Intento ' + getAttempts() + ' de 3)';
          alert(msg);
          btn.disabled = false; btn.textContent = 'Iniciar sesion';
          return;
        }
        clearAttempts();
        Auth.setToken(r.data.access_token);
        Auth.setUser(r.data.usuario);
        window.location.href = '/dashboard';
      }).catch(function() { alert('No se pudo conectar con el servidor'); btn.disabled = false; btn.textContent = 'Iniciar sesion'; });
  });
}

// ===================== RECUPERAR =====================

function initRecuperar() {
  var form = document.getElementById('recoverForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var correo = document.getElementById('recoverEmail').value.trim();
    if (!correo) { alert('Ingresa tu correo'); return; }
    fetch(API_BASE + '/auth/recuperar-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo: correo })
    }).then(function() {
      alert('Si el correo esta registrado, recibiras instrucciones.');
      window.location.href = '/login';
    }).catch(function() { alert('Error de conexion'); });
  });
}

// ===================== DASHBOARD =====================

function initDashboard() {
  if (!Auth.check()) return;
  updateUserChip();
  Promise.all([
    api('/gastos').catch(function() { return []; }),
    api('/tickets').catch(function() { return []; }),
    api('/pedidos').catch(function() { return []; }),
    api('/productos').catch(function() { return []; })
  ]).then(function(results) {
    var gastos = results[0] || [], tickets = results[1] || [], pedidos = results[2] || [], productos = results[3] || [];
    var totalGastos = gastos.reduce(function(s, g) { return s + Number(g.monto || 0); }, 0);
    var tkPagados = tickets.filter(function(t) { return t.estado === 'pagado'; });
    var totalGanancias = tkPagados.reduce(function(s, t) { return s + Number(t.total || 0); }, 0);
    var hoy = new Date().toISOString().slice(0, 10);
    var pedidosHoy = pedidos.filter(function(p) { return (p.fecha_creacion || '').startsWith(hoy); });

    var el = function(id) { return document.getElementById(id); };
    if (el('statGastos')) el('statGastos').textContent = fmt(totalGastos);
    if (el('statGanancias')) el('statGanancias').textContent = fmt(totalGanancias);
    if (el('statPedidosHoy')) el('statPedidosHoy').textContent = pedidosHoy.length;
    if (el('statTopProducto')) el('statTopProducto').textContent = productos.length ? productos[0].nombre : 'Sin datos';
    if (el('statTopProductoSub')) el('statTopProductoSub').textContent = productos.length + ' productos registrados';

    var meses = [], gastosPorMes = {}, gananciasPorMes = {};
    for (var i = 5; i >= 0; i--) {
      var d = new Date(); d.setMonth(d.getMonth() - i);
      var key = d.toISOString().slice(0, 7);
      meses.push({ key: key, label: d.toLocaleDateString('es-MX', { month: 'short' }) });
      gastosPorMes[key] = 0; gananciasPorMes[key] = 0;
    }
    gastos.forEach(function(g) { var k = (g.fecha || '').slice(0, 7); if (gastosPorMes[k] !== undefined) gastosPorMes[k] += Number(g.monto || 0); });
    tkPagados.forEach(function(t) { var k = (t.fecha || '').slice(0, 7); if (gananciasPorMes[k] !== undefined) gananciasPorMes[k] += Number(t.total || 0); });

    destroyChart('resumen');
    var ctx1 = el('chartResumen');
    if (ctx1) {
      _charts['resumen'] = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: meses.map(function(m) { return m.label; }),
          datasets: [
            { label: 'Gastos', data: meses.map(function(m) { return gastosPorMes[m.key]; }), borderColor: '#c0392b', backgroundColor: 'rgba(192,57,43,0.1)', tension: 0.35, fill: true },
            { label: 'Ganancias', data: meses.map(function(m) { return gananciasPorMes[m.key]; }), borderColor: '#4e7c4a', backgroundColor: 'rgba(78,124,74,0.1)', tension: 0.35, fill: true }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    var sorted = productos.slice().sort(function(a, b) { return (b.precio || 0) - (a.precio || 0); });
    destroyChart('top');
    var ctx2 = el('chartTopProductos');
    if (ctx2 && sorted.length) {
      _charts['top'] = new Chart(ctx2, { type: 'bar', data: { labels: sorted.slice(0, 5).map(function(p) { return p.nombre; }), datasets: [{ label: 'Precio', data: sorted.slice(0, 5).map(function(p) { return p.precio; }), backgroundColor: '#6f4e37' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    }
    destroyChart('low');
    var ctx3 = el('chartLowProductos');
    if (ctx3 && sorted.length) {
      var low5 = sorted.slice(-5).reverse();
      _charts['low'] = new Chart(ctx3, { type: 'bar', data: { labels: low5.map(function(p) { return p.nombre; }), datasets: [{ label: 'Precio', data: low5.map(function(p) { return p.precio; }), backgroundColor: '#c8893a' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    }
  }).catch(function(err) { console.error('Dashboard error:', err); });
}

// ===================== GASTOS (con filtros funcionales) =====================

var _gastosData = [];
var _gastosFilter = 'Mensual';

function initGastos() {
  if (!Auth.check()) return;
  updateUserChip();
  api('/gastos').then(function(data) {
    _gastosData = data || [];
    applyGastosFilter('Mensual');
  }).catch(function(err) { console.error('Gastos error:', err); });

  document.querySelectorAll('.filter-group button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-group button').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyGastosFilter(btn.textContent.trim());
    });
  });
}

function applyGastosFilter(period) {
  _gastosFilter = period;
  var filtered = filterByPeriod(_gastosData, 'fecha', period);
  renderGastos(filtered);
}

function renderGastos(data) {
  var el = function(id) { return document.getElementById(id); };
  var total = data.reduce(function(s, g) { return s + Number(g.monto || 0); }, 0);
  var fechas = {};
  data.forEach(function(g) { fechas[(g.fecha || '').slice(0, 10)] = true; });
  var diasUnicos = Object.keys(fechas).length;

  if (el('statGastosTotal')) el('statGastosTotal').textContent = fmt(total);
  if (el('statGastosCount')) el('statGastosCount').textContent = data.length;
  if (el('statGastosPromedio')) el('statGastosPromedio').textContent = fmt(diasUnicos ? total / diasUnicos : 0);

  var catTotals = {};
  data.forEach(function(g) { var c = g.categoria || 'Otros'; catTotals[c] = (catTotals[c] || 0) + Number(g.monto || 0); });
  var catEntries = Object.entries(catTotals).sort(function(a, b) { return b[1] - a[1]; });
  if (el('statGastosMayor')) el('statGastosMayor').textContent = catEntries.length ? catEntries[0][0] : '-';
  if (el('statGastosMayorSub')) el('statGastosMayorSub').textContent = catEntries.length ? fmt(catEntries[0][1]) : '';

  var tbody = el('tbodyGastos');
  if (tbody) {
    tbody.innerHTML = data.length ? data.map(function(g) {
      return '<tr><td>' + fmtDate(g.fecha) + '</td><td>' + (g.categoria || '-') + '</td><td>' + (g.concepto || '-') + '</td><td>' + (g.comprobante || '-') + '</td><td>' + fmt(g.monto) + '</td></tr>';
    }).join('') : '<tr><td colspan="5" style="text-align:center;color:#888;">No hay gastos en este periodo</td></tr>';
  }

  destroyChart('gastos');
  var ctx = el('chartGastos');
  if (ctx && catEntries.length) {
    var colors = ['#6f4e37', '#c8893a', '#a9745b', '#3b2519', '#d3912b', '#4e7c4a', '#c0392b'];
    _charts['gastos'] = new Chart(ctx, { type: 'doughnut', data: { labels: catEntries.map(function(e) { return e[0]; }), datasets: [{ data: catEntries.map(function(e) { return e[1]; }), backgroundColor: colors.slice(0, catEntries.length) }] }, options: { responsive: true, maintainAspectRatio: false } });
  }
}

// ===================== GANANCIAS (con filtros funcionales) =====================

var _gananciasData = [];

function initGanancias() {
  if (!Auth.check()) return;
  updateUserChip();
  api('/tickets').then(function(data) {
    _gananciasData = data || [];
    applyGananciasFilter('Mensual');
  }).catch(function(err) { console.error('Ganancias error:', err); });

  document.querySelectorAll('.filter-group button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-group button').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyGananciasFilter(btn.textContent.trim());
    });
  });
}

function applyGananciasFilter(period) {
  var filtered = filterByPeriod(_gananciasData, 'fecha', period);
  renderGanancias(filtered);
}

function renderGanancias(data) {
  var el = function(id) { return document.getElementById(id); };
  var pagados = data.filter(function(t) { return t.estado === 'pagado'; });
  var total = pagados.reduce(function(s, t) { return s + Number(t.total || 0); }, 0);
  var fechas = {};
  pagados.forEach(function(t) { fechas[(t.fecha || '').slice(0, 10)] = true; });
  var diasUnicos = Object.keys(fechas).length;

  if (el('statGananciasTotal')) el('statGananciasTotal').textContent = fmt(total);
  if (el('statGananciasPedidos')) el('statGananciasPedidos').textContent = pagados.length;
  if (el('statGananciasPromedio')) el('statGananciasPromedio').textContent = fmt(diasUnicos ? total / diasUnicos : 0);
  if (el('statGananciasCat')) el('statGananciasCat').textContent = pagados.length ? 'Ventas directas' : '-';

  var tbody = el('tbodyGanancias');
  if (tbody) {
    tbody.innerHTML = data.length ? data.map(function(t) {
      var badge = t.estado === 'pagado' ? 'badge-success' : t.estado === 'cancelado' ? 'badge-danger' : 'badge-warning';
      return '<tr><td>' + (t.folio || '-') + '</td><td>' + fmtDate(t.fecha) + '</td><td>' + fmt(t.total) + '</td><td><span class="badge ' + badge + '">' + (t.estado || '-') + '</span></td><td>' + fmt(t.impuesto) + '</td></tr>';
    }).join('') : '<tr><td colspan="5" style="text-align:center;color:#888;">No hay tickets en este periodo</td></tr>';
  }

  destroyChart('ganancias');
  var ctx = el('chartGanancias');
  if (ctx && data.length) {
    var porEstado = {};
    data.forEach(function(t) { var e = t.estado || 'otro'; porEstado[e] = (porEstado[e] || 0) + Number(t.total || 0); });
    var labels = Object.keys(porEstado);
    _charts['ganancias'] = new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Total', data: labels.map(function(l) { return porEstado[l]; }), backgroundColor: '#4e7c4a' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }
}

// ===================== PRODUCTOS (con ventas desde pedidos) =====================

var _productosData = [];

function initProductos() {
  if (!Auth.check()) return;
  updateUserChip();
  Promise.all([
    api('/productos').catch(function() { return []; }),
    api('/categorias').catch(function() { return []; }),
    api('/pedidos').catch(function() { return []; })
  ]).then(function(results) {
    var productos = results[0] || [], categorias = results[1] || [], pedidos = results[2] || [];
    var catMap = {};
    categorias.forEach(function(c) { catMap[c.id_categoria] = c.nombre; });
    productos.forEach(function(p) { p._categoria = catMap[p.id_categoria] || '-'; p._ventas = 0; p._ingreso = 0; });

    var completados = pedidos.filter(function(p) { return p.estado === 'entregado' || p.estado === 'listo'; });
    var detailPromises = completados.slice(0, 50).map(function(p) {
      return api('/pedidos/' + p.id_pedido).catch(function() { return null; });
    });

    Promise.all(detailPromises).then(function(details) {
      var salesMap = {};
      details.forEach(function(ped) {
        if (!ped || !ped.detalles) return;
        ped.detalles.forEach(function(d) {
          if (!salesMap[d.id_producto]) salesMap[d.id_producto] = { ventas: 0, ingreso: 0 };
          salesMap[d.id_producto].ventas += Number(d.cantidad || 0);
          salesMap[d.id_producto].ingreso += Number(d.subtotal || 0);
        });
      });
      productos.forEach(function(p) {
        var s = salesMap[p.id_producto];
        if (s) { p._ventas = s.ventas; p._ingreso = s.ingreso; }
      });
      _productosData = productos;
      renderProductos(_productosData);
    });
  }).catch(function(err) { console.error('Productos error:', err); });
}

function renderProductos(data) {
  var el = function(id) { return document.getElementById(id); };
  var tbody = el('tbodyProductos');
  if (tbody) {
    var sorted = data.slice().sort(function(a, b) { return (b._ventas || 0) - (a._ventas || 0); });
    tbody.innerHTML = sorted.length ? sorted.map(function(p) {
      var avg = data.reduce(function(s, x) { return s + (x._ventas || 0); }, 0) / (data.length || 1);
      var trend = (p._ventas || 0) > avg ? '<span class="badge badge-success">Alta demanda</span>' : (p._ventas || 0) > 0 ? '<span class="badge badge-warning">Normal</span>' : '<span class="badge badge-muted">Sin ventas</span>';
      return '<tr><td>' + (p.nombre || '-') + '</td><td>' + (p._categoria || '-') + '</td><td>' + fmt(p.precio) + '</td><td>' + (p._ventas || 0) + '</td><td>' + fmt(p._ingreso) + '</td><td>' + trend + '</td></tr>';
    }).join('') : '<tr><td colspan="6" style="text-align:center;color:#888;">No hay productos registrados</td></tr>';
  }

  var byVentas = data.slice().sort(function(a, b) { return (b._ventas || 0) - (a._ventas || 0); });

  destroyChart('prodTop');
  var ctx1 = el('chartTop');
  if (ctx1 && byVentas.length) {
    var top5 = byVentas.slice(0, 5).filter(function(p) { return p._ventas > 0; });
    if (top5.length === 0) top5 = byVentas.slice(0, 5);
    _charts['prodTop'] = new Chart(ctx1, { type: 'bar', data: { labels: top5.map(function(p) { return p.nombre; }), datasets: [{ label: 'Ventas', data: top5.map(function(p) { return p._ventas || 0; }), backgroundColor: '#6f4e37' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }

  destroyChart('prodLow');
  var ctx2 = el('chartLow');
  if (ctx2 && byVentas.length) {
    var low5 = byVentas.slice(-5).reverse();
    _charts['prodLow'] = new Chart(ctx2, { type: 'bar', data: { labels: low5.map(function(p) { return p.nombre; }), datasets: [{ label: 'Ventas', data: low5.map(function(p) { return p._ventas || 0; }), backgroundColor: '#c0392b' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }
}

// ===================== PEDIDOS (con filtros funcionales) =====================

var _pedidosData = [];

function initPedidos() {
  if (!Auth.check()) return;
  updateUserChip();
  loadPedidos();
  var search = document.getElementById('searchPedidos');
  if (search) search.addEventListener('input', function() {
    var term = search.value.toLowerCase();
    var filtered = _pedidosData.filter(function(p) {
      return (p.numero_pedido || '').toLowerCase().indexOf(term) >= 0 || String(p.id_mesa || '').indexOf(term) >= 0;
    });
    renderPedidosTable(filtered);
  });
  document.querySelectorAll('.filter-group button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-group button').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var period = btn.textContent.trim();
      var filtered = filterByPeriod(_pedidosData, 'fecha_creacion', period);
      renderPedidosTable(filtered);
    });
  });
}

function loadPedidos() {
  api('/pedidos').then(function(data) {
    _pedidosData = data || [];
    renderPedidosTable(_pedidosData);
  }).catch(function(err) { console.error('Pedidos error:', err); });
}

function statusBadge(s) {
  var map = { pendiente: 'badge-muted', en_preparacion: 'badge-warning', listo: 'badge-success', entregado: 'badge-success', cancelado: 'badge-danger' };
  var label = { pendiente: 'Pendiente', en_preparacion: 'En preparacion', listo: 'Listo', entregado: 'Entregado', cancelado: 'Cancelado' };
  return '<span class="badge ' + (map[s] || 'badge-muted') + '">' + (label[s] || s || '-') + '</span>';
}

function renderPedidosTable(data) {
  var tbody = document.getElementById('tbodyPedidos');
  if (!tbody) return;
  tbody.innerHTML = data.length ? data.map(function(p) {
    var actions = '<button class="icon-btn" title="Ver detalle" onclick="verPedido(' + p.id_pedido + ')">' + IC.eye + '</button>';
    if (p.estado === 'pendiente') actions += ' <button class="icon-btn danger" title="Cancelar" onclick="cancelarPedido(' + p.id_pedido + ')">' + IC.trash + '</button>';
    return '<tr><td>' + (p.numero_pedido || '-') + '</td><td>Mesa ' + (p.id_mesa || '-') + '</td><td>' + (p.usuario_nombre || 'ID: ' + p.id_usuario) + '</td><td>' + fmt(p.total) + '</td><td>' + statusBadge(p.estado) + '</td><td>' + fmtTime(p.fecha_creacion) + '</td><td class="row-actions">' + actions + '</td></tr>';
  }).join('') : '<tr><td colspan="7" style="text-align:center;color:#888;">No hay pedidos en este periodo</td></tr>';
}

function verPedido(id) {
  api('/pedidos/' + id).then(function(p) {
    var modal = document.getElementById('modalDetallePedido');
    if (!modal) return;
    modal.querySelector('.modal-header h3').textContent = 'Detalle del pedido ' + (p.numero_pedido || '#' + p.id_pedido);
    var info = document.getElementById('pedidoInfo');
    if (info) info.innerHTML = '<p><strong>Mesa:</strong> ' + (p.id_mesa || '-') + ' | <strong>Estado:</strong> ' + statusBadge(p.estado) + '</p><p><strong>Total:</strong> ' + fmt(p.total) + ' | <strong>Fecha:</strong> ' + fmtDate(p.fecha_creacion) + '</p>';
    var det = document.getElementById('pedidoDetalles');
    var detalles = p.detalles || [];
    if (det) det.innerHTML = detalles.length ? detalles.map(function(d) {
      return '<tr><td>' + (d.producto_nombre || 'Producto #' + d.id_producto) + '</td><td>' + d.cantidad + '</td><td>' + fmt(d.subtotal) + '</td></tr>';
    }).join('') : '<tr><td colspan="3" style="text-align:center;color:#888;">Sin detalles</td></tr>';
    openModal('modalDetallePedido');
  }).catch(function(err) { alert('Error al cargar pedido: ' + err.message); });
}

function cancelarPedido(id) {
  if (!confirm('Cancelar este pedido?')) return;
  api('/pedidos/' + id, { method: 'DELETE' }).then(function() { loadPedidos(); }).catch(function(err) { alert('Error: ' + err.message); });
}

// ===================== INVENTARIO (con filtro stock bajo) =====================

var _inventarioData = [];
var _editingIngredienteId = null;

function initInventario() {
  if (!Auth.check()) return;
  updateUserChip();
  loadInventario();
  var search = document.getElementById('searchInventario');
  if (search) search.addEventListener('input', function() {
    var term = search.value.toLowerCase();
    var filtered = _inventarioData.filter(function(i) {
      return (i.nombre || '').toLowerCase().indexOf(term) >= 0 || String(i.id_ingrediente).indexOf(term) >= 0;
    });
    renderInventarioTable(filtered);
  });
  document.querySelectorAll('.filter-group button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-group button').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.textContent.trim();
      if (f === 'Stock bajo') {
        renderInventarioTable(_inventarioData.filter(function(i) { return Number(i.stock_actual) < Number(i.stock_minimo); }));
      } else {
        renderInventarioTable(_inventarioData);
      }
    });
  });
}

function loadInventario() {
  api('/ingredientes').then(function(data) {
    _inventarioData = data || [];
    renderInventarioTable(_inventarioData);
  }).catch(function(err) { console.error('Inventario error:', err); });
}

function renderInventarioTable(data) {
  var tbody = document.getElementById('tbodyInventario');
  if (!tbody) return;
  tbody.innerHTML = data.length ? data.map(function(i) {
    var lowStock = Number(i.stock_actual) < Number(i.stock_minimo);
    return '<tr>' +
      '<td>' + i.id_ingrediente + '</td>' +
      '<td>' + (i.nombre || '-') + '</td>' +
      '<td>' + (i.unidad_medida || '-') + '</td>' +
      '<td class="' + (lowStock ? 'low-stock' : '') + '">' + i.stock_actual + ' ' + (i.unidad_medida || '') + '</td>' +
      '<td>' + i.stock_minimo + ' ' + (i.unidad_medida || '') + '</td>' +
      '<td><span class="badge ' + (lowStock ? 'badge-danger' : 'badge-success') + '">' + (lowStock ? 'Stock bajo' : 'Normal') + '</span></td>' +
      '<td class="row-actions">' +
        '<button class="icon-btn" onclick="editIngrediente(' + i.id_ingrediente + ')">' + IC.edit + '</button>' +
        '<button class="icon-btn danger" onclick="deleteIngrediente(' + i.id_ingrediente + ', \'' + (i.nombre || '').replace(/'/g, "\\'") + '\')">' + IC.trash + '</button>' +
      '</td></tr>';
  }).join('') : '<tr><td colspan="7" style="text-align:center;color:#888;">No hay ingredientes registrados</td></tr>';
}

function openIngredienteModal(data) {
  _editingIngredienteId = data ? data.id_ingrediente : null;
  document.getElementById('modalStockTitle').textContent = data ? 'Editar ingrediente' : 'Agregar ingrediente';
  document.getElementById('ingNombre').value = data ? data.nombre || '' : '';
  document.getElementById('ingUnidad').value = data ? data.unidad_medida || 'kg' : 'kg';
  document.getElementById('ingStock').value = data ? data.stock_actual : '';
  document.getElementById('ingMinimo').value = data ? data.stock_minimo : '';
  openModal('modalStock');
}

function editIngrediente(id) {
  var ing = _inventarioData.find(function(i) { return i.id_ingrediente === id; });
  if (ing) openIngredienteModal(ing);
}

function saveIngrediente() {
  var nombre = document.getElementById('ingNombre').value.trim();
  var stock = document.getElementById('ingStock').value;
  var minimo = document.getElementById('ingMinimo').value;
  if (!nombre) { alert('El nombre es requerido'); return; }
  if (stock === '' || isNaN(Number(stock))) { alert('Stock actual debe ser un numero valido'); return; }
  if (Number(stock) < 0) { alert('El stock no puede ser negativo'); return; }
  if (minimo !== '' && Number(minimo) < 0) { alert('El stock minimo no puede ser negativo'); return; }
  var data = {
    nombre: nombre,
    unidad_medida: document.getElementById('ingUnidad').value,
    stock_actual: Number(stock) || 0,
    stock_minimo: Number(minimo) || 0
  };
  var promise = _editingIngredienteId
    ? api('/ingredientes/' + _editingIngredienteId, { method: 'PUT', body: JSON.stringify(data) })
    : api('/ingredientes', { method: 'POST', body: JSON.stringify(data) });
  promise.then(function() { closeModal('modalStock'); loadInventario(); }).catch(function(err) { alert('Error: ' + err.message); });
}

function deleteIngrediente(id, nombre) {
  if (!confirm('Eliminar el ingrediente "' + nombre + '"?')) return;
  api('/ingredientes/' + id, { method: 'DELETE' }).then(function() { loadInventario(); }).catch(function(err) { alert('Error: ' + err.message); });
}

// ===================== USUARIOS (CRUD con validaciones) =====================

var _usuariosData = [];
var _editingUserId = null;

function initUsuarios() {
  if (!Auth.check()) return;
  updateUserChip();
  loadUsuarios();
  document.querySelectorAll('.filter-group button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-group button').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      loadUsuarios(btn.textContent.trim());
    });
  });
  var search = document.getElementById('searchUsuarios');
  if (search) search.addEventListener('input', function() {
    var term = search.value.toLowerCase();
    var filtered = _usuariosData.filter(function(u) {
      return (u.nombre || '').toLowerCase().indexOf(term) >= 0 || (u.correo || '').toLowerCase().indexOf(term) >= 0 || (u.usuario || '').toLowerCase().indexOf(term) >= 0;
    });
    renderUsuariosTable(filtered);
  });
}

function loadUsuarios(rolFilter) {
  var path = '/usuarios';
  if (rolFilter && rolFilter !== 'Todos') {
    var map = { 'Meseros': 'mesero', 'Cocineros': 'cocinero', 'Cajeros': 'cajero' };
    if (map[rolFilter]) path += '?rol=' + map[rolFilter];
  }
  api(path).then(function(data) {
    _usuariosData = data || [];
    renderUsuariosTable(_usuariosData);
  }).catch(function(err) { console.error('Usuarios error:', err); });
}

function renderUsuariosTable(data) {
  var tbody = document.getElementById('tbodyUsuarios');
  if (!tbody) return;
  tbody.innerHTML = data.length ? data.map(function(u) {
    var nombre = (u.nombre || '') + ' ' + (u.apellido_paterno || '') + ' ' + (u.apellido_materno || '');
    return '<tr>' +
      '<td>' + nombre.trim() + '</td>' +
      '<td>' + (u.correo || '') + '</td>' +
      '<td>' + (u.telefono || '-') + '</td>' +
      '<td><span class="badge badge-muted">' + (u.rol || '') + '</span></td>' +
      '<td><span class="badge ' + (u.activo !== false ? 'badge-success' : 'badge-danger') + '">' + (u.activo !== false ? 'Activo' : 'Inactivo') + '</span></td>' +
      '<td class="row-actions">' +
        '<button class="icon-btn" onclick="editUsuario(' + u.id_usuario + ')">' + IC.edit + '</button>' +
        '<button class="icon-btn danger" onclick="deleteUsuario(' + u.id_usuario + ', \'' + (u.nombre || '').replace(/'/g, "\\'") + '\')">' + IC.trash + '</button>' +
      '</td></tr>';
  }).join('') : '<tr><td colspan="6" style="text-align:center;color:#888;">No hay usuarios registrados</td></tr>';
}

function abrirModalUsuario() { openUsuarioModal(null); }

function openUsuarioModal(data) {
  _editingUserId = data ? data.id_usuario : null;
  document.getElementById('modalUsuarioTitle').textContent = data ? 'Editar usuario' : 'Agregar usuario';
  document.getElementById('usrNombre').value = data ? data.nombre || '' : '';
  document.getElementById('usrApPaterno').value = data ? data.apellido_paterno || '' : '';
  document.getElementById('usrApMaterno').value = data ? data.apellido_materno || '' : '';
  document.getElementById('usrCorreo').value = data ? data.correo || '' : '';
  document.getElementById('usrTelefono').value = data ? data.telefono || '' : '';
  document.getElementById('usrUsuario').value = data ? data.usuario || '' : '';
  document.getElementById('usrRol').value = data ? data.rol || 'mesero' : 'mesero';
  document.getElementById('usrPassword').value = '';
  document.getElementById('usrPassword2').value = '';
  openModal('modalUsuario');
}

function editUsuario(id) {
  var usr = _usuariosData.find(function(u) { return u.id_usuario === id; });
  if (usr) openUsuarioModal(usr);
}

function saveUsuario() {
  var nombre = document.getElementById('usrNombre').value.trim();
  var correo = document.getElementById('usrCorreo').value.trim();
  var usuario = document.getElementById('usrUsuario').value.trim();
  var contrasena = document.getElementById('usrPassword').value;
  var contrasena2 = document.getElementById('usrPassword2').value;
  var rol = document.getElementById('usrRol').value;
  var telefono = document.getElementById('usrTelefono').value.trim();

  if (!nombre) { alert('El nombre es requerido'); return; }
  if (!correo) { alert('El correo es requerido'); return; }
  if (!correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { alert('El formato de correo no es valido'); return; }
  if (!usuario) { alert('El nombre de usuario es requerido'); return; }
  if (usuario.length < 3) { alert('El usuario debe tener al menos 3 caracteres'); return; }
  if (!_editingUserId && !contrasena) { alert('La contrasena es requerida para nuevos usuarios'); return; }
  if (contrasena && contrasena.length < 6) { alert('La contrasena debe tener al menos 6 caracteres'); return; }
  if (contrasena && contrasena !== contrasena2) { alert('Las contrasenas no coinciden'); return; }
  if (telefono && !telefono.match(/^[\d\s\-\+\(\)]{7,15}$/)) { alert('El formato de telefono no es valido'); return; }

  if (!confirm('Los datos son correctos?')) return;

  var data = {
    nombre: nombre,
    apellido_paterno: document.getElementById('usrApPaterno').value.trim(),
    apellido_materno: document.getElementById('usrApMaterno').value.trim(),
    correo: correo,
    usuario: usuario,
    telefono: telefono,
    rol: rol
  };
  if (contrasena) data.contrasena = contrasena;
  var promise = _editingUserId
    ? api('/usuarios/' + _editingUserId, { method: 'PUT', body: JSON.stringify(data) })
    : api('/usuarios', { method: 'POST', body: JSON.stringify(data) });
  promise.then(function() { closeModal('modalUsuario'); loadUsuarios(); }).catch(function(err) { alert('Error: ' + err.message); });
}

function deleteUsuario(id, nombre) {
  if (!confirm('Eliminar el usuario "' + nombre + '"? Esta accion no se puede deshacer.')) return;
  api('/usuarios/' + id, { method: 'DELETE' }).then(function() { loadUsuarios(); }).catch(function(err) { alert('Error: ' + err.message); });
}

// ===================== INIT =====================

document.addEventListener('DOMContentLoaded', function() {
  var path = window.location.pathname;
  if (path === '/' || path === '/login') initLogin();
  else if (path === '/recuperar') initRecuperar();
  else if (path === '/dashboard') initDashboard();
  else if (path === '/gastos') initGastos();
  else if (path === '/ganancias') initGanancias();
  else if (path === '/productos') initProductos();
  else if (path === '/pedidos') initPedidos();
  else if (path === '/inventario') initInventario();
  else if (path === '/usuarios') initUsuarios();
});
