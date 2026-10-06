/* Panel de administración del negocio. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = g.UI;
  const api = g.Data.api;
  const Data = g.Data;
  const Screens = (g.Screens = g.Screens || {});

  const NAV = [
    ['admin/orders', 'receipt', 'Pedidos'],
    ['admin/products', 'box', 'Mi carta'],
    ['admin/local', 'brush', 'Mi local'],
  ];

  const pageHead = (title, sub, actions) => h('div', { class: 'page-head' }, h('div', null, h('h1', null, title), sub ? (sub instanceof Node ? sub : h('p', { class: 'muted' }, sub)) : null), actions ? h('div', { class: 'page-actions' }, actions) : null);

  // ------------------------------------------------------------------ Estructura (sidebar)
  function brandBlock(s) {
    return h('div', { class: 'admin-brand' }, UI.brandLogo(s, 40), h('div', null, h('b', null, s.name), h('span', null, 'Panel de administración')));
  }
  Screens.refreshAdminBrand = function (s) {
    const el = document.querySelector('.admin-brand');
    if (el) el.replaceWith(brandBlock(s));
  };

  Screens.adminShell = function (path, node, settings) {
    // El resumen es una vista secundaria de Pedidos: mantiene "Pedidos" marcado en el menú.
    const current = path === 'admin/summary' ? 'admin/orders' : path;
    return h(
      'div',
      { class: 'admin' },
      h(
        'aside',
        { class: 'admin-side' },
        brandBlock(settings),
        h('nav', { class: 'admin-nav' }, NAV.map((n) => h('a', { href: '#/' + n[0], class: current === n[0] ? 'active' : '' }, UI.icon(n[1], 18), h('span', null, n[2])))),
        h('a', { class: 'admin-view-site', href: '#/menu' }, UI.icon('store', 18), h('span', null, 'Ver carta del cliente'))
      ),
      h('div', { class: 'admin-main' }, h('div', { class: 'admin-content' }, node))
    );
  };

  // ------------------------------------------------------------------ Resumen (vista secundaria)
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

  Screens.adminSummary = async function () {
    const st = await api.getStats();
    const topMax = st.top.length ? st.top[0].qty : 1;
    return h(
      'div',
      null,
      pageHead('Resumen', 'Cómo viene el negocio. Los últimos 7 días y lo más pedido.', h('a', { class: 'btn btn-ghost', href: '#/admin/orders' }, UI.icon('back', 16), 'Volver a pedidos')),
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
      )
    );
  };


  // ------------------------------------------------------------------ Mi carta
  Screens.adminProducts = async function () {
    const [products, cats] = await Promise.all([api.getProducts(), api.getCategories()]);
    const f = { q: '' };
    const listEl = h('div', { class: 'prod-groups' });
    const sub = h('p', { class: 'muted' });
    const root = h('div');

    async function reload() {
      const fresh = await api.getProducts();
      products.length = 0;
      fresh.forEach((p) => products.push(p));
      draw();
    }

    function row(p) {
      const cur = H.getCurrency();
      const unit = H.currencies[cur];
      const priceIn = h('input', { type: 'number', min: '0', step: unit.decimals ? '0.1' : '500', value: H.fromBase(p.price), 'aria-label': 'Precio de ' + p.name, onchange: async (e) => {
        const v = parseFloat(e.target.value);
        if (!(v >= 0) || e.target.value === '') return (e.target.value = H.fromBase(p.price));
        if (String(v) === String(H.fromBase(p.price))) return;
        await api.saveProduct({ id: p.id, price: H.toBase(v) });
        UI.toast('Precio de ' + p.name + ' actualizado');
        reload();
      } });
      return h(
        'div',
        { class: 'prow' + (p.available ? '' : ' off') },
        h('div', { class: 'prow-main' }, UI.thumb(p, 44), h('b', null, p.name)),
        h('label', { class: 'price-in' }, h('span', null, unit.symbol), priceIn),
        h('label', { class: 'avail' }, h('span', { class: 'switch' }, h('input', { type: 'checkbox', checked: p.available, onchange: async (e) => { await api.setAvailability(p.id, e.target.checked); UI.toast(p.name + (e.target.checked ? ' disponible' : ' agotado en la carta')); reload(); } }), h('span', { class: 'slider' })), h('span', { class: 'avail-label' }, p.available ? 'Disponible' : 'Agotado')),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Editar ' + p.name, onclick: () => openForm(p) }, UI.icon('edit', 17))
      );
    }

    function draw() {
      H.clear(listEl);
      const out = products.filter((p) => !p.available).length;
      sub.textContent = products.length + ' platos' + (out ? ' · ' + out + ' agotado' + (out > 1 ? 's' : '') : '');
      const q = f.q.trim().toLowerCase();
      let any = false;
      cats.forEach((c) => {
        const items = products.filter((p) => p.cat === c.id && (!q || p.name.toLowerCase().indexOf(q) !== -1));
        if (!items.length) return;
        any = true;
        listEl.appendChild(h('section', { class: 'card card-flush cat-group' }, h('header', { class: 'cat-head' }, h('b', null, c.emoji + ' ' + c.name), h('span', { class: 'kcount' }, items.length)), items.map(row)));
      });
      if (!any) listEl.appendChild(UI.empty('🔍', 'Sin resultados', 'Probá con otra palabra.'));
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
      let image = d.image || null;
      const photoBox = h('div', { class: 'photo-edit' });
      const drawPhoto = () => {
        H.clear(photoBox).append(
          UI.thumb({ emoji: emoji.value || '🍽️', image: image }, 64),
          h('label', { class: 'btn btn-ghost btn-sm upload-btn' }, UI.icon('upload', 16), image ? 'Cambiar foto' : 'Subir foto', h('input', { type: 'file', accept: 'image/*', class: 'sr-only', onchange: async (e) => {
            try { image = await H.imageToDataUrl(e.target.files[0], 640, 'image/jpeg'); drawPhoto(); } catch (ex) { err.textContent = ex.message; }
          } })),
          image ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { image = null; drawPhoto(); } }, 'Quitar') : null
        );
      };
      const tagBoxes = [['popular', 'Popular'], ['nuevo', 'Nuevo'], ['picante', 'Picante'], ['veggie', 'Veggie']].map((t) => ({ key: t[0], el: h('input', { type: 'checkbox', checked: d.tags.indexOf(t[0]) !== -1 }), label: t[1] }));
      const err = h('p', { class: 'form-error', role: 'alert' });
      drawPhoto();
      const m = UI.modal({
        title: isNew ? 'Nuevo plato' : 'Editar plato',
        body: h(
          'div',
          { class: 'form-grid' },
          UI.field('Nombre', name),
          h('div', { class: 'two' }, UI.field('Precio (' + H.currencies[cur].code + ')', price), UI.field('Categoría', cat)),
          h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Foto'), photoBox),
          h('details', { class: 'more' }, h('summary', null, 'Más opciones'), h('div', { class: 'form-grid' }, UI.field('Descripción', desc), UI.field('Emoji (si no hay foto)', emoji), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Etiquetas'), h('div', { class: 'checks' }, tagBoxes.map((t) => h('label', { class: 'check' }, t.el, t.label)))))),
          err
        ),
        footer: [
          isNew ? null : h('button', { class: 'btn btn-ghost foot-left danger-text', type: 'button', onclick: () => { m.close(); UI.confirm({ title: 'Eliminar plato', message: '¿Eliminar "' + p.name + '" de la carta? Esta acción no se puede deshacer.', danger: true, confirmLabel: 'Eliminar', onConfirm: async () => { await api.deleteProduct(p.id); UI.toast('Plato eliminado'); reload(); } }); } }, UI.icon('trash', 16), 'Eliminar'),
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => m.close() }, 'Cancelar'),
          h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => {
            if (!name.value.trim()) return (err.textContent = 'El nombre es obligatorio.');
            if (!(parseFloat(price.value) >= 0) || price.value === '') return (err.textContent = 'Ingresá un precio válido.');
            await api.saveProduct({ id: p ? p.id : undefined, name: name.value.trim(), desc: desc.value.trim(), cat: cat.value, price: price.value === String(H.fromBase(d.price)) ? d.price : H.toBase(price.value), emoji: emoji.value.trim() || '🍽️', image: image, available: d.available, tags: tagBoxes.filter((t) => t.el.checked).map((t) => t.key) });
            m.close();
            UI.toast(isNew ? 'Plato creado' : 'Cambios guardados');
            reload();
          } }, isNew ? 'Crear plato' : 'Guardar'),
        ],
      });
    }

    root.append(
      pageHead('Mi carta', sub, h('button', { class: 'btn btn-primary', type: 'button', onclick: () => openForm(null) }, UI.icon('plus', 16), 'Nuevo plato')),
      h('div', { class: 'searchbar searchbar-flat' }, UI.icon('search', 18), h('input', { type: 'search', placeholder: 'Buscar plato…', 'aria-label': 'Buscar plato', oninput: (e) => { f.q = e.target.value; draw(); } })),
      listEl
    );
    draw();
    return root;
  };

  // ------------------------------------------------------------------ Pedidos (inicio del admin)
  Screens.adminOrders = async function () {
    const root = h('div');
    const strip = h('div', { class: 'today-strip' });
    const board = h('div', { class: 'kanban' });
    const doneCount = h('span', { class: 'kcount' });
    const doneList = h('div', { class: 'table-list' });
    const done = h('details', { class: 'delivered card card-flush' }, h('summary', null, 'Entregados hoy ', doneCount), doneList);
    const COLS = ['new', 'preparing', 'ready'];
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
        footer: [
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => m.close() }, 'Cerrar'),
          NEXT[o.status] ? h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { m.close(); advance(o); } }, NEXT[o.status][1]) : null,
        ],
      });
    }

    const known = new Set();
    async function draw(announce) {
      const [orders, st] = await Promise.all([api.getOrders(), api.getStats()]);
      const fresh = orders.filter((o) => announce && !known.has(o.id));
      orders.forEach((o) => known.add(o.id));
      if (fresh.length) {
        H.beep();
        UI.toast('Nuevo pedido #' + fresh[0].id + ' · ' + fresh[0].customer);
      }
      const freshIds = new Set(fresh.map((o) => o.id));

      H.clear(strip).append(
        h('div', { class: 'stat' }, h('span', null, 'Ventas de hoy'), h('b', null, H.money(st.today.sales))),
        h('div', { class: 'stat' }, h('span', null, 'Pedidos de hoy'), h('b', null, st.today.orders))
      );

      H.clear(board);
      COLS.forEach((status) => {
        const list = orders.filter((o) => o.status === status);
        board.appendChild(
          h(
            'section',
            { class: 'kcol kcol-' + status },
            h('header', null, h('span', { class: 'kdot' }), h('b', null, Data.statusLabels[status]), h('span', { class: 'kcount' }, list.length)),
            h(
              'div',
              { class: 'kbody' },
              list.length
                ? list.map((o) =>
                    h(
                      'article',
                      { class: 'ocard' + (freshIds.has(o.id) ? ' ocard-new' : ''), tabindex: '0', onclick: () => openDetail(o), onkeydown: (e) => e.key === 'Enter' && openDetail(o) },
                      h('div', { class: 'ocard-top' }, h('b', null, '#' + o.id), h('span', { class: 'muted small' }, H.timeAgo(o.createdAt))),
                      h('div', { class: 'ocard-who' }, o.customer, h('span', { class: 'pill' }, o.type === 'mesa' ? 'Mesa ' + o.table : 'Retiro')),
                      h('p', { class: 'ocard-items' }, o.lines.map((l) => l.qty + '× ' + l.name).join(' · ')),
                      h('div', { class: 'ocard-foot' }, h('b', null, H.money(o.total)), h('button', { class: 'btn btn-sm btn-primary', type: 'button', onclick: (e) => { e.stopPropagation(); advance(o); } }, NEXT[o.status][1]))
                    )
                  )
                : h('p', { class: 'muted small kempty' }, 'Sin pedidos')
            )
          )
        );
      });

      const t0 = H.startOfDay(Date.now());
      const delivered = orders.filter((o) => o.status === 'delivered' && o.createdAt >= t0);
      doneCount.textContent = delivered.length;
      H.clear(doneList).append(...delivered.map((o) => h('div', { class: 'drow', tabindex: '0', onclick: () => openDetail(o), onkeydown: (e) => e.key === 'Enter' && openDetail(o) }, h('b', null, '#' + o.id), h('span', null, o.customer), h('span', { class: 'muted' }, H.fmtTime(o.createdAt)), h('b', null, H.money(o.total)))));
      if (!delivered.length) doneList.appendChild(h('p', { class: 'muted small kempty' }, 'Todavía no hay pedidos entregados hoy.'));
    }

    root.append(pageHead('Pedidos', 'Los pedidos nuevos llegan acá en cuanto el cliente confirma.', h('a', { class: 'link', href: '#/admin/summary' }, 'Ver resumen →')), strip, board, done);
    await draw();
    // Pedidos que llegan desde otra ventana (ej.: la carta del cliente en la vista en vivo).
    g.App.onLeave(api.onExternalChange('orders', () => draw(true)));
    return root;
  };

  // ------------------------------------------------------------------ Mi local (marca + mesas y QR)
  const LOGOS = ['🔥', '🍽️', '🌿', '⚓', '🍇', '🥂', '☕', '🍕', '🍔', '🌮', '🍣', '🥐', '🍷', '🧁'];
  const CHECK_DEFAULT = { logo: true, color: true, menu: true, qr: false };
  const CHECKS = [['logo', 'Poné tu logo y nombre'], ['color', 'Elegí tu color'], ['menu', 'Cargá tus platos'], ['qr', 'Imprimí los QR de tus mesas']];

  Screens.adminLocal = async function () {
    let s = await api.getSettings();
    let table = Math.min(await api.getTable(), s.tables);
    const products = (await api.getProducts()).slice(0, 3);
    const preview = h('div', { class: 'brand-preview' });
    const palEl = h('div', { class: 'palette-grid' });
    const logoEl = h('div', { class: 'logo-grid' });
    const curEl = h('div', { class: 'chips chips-wrap-inline' });
    const checkEl = h('section', { class: 'card checklist' });
    const tableWrap = h('div');
    const qrHead = h('div', { class: 'qr-head' });
    const qrBox = h('div', { class: 'qr-box' });
    const qrLabel = h('div', { class: 'qrp-table' });
    const err = h('p', { class: 'form-error', role: 'alert' });

    const checks = () => Object.assign({}, CHECK_DEFAULT, s.checklist);

    async function save(patch, rerender) {
      const cl = checks();
      if ('palette' in patch) cl.color = true;
      if ('name' in patch || 'logoEmoji' in patch || 'logoImage' in patch) cl.logo = true;
      s = await api.saveSettings(Object.assign({}, patch, { checklist: cl }));
      g.App.applySettings(s, rerender);
      if (!rerender) {
        drawPreview();
        drawChoices();
        drawChecklist();
        Screens.refreshAdminBrand(s);
      }
    }
    async function setCheck(key, value) {
      s = await api.saveSettings({ checklist: Object.assign(checks(), { [key]: value }) });
      drawChecklist();
    }

    function drawChecklist() {
      const c = checks();
      const n = CHECKS.filter((x) => c[x[0]]).length;
      H.clear(checkEl).append(
        h('div', { class: 'card-head' }, h('h3', null, n === CHECKS.length ? '✓ Todo listo para publicar' : 'Primeros pasos'), h('span', { class: 'muted small' }, n + ' de ' + CHECKS.length)),
        h('div', { class: 'meter' }, h('span', { style: { width: (n / CHECKS.length) * 100 + '%' } })),
        h('ul', { class: 'check-items' }, CHECKS.map((x) => h('li', null, h('button', { type: 'button', class: 'check-item' + (c[x[0]] ? ' done' : ''), role: 'checkbox', 'aria-checked': String(!!c[x[0]]), onclick: () => setCheck(x[0], !c[x[0]]) }, h('span', { class: 'box' }, c[x[0]] ? UI.icon('check', 14) : null), x[1]), x[0] === 'menu' ? h('a', { class: 'link', href: '#/admin/products' }, 'Ir a Mi carta →') : null)))
      );
    }

    function drawPreview() {
      H.clear(preview).append(
        h('div', { class: 'bp-hero' }, UI.brandLogo(s, 48), h('div', null, h('b', null, s.name || 'Tu negocio'), h('span', null, s.tagline))),
        h('div', { class: 'bp-chips' }, h('span', { class: 'chip active' }, 'Todo'), h('span', { class: 'chip' }, '🥩 Platos'), h('span', { class: 'chip' }, '🍰 Postres')),
        ...products.map((p) => h('div', { class: 'bp-item' }, h('div', null, h('b', null, p.name), h('span', { class: 'price' }, H.money(p.price))), UI.thumb(p, 44))),
        h('div', { class: 'bp-cart' }, h('span', null, '2'), 'Ver mi pedido', h('b', null, H.money(products[0] ? products[0].price * 2 : 0)))
      );
      H.clear(qrHead).append(UI.brandLogo(s, 44), h('h2', null, s.name));
    }

    function drawChoices() {
      H.clear(palEl);
      Data.palettes.forEach((p) => palEl.appendChild(h('button', { type: 'button', class: 'swatch' + (s.palette === p.key ? ' active' : ''), 'aria-pressed': String(s.palette === p.key), onclick: () => save({ palette: p.key }, true) }, h('span', { class: 'swatch-dot', style: { background: p.color } }), p.label)));
      H.clear(logoEl);
      LOGOS.forEach((e) => logoEl.appendChild(h('button', { type: 'button', class: 'logo-opt' + (!s.logoImage && s.logoEmoji === e ? ' active' : ''), 'aria-label': 'Logo ' + e, onclick: () => save({ logoEmoji: e, logoImage: null }) }, e)));
      H.clear(curEl);
      Object.keys(H.currencies).forEach((c) => curEl.appendChild(h('button', { type: 'button', class: 'chip' + (s.currency === c ? ' active' : ''), onclick: () => save({ currency: c }, true) }, H.currencies[c].symbol + ' ' + c)));
    }

    function drawTables() {
      H.clear(tableWrap).appendChild(h('select', { 'aria-label': 'Mesa', onchange: (e) => { table = parseInt(e.target.value, 10); drawQR(); } }, Array.from({ length: s.tables }, (_, i) => h('option', { value: i + 1, selected: i + 1 === table }, 'Mesa ' + (i + 1)))));
    }
    function drawQR() {
      H.renderQR(qrBox, H.appUrl('menu?mesa=' + table), 176);
      qrLabel.textContent = 'Mesa ' + table;
      api.setTable(table);
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

    drawChecklist();
    drawPreview();
    drawChoices();
    drawTables();
    drawQR();
    g.addEventListener('afterprint', () => document.body.classList.remove('printing-qr'));

    return h(
      'div',
      null,
      pageHead('Mi local', 'Tu marca, tus mesas y tus códigos QR en un solo lugar.'),
      h(
        'div',
        { class: 'brand-grid' },
        h(
          'div',
          { class: 'brand-forms' },
          checkEl,
          h('section', { class: 'card form-sec' }, h('h3', null, 'Logo y nombre'), text('name', 'Nombre del negocio', { maxlength: '40' }), text('tagline', 'Descripción corta', { maxlength: '60' }), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Logo'), logoEl, h('div', { class: 'btn-row' }, h('label', { class: 'btn btn-ghost btn-sm upload-btn' }, UI.icon('upload', 16), 'Subir mi logo', file), s.logoImage ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => save({ logoImage: null }).then(() => g.App.rerender()) }, 'Quitar imagen') : null), err)),
          h('section', { class: 'card form-sec' }, h('h3', null, 'Color'), palEl, h('p', { class: 'muted small' }, 'Cambia botones, fondos y acentos de toda la carta.')),
          h(
            'section',
            { class: 'card form-sec' },
            h('h3', null, 'Mesas y códigos QR'),
            h('p', { class: 'muted small' }, 'Un QR por mesa: el cliente escanea y ve la carta con su mesa ya cargada.'),
            h(
              'div',
              { class: 'qr-block' },
              h('div', { class: 'qr-side' }, UI.field('Mesa', tableWrap), h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { setCheck('qr', true); document.body.classList.add('printing-qr'); g.print(); } }, UI.icon('print', 16), 'Imprimir'), h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { const d = H.qrDataUrl(qrBox); if (d) { H.download(d, 'qr-mesa-' + table + '.png'); setCheck('qr', true); } } }, UI.icon('download', 16), 'Descargar'))),
              h('div', { class: 'qr-print' }, qrHead, h('p', { class: 'muted small' }, 'Escaneá y pedí desde tu mesa'), qrBox, qrLabel)
            )
          ),
          h('details', { class: 'card acc' }, h('summary', null, 'Datos del local y moneda'), h('div', { class: 'form-sec' }, text('address', 'Dirección'), text('hours', 'Horario'), UI.field('Cantidad de mesas', h('input', { type: 'number', min: '1', max: '60', value: s.tables, oninput: (e) => { save({ tables: H.clamp(parseInt(e.target.value, 10) || 1, 1, 60) }).then(() => { table = Math.min(table, s.tables); drawTables(); drawQR(); }); } })), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Moneda'), curEl)))
        ),
        h('aside', { class: 'brand-side' }, h('h3', { class: 'side-title' }, 'Vista previa'), h('div', { class: 'phone-mini' }, preview))
      )
    );
  };
})(window);
