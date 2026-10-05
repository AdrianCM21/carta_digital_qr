/* Panel de administración del negocio. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = g.UI;
  const api = g.Data.api;
  const Data = g.Data;
  const Screens = (g.Screens = g.Screens || {});

  const NAV = [
    ['admin', 'dashboard', 'Panel'],
    ['admin/products', 'box', 'Productos'],
    ['admin/orders', 'receipt', 'Pedidos'],
    ['admin/brand', 'brush', 'Mi marca'],
    ['admin/qr', 'qr', 'Códigos QR'],
  ];

  const pageHead = (title, sub, actions) => h('div', { class: 'page-head' }, h('div', null, h('h1', null, title), sub ? h('p', { class: 'muted' }, sub) : null), actions ? h('div', { class: 'page-actions' }, actions) : null);

  // ------------------------------------------------------------------ Estructura (sidebar)
  function brandBlock(s) {
    return h('div', { class: 'admin-brand' }, UI.brandLogo(s, 40), h('div', null, h('b', null, s.name), h('span', null, 'Panel de administración')));
  }
  Screens.refreshAdminBrand = function (s) {
    const el = document.querySelector('.admin-brand');
    if (el) el.replaceWith(brandBlock(s));
  };

  Screens.adminShell = function (path, node, settings) {
    return h(
      'div',
      { class: 'admin' },
      h(
        'aside',
        { class: 'admin-side' },
        brandBlock(settings),
        h('nav', { class: 'admin-nav' }, NAV.map((n) => h('a', { href: '#/' + n[0], class: path === n[0] ? 'active' : '' }, UI.icon(n[1], 18), h('span', null, n[2])))),
        h('a', { class: 'admin-view-site', href: '#/menu' }, UI.icon('store', 18), h('span', null, 'Ver carta del cliente'))
      ),
      h('div', { class: 'admin-main' }, h('div', { class: 'admin-content' }, node))
    );
  };

  // ------------------------------------------------------------------ Panel
  function kpi(label, value, delta, icon) {
    const d = delta == null ? null : h('span', { class: 'delta ' + (delta >= 0 ? 'up' : 'down') }, (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta) + '% vs ayer');
    return h('div', { class: 'card kpi' }, h('div', { class: 'kpi-ico' }, UI.icon(icon, 20)), h('div', { class: 'kpi-body' }, h('span', { class: 'kpi-label' }, label), h('b', { class: 'kpi-value' }, value), d || h('span', { class: 'delta muted' }, ' ')));
  }

  function salesChart(days) {
    const W = 640, Ht = 240, pad = { t: 28, r: 8, b: 30, l: 8 };
    const max = Math.max.apply(null, days.map((d) => d.sales)) || 1;
    const bw = (W - pad.l - pad.r) / days.length;
    const bars = days
      .map((d, i) => {
        const bh = Math.round(((Ht - pad.t - pad.b) * d.sales) / max);
        const x = pad.l + i * bw + bw * 0.18;
        const w = bw * 0.64;
        const y = Ht - pad.b - bh;
        const last = i === days.length - 1;
        return (
          '<g><title>' + H.esc(d.label + ': ' + H.money(d.sales) + ' · ' + d.orders + ' pedidos') + '</title>' +
          '<rect class="bar' + (last ? ' bar-today' : '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + bh + '" rx="6"/>' +
          '<text class="bar-val" x="' + (x + w / 2) + '" y="' + (y - 8) + '" text-anchor="middle">' + H.esc(H.moneyCompact(d.sales)) + '</text>' +
          '<text class="bar-lbl" x="' + (x + w / 2) + '" y="' + (Ht - 10) + '" text-anchor="middle">' + H.esc(d.label) + '</text></g>'
        );
      })
      .join('');
    return h('div', { class: 'chart', role: 'img', 'aria-label': 'Ventas de los últimos 7 días', html: '<svg viewBox="0 0 ' + W + ' ' + Ht + '" width="100%" preserveAspectRatio="xMidYMid meet">' + '<line class="axis" x1="0" x2="' + W + '" y1="' + (Ht - pad.b) + '" y2="' + (Ht - pad.b) + '"/>' + bars + '</svg>' });
  }

  Screens.adminDashboard = async function () {
    const [st, s] = await Promise.all([api.getStats(), api.getSettings()]);
    const topMax = st.top.length ? st.top[0].qty : 1;
    return h(
      'div',
      null,
      pageHead('Panel', 'Resumen de hoy en ' + s.name, h('a', { class: 'btn btn-primary', href: '#/admin/orders' }, UI.icon('receipt', 16), 'Ver pedidos')),
      h(
        'div',
        { class: 'kpis' },
        kpi('Ventas de hoy', H.money(st.today.sales), H.percentChange(st.today.sales, st.yesterday.sales), 'dashboard'),
        kpi('Pedidos de hoy', st.today.orders, H.percentChange(st.today.orders, st.yesterday.orders), 'receipt'),
        kpi('Ticket promedio', H.money(st.today.avg), H.percentChange(st.today.avg, st.yesterday.avg), 'bag'),
        kpi('Pedidos activos', st.today.active, null, 'clock')
      ),
      h(
        'div',
        { class: 'dash-grid' },
        h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h3', null, 'Ventas · últimos 7 días'), h('span', { class: 'muted small' }, H.money(st.days.reduce((a, d) => a + d.sales, 0)) + ' en total')), salesChart(st.days)),
        h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h3', null, 'Más pedidos')), h('ul', { class: 'toplist' }, st.top.map((t, i) => h('li', null, h('span', { class: 'rank' }, i + 1), h('span', { class: 'top-emoji' }, t.emoji), h('div', { class: 'top-info' }, h('b', null, t.name), h('div', { class: 'meter' }, h('span', { style: { width: Math.round((t.qty / topMax) * 100) + '%' } }))), h('span', { class: 'top-qty' }, t.qty + ' u.')))))
      ),
      h(
        'section',
        { class: 'card' },
        h('div', { class: 'card-head' }, h('h3', null, 'Últimos pedidos'), h('a', { class: 'link', href: '#/admin/orders' }, 'Ver todos →')),
        h('div', { class: 'table-list' }, st.recent.map((o) => h('div', { class: 'trow' }, h('b', null, '#' + o.id), h('span', null, o.customer), h('span', { class: 'muted' }, o.type === 'mesa' ? 'Mesa ' + o.table : 'Retiro'), h('span', { class: 'muted' }, H.timeAgo(o.createdAt)), h('b', null, H.money(o.total)), UI.statusBadge(o.status))))
      )
    );
  };

  // ------------------------------------------------------------------ Productos
  Screens.adminProducts = async function () {
    const [products, cats] = await Promise.all([api.getProducts(), api.getCategories()]);
    const catName = {};
    cats.forEach((c) => (catName[c.id] = c));
    const f = { q: '', cat: 'all' };
    const listEl = h('div', { class: 'table-list prod-list' });
    const root = h('div');

    async function reload() {
      const fresh = await api.getProducts();
      products.length = 0;
      fresh.forEach((p) => products.push(p));
      draw();
    }

    function draw() {
      H.clear(listEl);
      const q = f.q.trim().toLowerCase();
      const rows = products.filter((p) => (f.cat === 'all' || p.cat === f.cat) && (!q || p.name.toLowerCase().indexOf(q) !== -1));
      if (!rows.length) return listEl.appendChild(UI.empty('📦', 'Sin productos', 'No hay productos que coincidan con el filtro.'));
      rows.forEach((p) =>
        listEl.appendChild(
          h(
            'div',
            { class: 'trow prow' + (p.available ? '' : ' off') },
            h('div', { class: 'prow-main' }, UI.thumb(p, 44), h('div', null, h('b', null, p.name), h('span', { class: 'muted small' }, catName[p.cat] ? catName[p.cat].name : ''))),
            h('b', { class: 'prow-price' }, H.money(p.price)),
            h('label', { class: 'switch', title: p.available ? 'Disponible' : 'Agotado' }, h('input', { type: 'checkbox', checked: p.available, 'aria-label': 'Disponible: ' + p.name, onchange: async (e) => { await api.setAvailability(p.id, e.target.checked); UI.toast(p.name + (e.target.checked ? ' disponible' : ' marcado como agotado')); reload(); } }), h('span', { class: 'slider' })),
            h('div', { class: 'row-actions' }, h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Editar ' + p.name, onclick: () => openForm(p) }, UI.icon('edit', 17)), h('button', { class: 'icon-btn danger', type: 'button', 'aria-label': 'Eliminar ' + p.name, onclick: () => UI.confirm({ title: 'Eliminar producto', message: '¿Eliminar "' + p.name + '" de la carta? Esta acción no se puede deshacer.', danger: true, confirmLabel: 'Eliminar', onConfirm: async () => { await api.deleteProduct(p.id); UI.toast('Producto eliminado'); reload(); } }) }, UI.icon('trash', 17)))
          )
        )
      );
    }

    function openForm(p) {
      const isNew = !p;
      const cur = H.getCurrency();
      const d = Object.assign({ name: '', desc: '', cat: cats[0].id, price: 0, emoji: '🍽️', tags: [], available: true }, p || {});
      const name = h('input', { type: 'text', value: d.name, placeholder: 'Ej.: Pizza Napolitana', maxlength: '60' });
      const desc = h('textarea', { rows: '3', maxlength: '160', placeholder: 'Ingredientes y detalles' }, d.desc);
      desc.value = d.desc;
      const cat = h('select', null, cats.map((c) => h('option', { value: c.id, selected: c.id === d.cat }, c.name)));
      const price = h('input', { type: 'number', min: '0', step: H.currencies[cur].decimals ? '0.01' : '500', value: H.fromBase(d.price) });
      const emoji = h('input', { type: 'text', value: d.emoji, maxlength: '4', class: 'emoji-in' });
      const avail = h('input', { type: 'checkbox', checked: d.available });
      const tagBoxes = [['popular', 'Popular'], ['nuevo', 'Nuevo'], ['picante', 'Picante'], ['veggie', 'Veggie']].map((t) => ({ key: t[0], el: h('input', { type: 'checkbox', checked: d.tags.indexOf(t[0]) !== -1 }), label: t[1] }));
      const err = h('p', { class: 'form-error', role: 'alert' });
      const m = UI.modal({
        title: isNew ? 'Nuevo producto' : 'Editar producto',
        body: h('div', { class: 'form-grid' }, UI.field('Nombre', name), UI.field('Descripción', desc), h('div', { class: 'two' }, UI.field('Categoría', cat), UI.field('Precio (' + H.currencies[cur].code + ')', price)), h('div', { class: 'two' }, UI.field('Emoji', emoji), UI.field('Disponible', h('label', { class: 'switch' }, avail, h('span', { class: 'slider' })))), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Etiquetas'), h('div', { class: 'checks' }, tagBoxes.map((t) => h('label', { class: 'check' }, t.el, t.label)))), err),
        footer: [
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => m.close() }, 'Cancelar'),
          h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => {
            if (!name.value.trim()) return (err.textContent = 'El nombre es obligatorio.');
            if (!(parseFloat(price.value) >= 0) || price.value === '') return (err.textContent = 'Ingresá un precio válido.');
            await api.saveProduct({ id: p ? p.id : undefined, name: name.value.trim(), desc: desc.value.trim(), cat: cat.value, price: price.value === String(H.fromBase(d.price)) ? d.price : H.toBase(price.value), emoji: emoji.value.trim() || '🍽️', available: avail.checked, tags: tagBoxes.filter((t) => t.el.checked).map((t) => t.key) });
            m.close();
            UI.toast(isNew ? 'Producto creado' : 'Cambios guardados');
            reload();
          } }, isNew ? 'Crear producto' : 'Guardar cambios'),
        ],
      });
    }

    root.append(
      pageHead('Productos', products.length + ' productos en la carta', h('button', { class: 'btn btn-primary', type: 'button', onclick: () => openForm(null) }, UI.icon('plus', 16), 'Nuevo producto')),
      h('div', { class: 'toolbar' }, h('div', { class: 'searchbar searchbar-flat' }, UI.icon('search', 18), h('input', { type: 'search', placeholder: 'Buscar producto…', 'aria-label': 'Buscar producto', oninput: (e) => { f.q = e.target.value; draw(); } })), h('select', { 'aria-label': 'Filtrar por categoría', onchange: (e) => { f.cat = e.target.value; draw(); } }, [h('option', { value: 'all' }, 'Todas las categorías')].concat(cats.map((c) => h('option', { value: c.id }, c.name))))),
      h('section', { class: 'card card-flush' }, listEl)
    );
    draw();
    return root;
  };

  // ------------------------------------------------------------------ Pedidos
  Screens.adminOrders = async function () {
    const root = h('div');
    const board = h('div', { class: 'kanban' });
    const NEXT = { new: ['preparing', 'Empezar a preparar'], preparing: ['ready', 'Marcar listo'], ready: ['delivered', 'Marcar entregado'] };

    async function advance(o) {
      await api.updateOrderStatus(o.id, NEXT[o.status][0]);
      UI.toast('Pedido #' + o.id + ': ' + Data.statusLabels[NEXT[o.status][0]].toLowerCase());
      draw();
    }

    function openDetail(o) {
      const m = UI.modal({
        title: 'Pedido #' + o.id,
        body: h('div', { class: 'order-detail' }, h('div', { class: 'od-meta' }, UI.statusBadge(o.status), h('span', { class: 'muted' }, H.fmtTime(o.createdAt) + ' · ' + H.timeAgo(o.createdAt))), h('p', null, h('b', null, o.customer), o.phone ? ' · ' + o.phone : ''), h('p', { class: 'muted' }, (o.type === 'mesa' ? 'En mesa ' + o.table : 'Retiro en el local') + ' · Pago: ' + o.payment), h('div', { class: 'summary' }, o.lines.map((l) => h('div', { class: 'srow' }, h('span', null, l.qty + '× ' + l.name + (l.note ? ' — “' + l.note + '”' : '')), h('span', null, H.money(l.price * l.qty)))), o.tip ? h('div', { class: 'srow' }, h('span', null, 'Propina'), h('span', null, H.money(o.tip))) : null, h('div', { class: 'srow total' }, h('span', null, 'Total'), h('b', null, H.money(o.total)))), o.notes ? h('p', { class: 'od-notes' }, '💬 ' + o.notes) : null),
        footer: NEXT[o.status] ? [h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => m.close() }, 'Cerrar'), h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { m.close(); advance(o); } }, NEXT[o.status][1])] : [h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => m.close() }, 'Cerrar')],
      });
    }

    async function draw() {
      const orders = await api.getOrders();
      H.clear(board);
      Data.statusFlow.forEach((status) => {
        let list = orders.filter((o) => o.status === status);
        const total = list.length;
        if (status === 'delivered') list = list.slice(0, 6);
        board.appendChild(
          h(
            'section',
            { class: 'kcol kcol-' + status },
            h('header', null, h('span', { class: 'kdot' }), h('b', null, Data.statusLabels[status]), h('span', { class: 'kcount' }, total)),
            h(
              'div',
              { class: 'kbody' },
              list.length
                ? list.map((o) =>
                    h(
                      'article',
                      { class: 'ocard', tabindex: '0', onclick: () => openDetail(o), onkeydown: (e) => e.key === 'Enter' && openDetail(o) },
                      h('div', { class: 'ocard-top' }, h('b', null, '#' + o.id), h('span', { class: 'muted small' }, H.timeAgo(o.createdAt))),
                      h('div', { class: 'ocard-who' }, o.customer, h('span', { class: 'pill' }, o.type === 'mesa' ? 'Mesa ' + o.table : 'Retiro')),
                      h('p', { class: 'ocard-items' }, o.lines.map((l) => l.qty + '× ' + l.name).join(' · ')),
                      h('div', { class: 'ocard-foot' }, h('b', null, H.money(o.total)), NEXT[o.status] ? h('button', { class: 'btn btn-sm btn-primary', type: 'button', onclick: (e) => { e.stopPropagation(); advance(o); } }, NEXT[o.status][1]) : h('span', { class: 'muted small' }, '✓ Completado'))
                    )
                  )
                : h('p', { class: 'muted small kempty' }, 'Sin pedidos')
            )
          )
        );
      });
    }

    root.append(pageHead('Pedidos', 'Los pedidos nuevos llegan acá en cuanto el cliente confirma.', h('a', { class: 'btn btn-ghost', href: '#/menu' }, UI.icon('store', 16), 'Hacer un pedido de prueba')), board);
    await draw();
    return root;
  };

  // ------------------------------------------------------------------ Marca
  const LOGOS = ['🔥', '🍽️', '🌿', '⚓', '🍇', '🥂', '☕', '🍕', '🍔', '🌮', '🍣', '🥐', '🍷', '🧁'];

  Screens.adminBrand = async function () {
    let s = await api.getSettings();
    const products = (await api.getProducts()).slice(0, 3);
    const preview = h('div', { class: 'brand-preview' });
    const palEl = h('div', { class: 'palette-grid' });
    const logoEl = h('div', { class: 'logo-grid' });
    const curEl = h('div', { class: 'chips' });
    const err = h('p', { class: 'form-error', role: 'alert' });

    async function save(patch, rerender) {
      s = await api.saveSettings(patch);
      g.App.applySettings(s, rerender);
      if (!rerender) {
        drawPreview();
        drawChoices();
        Screens.refreshAdminBrand(s);
      }
    }

    function drawPreview() {
      H.clear(preview).append(
        h('div', { class: 'bp-hero' }, UI.brandLogo(s, 48), h('div', null, h('b', null, s.name || 'Tu negocio'), h('span', null, s.tagline))),
        h('div', { class: 'bp-chips' }, h('span', { class: 'chip active' }, 'Todo'), h('span', { class: 'chip' }, '🥩 Platos'), h('span', { class: 'chip' }, '🍰 Postres')),
        ...products.map((p) => h('div', { class: 'bp-item' }, h('div', null, h('b', null, p.name), h('span', { class: 'price' }, H.money(p.price))), UI.thumb(p, 44))),
        h('div', { class: 'bp-cart' }, h('span', null, '2'), 'Ver mi pedido', h('b', null, H.money(products[0] ? products[0].price * 2 : 0)))
      );
    }

    function drawChoices() {
      H.clear(palEl);
      Data.palettes.forEach((p) => palEl.appendChild(h('button', { type: 'button', class: 'swatch' + (s.palette === p.key ? ' active' : ''), 'aria-pressed': s.palette === p.key, onclick: () => save({ palette: p.key }, true) }, h('span', { class: 'swatch-dot', style: { background: p.color } }), p.label)));
      H.clear(logoEl);
      LOGOS.forEach((e) => logoEl.appendChild(h('button', { type: 'button', class: 'logo-opt' + (!s.logoImage && s.logoEmoji === e ? ' active' : ''), 'aria-label': 'Logo ' + e, onclick: () => save({ logoEmoji: e, logoImage: null }) }, e)));
      H.clear(curEl);
      Object.keys(H.currencies).forEach((c) => curEl.appendChild(h('button', { type: 'button', class: 'chip' + (s.currency === c ? ' active' : ''), onclick: () => save({ currency: c }, true) }, H.currencies[c].symbol + ' ' + c)));
    }

    const text = (key, label, extra) => UI.field(label, h('input', Object.assign({ type: 'text', value: s[key] || '', oninput: (e) => save({ [key]: e.target.value }) }, extra || {})));

    const file = h('input', { type: 'file', accept: 'image/*', class: 'sr-only', onchange: async (e) => {
      err.textContent = '';
      try {
        const url = await H.imageToDataUrl(e.target.files[0], 256);
        await save({ logoImage: url });
        UI.toast('Logo actualizado');
      } catch (ex) {
        err.textContent = ex.message;
      }
    } });

    const presetEl = h('div', { class: 'chips' }, Data.identityPresets.map((p) => h('button', { type: 'button', class: 'chip', onclick: async () => { await save({ name: p.name, tagline: p.tagline, logoEmoji: p.logoEmoji, logoImage: null, palette: p.palette }, true); UI.toast('Identidad: ' + p.name); } }, p.logoEmoji + ' ' + p.name)));

    drawPreview();
    drawChoices();
    return h(
      'div',
      null,
      pageHead('Mi marca', 'Nombre, logo, colores y moneda. Los cambios se ven al instante en la carta.'),
      h(
        'div',
        { class: 'brand-grid' },
        h(
          'div',
          { class: 'brand-forms' },
          h('section', { class: 'card form-sec' }, h('h3', null, 'Identidad'), text('name', 'Nombre del negocio', { maxlength: '40' }), text('tagline', 'Descripción corta', { maxlength: '60' }), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Logo'), logoEl, h('label', { class: 'btn btn-ghost btn-sm upload-btn' }, UI.icon('upload', 16), 'Subir mi logo', file), s.logoImage ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => save({ logoImage: null }).then(() => g.App.rerender()) }, 'Quitar imagen') : null, err)),
          h('section', { class: 'card form-sec' }, h('h3', null, 'Colores'), palEl, h('p', { class: 'muted small' }, 'Cada paleta cambia botones, fondos y acentos de toda la carta.')),
          h('section', { class: 'card form-sec' }, h('h3', null, 'Moneda'), curEl, h('p', { class: 'muted small' }, 'Los precios se guardan una vez y se muestran convertidos (demo con cotización fija).')),
          h('section', { class: 'card form-sec' }, h('h3', null, 'Local'), text('address', 'Dirección'), text('hours', 'Horario'), UI.field('Cantidad de mesas', h('input', { type: 'number', min: '1', max: '60', value: s.tables, oninput: (e) => save({ tables: H.clamp(parseInt(e.target.value, 10) || 1, 1, 60) }) }))),
          h('section', { class: 'card form-sec' }, h('h3', null, 'Probar otra identidad'), h('p', { class: 'muted small' }, 'Ejemplos de cómo se vería para distintos tipos de negocio.'), presetEl)
        ),
        h('aside', { class: 'brand-side' }, h('h3', { class: 'side-title' }, 'Vista previa'), h('div', { class: 'phone-mini' }, preview))
      )
    );
  };

  // ------------------------------------------------------------------ Códigos QR
  Screens.adminQR = async function () {
    const s = await api.getSettings();
    const st = { table: Math.min(await api.getTable(), s.tables) };
    const qrBox = h('div', { class: 'qr-box qr-box-lg' });
    const label = h('div', { class: 'qrp-table' });
    const urlEl = h('code', { class: 'url' });
    const select = h('select', { 'aria-label': 'Mesa', onchange: (e) => { st.table = parseInt(e.target.value, 10); draw(); } }, Array.from({ length: s.tables }, (_, i) => h('option', { value: i + 1, selected: i + 1 === st.table }, 'Mesa ' + (i + 1))));

    function draw() {
      const url = H.appUrl('menu?mesa=' + st.table);
      H.renderQR(qrBox, url, 220);
      label.textContent = 'Mesa ' + st.table;
      urlEl.textContent = url;
      api.setTable(st.table);
    }

    const root = h(
      'div',
      null,
      pageHead('Códigos QR', 'Un QR por mesa: el cliente escanea y ve la carta con su mesa ya cargada.'),
      h(
        'div',
        { class: 'qr-admin' },
        h('section', { class: 'card form-sec qr-controls' }, h('h3', null, 'Generar'), UI.field('Mesa', select), h('p', { class: 'muted small' }, 'Apunta a:'), urlEl, h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { document.body.classList.add('printing-qr'); g.print(); } }, UI.icon('print', 16), 'Imprimir'), h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { const d = H.qrDataUrl(qrBox); if (d) H.download(d, 'qr-mesa-' + st.table + '.png'); } }, UI.icon('download', 16), 'Descargar PNG')), h('a', { class: 'btn btn-ghost', href: '#/qr' }, UI.icon('scan', 16), 'Ver pantalla de escaneo')),
        h('div', { class: 'qr-print-wrap' }, h('div', { class: 'qr-print' }, UI.brandLogo(s, 56), h('h2', null, s.name), h('p', { class: 'muted' }, 'Escaneá y pedí desde tu mesa'), qrBox, label, h('p', { class: 'small muted' }, 'Abrí la cámara de tu celular y apuntá al código')))
      )
    );
    g.addEventListener('afterprint', () => document.body.classList.remove('printing-qr'));
    draw();
    return root;
  };
})(window);
