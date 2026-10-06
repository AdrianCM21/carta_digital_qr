/* Pantallas del cliente final: QR de entrada, carta, carrito, checkout y confirmación. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = g.UI;
  const api = g.Data.api;
  const Screens = (g.Screens = g.Screens || {});

  const deviceEl = () => document.querySelector('.device') || document.body;
  const menuUrl = (table) => H.appUrl('menu?mesa=' + table);
  const topbar = (title, backRoute, right) =>
    h('div', { class: 'topbar' }, h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Volver', onclick: () => g.App.go(backRoute) }, UI.icon('back', 20)), h('h2', null, title), right || h('span', { class: 'topbar-spacer' }));

  // ------------------------------------------------------------------ QR de entrada
  Screens.qr = async function () {
    const [s, table] = await Promise.all([api.getSettings(), api.getTable()]);
    const qrBox = h('div', { class: 'qr-box' });
    const root = h(
      'div',
      { class: 'qr-landing' },
      h('div', { class: 'qr-brand' }, UI.brandLogo(s, 72), h('h1', null, s.name), h('p', { class: 'muted' }, s.tagline)),
      h('div', { class: 'qr-card-wrap' }, h('div', { class: 'qr-frame' }, qrBox, h('span', { class: 'qr-corner tl' }), h('span', { class: 'qr-corner tr' }), h('span', { class: 'qr-corner bl' }), h('span', { class: 'qr-corner br' }), h('span', { class: 'qr-scanline' })), h('div', { class: 'table-pill' }, 'Mesa ' + table)),
      h('p', { class: 'qr-hint' }, 'Escaneá el código con la cámara de tu celular para ver la carta y pedir desde tu mesa.'),
      h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: () => g.App.go('menu') }, UI.icon('scan', 20), 'Simular escaneo'),
      h(
        'ol',
        { class: 'steps-mini' },
        h('li', null, h('b', null, '1'), 'Escaneás'),
        h('li', null, h('b', null, '2'), 'Elegís'),
        h('li', null, h('b', null, '3'), 'Pedís y listo')
      )
    );
    H.renderQR(qrBox, menuUrl(table), 176);
    return root;
  };

  // ------------------------------------------------------------------ Carta
  Screens.menu = async function (ctx) {
    if (ctx.query.mesa) await api.setTable(parseInt(ctx.query.mesa, 10) || 7);
    const [s, products, cats, table] = await Promise.all([api.getSettings(), api.getProducts(), api.getCategories(), api.getTable()]);
    let cart = await api.getCart();
    const st = { cat: 'all', q: '' };
    const chipsEl = h('div', { class: 'chips', role: 'tablist' });
    const listEl = h('div', { class: 'menu-list' });
    const barEl = h('div', { class: 'cartbar-wrap' });

    function renderChips() {
      H.clear(chipsEl);
      [{ id: 'all', name: 'Todo', emoji: '✨' }].concat(cats).forEach((c) =>
        chipsEl.appendChild(
          h('button', { class: 'chip' + (st.cat === c.id ? ' active' : ''), type: 'button', role: 'tab', 'aria-selected': st.cat === c.id, onclick: () => { st.cat = c.id; renderChips(); renderList(); } }, c.emoji + ' ' + c.name)
        )
      );
    }

    function card(p) {
      const open = () => p.available && openProduct(p);
      return h(
        'div',
        { class: 'pcard' + (p.available ? '' : ' sold-out'), role: 'button', tabindex: p.available ? '0' : '-1', onclick: open, onkeydown: (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open()) },
        h('div', { class: 'pcard-info' }, h('h4', null, p.name), h('p', { class: 'pdesc' }, p.desc), h('div', { class: 'pcard-foot' }, h('span', { class: 'price' }, H.money(p.price)), p.available ? UI.tags(p) : h('span', { class: 'tag tag-out' }, 'Agotado'))),
        h(
          'div',
          { class: 'pcard-media' },
          UI.thumb(p, 96),
          p.available ? h('button', { class: 'add-fab', type: 'button', 'aria-label': 'Agregar ' + p.name, onclick: async (e) => { e.stopPropagation(); cart = await api.addToCart({ productId: p.id, qty: 1 }); UI.toast(p.name + ' agregado'); renderBar(); } }, UI.icon('plus', 18)) : null
        )
      );
    }

    function renderList() {
      H.clear(listEl);
      const q = st.q.trim().toLowerCase();
      let any = false;
      cats.forEach((c) => {
        if (st.cat !== 'all' && st.cat !== c.id) return;
        const items = products.filter((p) => p.cat === c.id && (!q || (p.name + ' ' + p.desc).toLowerCase().indexOf(q) !== -1));
        if (!items.length) return;
        any = true;
        listEl.appendChild(h('section', { class: 'menu-section' }, h('h3', { class: 'section-title' }, c.emoji + ' ' + c.name), h('div', { class: 'pgrid' }, items.map(card))));
      });
      if (!any) listEl.appendChild(UI.empty('🔍', 'Sin resultados', 'Probá con otra palabra o categoría.'));
    }

    function renderBar() {
      H.clear(barEl);
      if (!cart.count) return;
      barEl.appendChild(
        h('button', { class: 'cartbar', type: 'button', onclick: () => g.App.go('cart') }, h('span', { class: 'cartbar-count' }, cart.count), h('span', { class: 'cartbar-label' }, 'Ver mi pedido'), h('span', { class: 'cartbar-total' }, H.money(cart.subtotal)))
      );
    }

    function openProduct(p) {
      let qty = 1;
      const noteInput = h('textarea', { rows: '2', placeholder: 'Ej.: sin cebolla, bien cocido…', maxlength: '120' });
      const qtyBox = h('div');
      const addBtn = h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button' });
      const refresh = () => {
        H.clear(qtyBox).appendChild(UI.stepper(qty, (n) => { qty = H.clamp(n, 1, 20); refresh(); }));
        addBtn.textContent = 'Agregar · ' + H.money(p.price * qty);
      };
      const m = UI.modal({
        parent: deviceEl(),
        class: 'sheet',
        noFocus: true,
        body: h(
          'div',
          { class: 'psheet' },
          UI.photo(p, h('div', { class: 'psheet-hero' }, h('span', null, p.emoji), h('button', { class: 'icon-btn sheet-close', type: 'button', 'aria-label': 'Cerrar', onclick: () => m.close() }, UI.icon('close', 18)))),
          h('div', { class: 'psheet-body' }, h('div', { class: 'psheet-tags' }, UI.tags(p)), h('h3', null, p.name), h('p', { class: 'muted' }, p.desc), h('div', { class: 'psheet-price' }, H.money(p.price)), UI.field('Aclaraciones para la cocina', noteInput), h('div', { class: 'psheet-actions' }, qtyBox, addBtn))
        ),
      });
      addBtn.addEventListener('click', async () => {
        cart = await api.addToCart({ productId: p.id, qty: qty, note: noteInput.value });
        m.close();
        UI.toast(qty + '× ' + p.name + ' agregado');
        renderBar();
      });
      refresh();
    }

    const search = h('input', { type: 'search', placeholder: 'Buscar en la carta…', 'aria-label': 'Buscar en la carta', oninput: (e) => { st.q = e.target.value; renderList(); } });

    renderChips();
    renderList();
    renderBar();
    return h(
      'div',
      { class: 'menu' },
      h(
        'header',
        { class: 'hero' },
        h('div', { class: 'hero-top' }, h('span', { class: 'table-pill table-pill-sm' }, UI.icon('pin', 14), 'Mesa ' + table)),
        h('div', { class: 'hero-main' }, UI.brandLogo(s, 64), h('div', null, h('h1', null, s.name), h('p', null, s.tagline))),
        h('div', { class: 'hero-info' }, h('span', null, UI.icon('clock', 14), s.hours), h('span', null, UI.icon('pin', 14), s.address))
      ),
      h('div', { class: 'searchbar' }, UI.icon('search', 18), search),
      h('div', { class: 'chips-wrap' }, chipsEl),
      listEl,
      barEl
    );
  };

  // ------------------------------------------------------------------ Carrito
  Screens.cart = async function () {
    const root = h('div', { class: 'page' });
    async function render() {
      const cart = await api.getCart();
      H.clear(root);
      root.append(topbar('Mi pedido', 'menu'));
      if (!cart.lines.length) {
        root.append(UI.empty('🛒', 'Tu pedido está vacío', 'Agregá platos desde la carta para armar tu pedido.', h('button', { class: 'btn btn-primary', type: 'button', onclick: () => g.App.go('menu') }, 'Ver la carta')));
        return;
      }
      root.append(
        h(
          'div',
          { class: 'page-body' },
          h(
            'div',
            { class: 'card cart-lines' },
            cart.lines.map((l) =>
              h(
                'div',
                { class: 'cline' },
                UI.thumb(l.product, 56),
                h('div', { class: 'cline-info' }, h('h4', null, l.product.name), l.note ? h('p', { class: 'muted small' }, '“' + l.note + '”') : null, h('span', { class: 'price' }, H.money(l.total))),
                UI.stepper(l.qty, async (n) => { await api.setCartQty(l.lineId, n); render(); }, 0)
              )
            )
          ),
          h('button', { class: 'btn btn-ghost btn-block', type: 'button', onclick: () => g.App.go('menu') }, UI.icon('plus', 16), 'Agregar más platos'),
          h('div', { class: 'card summary' }, h('div', { class: 'srow' }, h('span', null, 'Subtotal (' + H.plural(cart.count, 'ítem', 'ítems') + ')'), h('b', null, H.money(cart.subtotal))), h('p', { class: 'muted small' }, 'La propina es opcional y se elige en el siguiente paso.'))
        ),
        h('div', { class: 'sticky-foot' }, h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => g.App.go('checkout') }, 'Continuar · ' + H.money(cart.subtotal)))
      );
    }
    await render();
    return root;
  };

  // ------------------------------------------------------------------ Checkout
  Screens.checkout = async function () {
    const [cart, table] = await Promise.all([api.getCart(), api.getTable()]);
    const root = h('div', { class: 'page' });
    root.append(topbar('Finalizar pedido', 'cart'));
    if (!cart.lines.length) {
      root.append(UI.empty('🧾', 'No hay nada para confirmar', 'Armá tu pedido desde la carta primero.', h('button', { class: 'btn btn-primary', type: 'button', onclick: () => g.App.go('menu') }, 'Ver la carta')));
      return root;
    }
    const f = Object.assign({}, g.Demo.sampleCheckout, { table: table });
    const nameIn = h('input', { type: 'text', value: f.customer, placeholder: 'Tu nombre', autocomplete: 'name', oninput: (e) => (f.customer = e.target.value) });
    const phoneIn = h('input', { type: 'tel', value: f.phone, placeholder: '+595 9xx xxx xxx', autocomplete: 'tel', oninput: (e) => (f.phone = e.target.value) });
    const notesIn = h('textarea', { rows: '2', placeholder: 'Algo que quieras aclararnos…', oninput: (e) => (f.notes = e.target.value) });
    const typeEl = h('div', { class: 'segmented' });
    const payEl = h('div', { class: 'pay-grid' });
    const tipEl = h('div', { class: 'chips chips-wrap-inline' });
    const sumEl = h('div', { class: 'card summary' });
    const confirmBtn = h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button' });
    const err = h('p', { class: 'form-error', role: 'alert' });

    const PAY = [['efectivo', '💵', 'Efectivo'], ['tarjeta', '💳', 'Tarjeta'], ['transferencia', '🏦', 'Transferencia']];
    const total = () => cart.subtotal + Math.round((cart.subtotal * f.tipPct) / 100);

    function draw() {
      H.clear(typeEl);
      [['mesa', '🪑 En mi mesa (Mesa ' + table + ')'], ['retiro', '🛍️ Retiro en el local']].forEach((o) => typeEl.appendChild(h('button', { type: 'button', class: f.type === o[0] ? 'active' : '', onclick: () => { f.type = o[0]; draw(); } }, o[1])));
      H.clear(payEl);
      PAY.forEach((p) => payEl.appendChild(h('button', { type: 'button', class: 'pay-opt' + (f.payment === p[0] ? ' active' : ''), onclick: () => { f.payment = p[0]; draw(); } }, h('span', { class: 'pay-emoji' }, p[1]), p[2])));
      H.clear(tipEl);
      [0, 5, 10].forEach((t) => tipEl.appendChild(h('button', { type: 'button', class: 'chip' + (f.tipPct === t ? ' active' : ''), onclick: () => { f.tipPct = t; draw(); } }, t ? t + '%' : 'Sin propina')));
      const tip = total() - cart.subtotal;
      H.clear(sumEl).append(
        h('div', { class: 'srow' }, h('span', null, 'Subtotal'), h('span', null, H.money(cart.subtotal))),
        h('div', { class: 'srow' }, h('span', null, 'Propina'), h('span', null, H.money(tip))),
        h('div', { class: 'srow total' }, h('span', null, 'Total'), h('b', null, H.money(total())))
      );
      confirmBtn.textContent = 'Confirmar pedido · ' + H.money(total());
    }

    confirmBtn.addEventListener('click', async () => {
      if (!f.customer.trim()) {
        err.textContent = 'Decinos tu nombre para avisarte cuando esté listo.';
        nameIn.focus();
        return;
      }
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Enviando pedido…';
      await H.sleep(700);
      await api.createOrder({ customer: f.customer.trim(), phone: f.phone, type: f.type, table: table, payment: f.payment, tipPct: f.tipPct, notes: f.notes });
      g.App.go('confirm');
    });

    draw();
    root.append(
      h(
        'div',
        { class: 'page-body' },
        h('section', { class: 'card form-sec' }, h('h3', null, '¿Cómo lo recibís?'), typeEl),
        h('section', { class: 'card form-sec' }, h('h3', null, 'Tus datos'), UI.field('Nombre', nameIn), UI.field('Teléfono (opcional)', phoneIn)),
        h('section', { class: 'card form-sec' }, h('h3', null, 'Forma de pago'), payEl, h('p', { class: 'muted small' }, 'El pago se realiza en el local. Demo: no se procesan cobros reales.')),
        h('section', { class: 'card form-sec' }, h('h3', null, 'Propina'), tipEl),
        h('section', { class: 'card form-sec' }, h('h3', null, 'Comentarios'), notesIn),
        sumEl,
        err
      ),
      h('div', { class: 'sticky-foot' }, confirmBtn)
    );
    return root;
  };

  // ------------------------------------------------------------------ Confirmación
  Screens.confirm = async function () {
    const order = await g.Demo.ensureOrder();
    const root = h('div', { class: 'page confirm' });
    const steps = [['new', 'Recibido', '📥'], ['preparing', 'Preparando', '👨‍🍳'], ['ready', 'Listo', '🛎️'], ['delivered', 'Entregado', '✅']];
    const tl = h('ol', { class: 'timeline' });
    let status = order.status;
    const drawTl = () => {
      const idx = g.Data.statusFlow.indexOf(status);
      H.clear(tl);
      steps.forEach((s, i) => tl.appendChild(h('li', { class: i < idx ? 'done' : i === idx ? 'current' : '' }, h('span', { class: 'dot' }, i <= idx ? s[2] : ''), h('span', { class: 'tl-label' }, s[1]))));
    };
    drawTl();

    // Simula el avance del pedido mientras el cliente mira la pantalla.
    [['preparing', 5000], ['ready', 14000]].forEach((st) => {
      if (g.Data.statusFlow.indexOf(status) >= g.Data.statusFlow.indexOf(st[0])) return;
      const t = setTimeout(async () => {
        await api.updateOrderStatus(order.id, st[0]);
        status = st[0];
        drawTl();
      }, st[1]);
      g.App.onLeave(() => clearTimeout(t));
    });

    root.append(
      h(
        'div',
        { class: 'page-body confirm-body' },
        h('div', { class: 'confirm-hero' }, h('div', { class: 'check-burst' }, UI.icon('check', 40)), h('h2', null, '¡Pedido recibido!'), h('p', { class: 'muted' }, order.customer.split(' ')[0] + ', ya estamos preparando tu pedido.'), h('div', { class: 'order-no' }, 'Pedido #' + order.id), h('p', { class: 'eta' }, UI.icon('clock', 14), order.type === 'mesa' ? 'Mesa ' + order.table + ' · llega en ~20 min' : 'Retiro en el local · listo en ~20 min')),
        h('div', { class: 'card' }, tl),
        h(
          'div',
          { class: 'card summary' },
          h('h3', null, 'Tu pedido'),
          order.lines.map((l) => h('div', { class: 'srow' }, h('span', null, l.qty + '× ' + l.name), h('span', null, H.money(l.price * l.qty)))),
          order.tip ? h('div', { class: 'srow' }, h('span', null, 'Propina'), h('span', null, H.money(order.tip))) : null,
          h('div', { class: 'srow total' }, h('span', null, 'Total · ' + order.payment), h('b', null, H.money(order.total)))
        ),
        h('div', { class: 'confirm-actions' }, h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => g.App.go('menu') }, 'Pedir algo más'), h('button', { class: 'btn btn-ghost btn-block', type: 'button', onclick: () => g.App.go('admin/orders') }, 'Ver en el panel del negocio →'))
      )
    );
    return root;
  };
})(window);
