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

function openModal(id) { var el = document.getElementById(id); if (el) el.classList.add('open'); }
function closeModal(id) { var el = document.getElementById(id); if (el) el.classList.remove('open'); }

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

document.querySelectorAll('.filter-group').forEach(function(g) {
  g.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
      g.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
      e.target.classList.add('active');
    }
  });
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

// ===================== EXPORT PDF / XLSX =====================

function exportPDF(title, headers, rows, filename) {
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text('Generado: ' + new Date().toLocaleDateString('es-MX') + ' ' + new Date().toLocaleTimeString('es-MX'), 14, 28);
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [111, 78, 55] }
  });
  doc.save(filename + '.pdf');
}

function exportXLSX(sheetName, headers, rows, filename) {
  var ws = XLSX.utils.aoa_to_sheet([headers].concat(rows));
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename + '.xlsx');
}

// ===================== CHARTS =====================

var _charts = {};
function destroyChart(key) { if (_charts[key]) { _charts[key].destroy(); delete _charts[key]; } }

// ===================== LOGIN =====================

function initLogin() {
  if (Auth.getToken()) { window.location.href = '/dashboard'; return; }
  var form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
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
        if (!r.ok) { alert(r.data.error || 'Credenciales incorrectas'); btn.disabled = false; btn.textContent = 'Iniciar sesión'; return; }
        Auth.setToken(r.data.access_token);
        Auth.setUser(r.data.usuario);
        window.location.href = '/dashboard';
      }).catch(function() { alert('No se pudo conectar con el servidor'); btn.disabled = false; btn.textContent = 'Iniciar sesión'; });
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
      alert('Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.');
      window.location.href = '/login';
    }).catch(function() { alert('Error de conexión'); });
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
      var top5 = sorted.slice(0, 5);
      _charts['top'] = new Chart(ctx2, {
        type: 'bar',
        data: { labels: top5.map(function(p) { return p.nombre; }), datasets: [{ label: 'Precio', data: top5.map(function(p) { return p.precio; }), backgroundColor: '#6f4e37' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    destroyChart('low');
    var ctx3 = el('chartLowProductos');
    if (ctx3 && sorted.length) {
      var low5 = sorted.slice(-5).reverse();
      _charts['low'] = new Chart(ctx3, {
        type: 'bar',
        data: { labels: low5.map(function(p) { return p.nombre; }), datasets: [{ label: 'Precio', data: low5.map(function(p) { return p.precio; }), backgroundColor: '#c8893a' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
  }).catch(function(err) { console.error('Dashboard error:', err); });
}

// ===================== GASTOS =====================

var _gastosData = [];

function initGastos() {
  if (!Auth.check()) return;
  updateUserChip();
  api('/gastos').then(function(data) {
    _gastosData = data || [];
    renderGastos(_gastosData);
  }).catch(function(err) { console.error('Gastos error:', err); });
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
    }).join('') : '<tr><td colspan="5" style="text-align:center;color:#888;">No hay gastos registrados</td></tr>';
  }

  destroyChart('gastos');
  var ctx = el('chartGastos');
  if (ctx && catEntries.length) {
    var colors = ['#6f4e37', '#c8893a', '#a9745b', '#3b2519', '#d3912b', '#4e7c4a', '#c0392b'];
    _charts['gastos'] = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: catEntries.map(function(e) { return e[0]; }), datasets: [{ data: catEntries.map(function(e) { return e[1]; }), backgroundColor: colors.slice(0, catEntries.length) }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function exportGastosPDF() {
  exportPDF('Reporte de Gastos', ['Fecha', 'Categoría', 'Concepto', 'Comprobante', 'Monto'],
    _gastosData.map(function(g) { return [fmtDate(g.fecha), g.categoria || '-', g.concepto || '-', g.comprobante || '-', fmt(g.monto)]; }),
    'reporte_gastos');
}

function exportGastosXLSX() {
  exportXLSX('Gastos', ['Fecha', 'Categoría', 'Concepto', 'Comprobante', 'Monto'],
    _gastosData.map(function(g) { return [fmtDate(g.fecha), g.categoria || '-', g.concepto || '-', g.comprobante || '-', Number(g.monto || 0)]; }),
    'reporte_gastos');
}

// ===================== GANANCIAS =====================

var _gananciasData = [];

function initGanancias() {
  if (!Auth.check()) return;
  updateUserChip();
  api('/tickets').then(function(data) {
    _gananciasData = data || [];
    renderGanancias(_gananciasData);
  }).catch(function(err) { console.error('Ganancias error:', err); });
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
    }).join('') : '<tr><td colspan="5" style="text-align:center;color:#888;">No hay tickets registrados</td></tr>';
  }

  destroyChart('ganancias');
  var ctx = el('chartGanancias');
  if (ctx) {
    var porEstado = {};
    data.forEach(function(t) { var e = t.estado || 'otro'; porEstado[e] = (porEstado[e] || 0) + Number(t.total || 0); });
    var labels = Object.keys(porEstado);
    _charts['ganancias'] = new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: [{ label: 'Total', data: labels.map(function(l) { return porEstado[l]; }), backgroundColor: '#4e7c4a' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
}

function exportGananciasPDF() {
  exportPDF('Reporte de Ganancias', ['Folio', 'Fecha', 'Total', 'Estado', 'Impuesto'],
    _gananciasData.map(function(t) { return [t.folio || '-', fmtDate(t.fecha), fmt(t.total), t.estado || '-', fmt(t.impuesto)]; }),
    'reporte_ganancias');
}

function exportGananciasXLSX() {
  exportXLSX('Ganancias', ['Folio', 'Fecha', 'Total', 'Estado', 'Impuesto'],
    _gananciasData.map(function(t) { return [t.folio || '-', fmtDate(t.fecha), Number(t.total || 0), t.estado || '-', Number(t.impuesto || 0)]; }),
    'reporte_ganancias');
}

// ===================== PRODUCTOS =====================

var _productosData = [];

function initProductos() {
  if (!Auth.check()) return;
  updateUserChip();
  Promise.all([
    api('/productos').catch(function() { return []; }),
    api('/categorias').catch(function() { return []; })
  ]).then(function(results) {
    var productos = results[0] || [], categorias = results[1] || [];
    var catMap = {};
    categorias.forEach(function(c) { catMap[c.id_categoria] = c.nombre; });
    productos.forEach(function(p) { p._categoria = catMap[p.id_categoria] || '-'; });
    _productosData = productos;
    renderProductos(_productosData);
  }).catch(function(err) { console.error('Productos error:', err); });
}

function renderProductos(data) {
  var el = function(id) { return document.getElementById(id); };
  var tbody = el('tbodyProductos');
  if (tbody) {
    tbody.innerHTML = data.length ? data.map(function(p) {
      var badge = p.disponible ? 'badge-success' : 'badge-danger';
      var label = p.disponible ? '✓ Disponible' : '✗ No disponible';
      return '<tr><td>' + (p.nombre || '-') + '</td><td>' + (p._categoria || '-') + '</td><td>' + fmt(p.precio) + '</td><td><span class="badge ' + badge + '">' + label + '</span></td></tr>';
    }).join('') : '<tr><td colspan="4" style="text-align:center;color:#888;">No hay productos registrados</td></tr>';
  }

  var sorted = data.slice().sort(function(a, b) { return (b.precio || 0) - (a.precio || 0); });

  destroyChart('prodTop');
  var ctx1 = el('chartTop');
  if (ctx1 && sorted.length) {
    var top5 = sorted.slice(0, 5);
    _charts['prodTop'] = new Chart(ctx1, {
      type: 'bar',
      data: { labels: top5.map(function(p) { return p.nombre; }), datasets: [{ label: 'Precio', data: top5.map(function(p) { return p.precio; }), backgroundColor: '#6f4e37' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  destroyChart('prodLow');
  var ctx2 = el('chartLow');
  if (ctx2 && sorted.length) {
    var low5 = sorted.slice(-5).reverse();
    _charts['prodLow'] = new Chart(ctx2, {
      type: 'bar',
      data: { labels: low5.map(function(p) { return p.nombre; }), datasets: [{ label: 'Precio', data: low5.map(function(p) { return p.precio; }), backgroundColor: '#c0392b' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
}

function exportProductosPDF() {
  exportPDF('Reporte de Productos', ['Producto', 'Categoría', 'Precio', 'Disponible'],
    _productosData.map(function(p) { return [p.nombre, p._categoria || '-', fmt(p.precio), p.disponible ? 'Sí' : 'No']; }),
    'reporte_productos');
}

function exportProductosXLSX() {
  exportXLSX('Productos', ['Producto', 'Categoría', 'Precio', 'Disponible'],
    _productosData.map(function(p) { return [p.nombre, p._categoria || '-', Number(p.precio || 0), p.disponible ? 'Sí' : 'No']; }),
    'reporte_productos');
}

// ===================== PEDIDOS =====================

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
}

function loadPedidos() {
  api('/pedidos').then(function(data) {
    _pedidosData = data || [];
    renderPedidosTable(_pedidosData);
  }).catch(function(err) { console.error('Pedidos error:', err); });
}

function statusBadge(s) {
  var map = { pendiente: 'badge-muted', en_preparacion: 'badge-warning', listo: 'badge-success', entregado: 'badge-success', cancelado: 'badge-danger' };
  var label = { pendiente: 'Pendiente', en_preparacion: 'En preparación', listo: 'Listo', entregado: 'Entregado', cancelado: 'Cancelado' };
  return '<span class="badge ' + (map[s] || 'badge-muted') + '">' + (label[s] || s || '-') + '</span>';
}

function renderPedidosTable(data) {
  var tbody = document.getElementById('tbodyPedidos');
  if (!tbody) return;
  tbody.innerHTML = data.length ? data.map(function(p) {
    var actions = '<button class="icon-btn" title="Ver detalle" onclick="verPedido(' + p.id_pedido + ')">👁️</button>';
    if (p.estado === 'pendiente') actions += ' <button class="icon-btn danger" title="Cancelar" onclick="cancelarPedido(' + p.id_pedido + ')">🗑️</button>';
    return '<tr><td>' + (p.numero_pedido || '-') + '</td><td>Mesa ' + (p.id_mesa || '-') + '</td><td>' + (p.usuario_nombre || 'ID: ' + p.id_usuario) + '</td><td>' + fmt(p.total) + '</td><td>' + statusBadge(p.estado) + '</td><td>' + fmtTime(p.fecha_creacion) + '</td><td class="row-actions">' + actions + '</td></tr>';
  }).join('') : '<tr><td colspan="7" style="text-align:center;color:#888;">No hay pedidos</td></tr>';
}

function verPedido(id) {
  api('/pedidos/' + id).then(function(p) {
    var modal = document.getElementById('modalDetallePedido');
    if (!modal) return;
    modal.querySelector('.modal-header h3').textContent = 'Detalle del pedido ' + (p.numero_pedido || '#' + p.id_pedido);
    var info = document.getElementById('pedidoInfo');
    if (info) info.innerHTML = '<p><strong>Mesa:</strong> ' + (p.id_mesa || '-') + ' &nbsp;|&nbsp; <strong>Estado:</strong> ' + statusBadge(p.estado) + '</p><p><strong>Total:</strong> ' + fmt(p.total) + ' &nbsp;|&nbsp; <strong>Fecha:</strong> ' + fmtDate(p.fecha_creacion) + '</p>';
    var det = document.getElementById('pedidoDetalles');
    var detalles = p.detalles || [];
    if (det) det.innerHTML = detalles.length ? detalles.map(function(d) {
      return '<tr><td>' + (d.producto_nombre || 'Producto #' + d.id_producto) + '</td><td>' + d.cantidad + '</td><td>' + fmt(d.subtotal) + '</td></tr>';
    }).join('') : '<tr><td colspan="3" style="text-align:center;color:#888;">Sin detalles</td></tr>';
    openModal('modalDetallePedido');
  }).catch(function(err) { alert('Error al cargar pedido: ' + err.message); });
}

function cancelarPedido(id) {
  if (!confirm('¿Cancelar este pedido?')) return;
  api('/pedidos/' + id, { method: 'DELETE' }).then(function() { loadPedidos(); }).catch(function(err) { alert('Error: ' + err.message); });
}

// ===================== INVENTARIO =====================

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
      '<td><span class="badge ' + (i.activo !== false ? 'badge-success' : 'badge-danger') + '">' + (i.activo !== false ? 'Activo' : 'Inactivo') + '</span></td>' +
      '<td class="row-actions">' +
        '<button class="icon-btn" onclick="editIngrediente(' + i.id_ingrediente + ')">✏️</button>' +
        '<button class="icon-btn danger" onclick="deleteIngrediente(' + i.id_ingrediente + ', \'' + (i.nombre || '').replace(/'/g, "\\'") + '\')">🗑️</button>' +
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
  var data = {
    nombre: document.getElementById('ingNombre').value.trim(),
    unidad_medida: document.getElementById('ingUnidad').value,
    stock_actual: Number(document.getElementById('ingStock').value) || 0,
    stock_minimo: Number(document.getElementById('ingMinimo').value) || 0
  };
  if (!data.nombre) { alert('El nombre es requerido'); return; }
  var promise = _editingIngredienteId
    ? api('/ingredientes/' + _editingIngredienteId, { method: 'PUT', body: JSON.stringify(data) })
    : api('/ingredientes', { method: 'POST', body: JSON.stringify(data) });
  promise.then(function() { closeModal('modalStock'); loadInventario(); }).catch(function(err) { alert('Error: ' + err.message); });
}

function deleteIngrediente(id, nombre) {
  if (!confirm('¿Eliminar el ingrediente "' + nombre + '"?')) return;
  api('/ingredientes/' + id, { method: 'DELETE' }).then(function() { loadInventario(); }).catch(function(err) { alert('Error: ' + err.message); });
}

// ===================== USUARIOS (CRUD) =====================

var _usuariosData = [];
var _editingUserId = null;

function initUsuarios() {
  if (!Auth.check()) return;
  updateUserChip();
  loadUsuarios();
  document.querySelectorAll('.filter-group button').forEach(function(btn) {
    btn.addEventListener('click', function() { loadUsuarios(btn.textContent.trim()); });
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
        '<button class="icon-btn" onclick="editUsuario(' + u.id_usuario + ')">✏️</button>' +
        '<button class="icon-btn danger" onclick="deleteUsuario(' + u.id_usuario + ', \'' + (u.nombre || '').replace(/'/g, "\\'") + '\')">🗑️</button>' +
      '</td></tr>';
  }).join('') : '<tr><td colspan="6" style="text-align:center;color:#888;">No hay usuarios registrados</td></tr>';
}

function abrirModalUsuario() {
  openUsuarioModal(null);
}

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
  if (!nombre || !correo || !usuario) { alert('Nombre, correo y usuario son requeridos'); return; }
  if (!_editingUserId && !contrasena) { alert('La contraseña es requerida para nuevos usuarios'); return; }
  if (contrasena && contrasena !== contrasena2) { alert('Las contraseñas no coinciden'); return; }
  var data = {
    nombre: nombre,
    apellido_paterno: document.getElementById('usrApPaterno').value.trim(),
    apellido_materno: document.getElementById('usrApMaterno').value.trim(),
    correo: correo,
    usuario: usuario,
    telefono: document.getElementById('usrTelefono').value.trim(),
    rol: rol
  };
  if (contrasena) data.contrasena = contrasena;
  var promise = _editingUserId
    ? api('/usuarios/' + _editingUserId, { method: 'PUT', body: JSON.stringify(data) })
    : api('/usuarios', { method: 'POST', body: JSON.stringify(data) });
  promise.then(function() { closeModal('modalUsuario'); loadUsuarios(); }).catch(function(err) { alert('Error: ' + err.message); });
}

function deleteUsuario(id, nombre) {
  if (!confirm('¿Eliminar el usuario "' + nombre + '"?')) return;
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
