/* Herramientas de presentación: barra de demo y datos de ejemplo para armar el recorrido solo. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = g.UI;
  const api = g.Data.api;
  const Demo = (g.Demo = {});

  Demo.sampleCheckout = { customer: 'Camila Benítez', phone: '+595 981 234 567', type: 'mesa', payment: 'tarjeta', tipPct: 10, notes: '' };
  const SAMPLE_CART = [['chipa', 1, ''], ['milanesa', 2, 'Una sin jamón, por favor'], ['limonada', 2, ''], ['flan', 1, '']];

  /** Si el carrito está vacío, lo llena con platos de ejemplo. */
  Demo.ensureCart = async function () {
    if ((await api.getCart()).lines.length) return;
    for (const item of SAMPLE_CART) await api.addToCart({ productId: item[0], qty: item[1], note: item[2] });
  };

  /** Devuelve el último pedido; si todavía no hay ninguno, crea uno de ejemplo. */
  Demo.ensureOrder = async function () {
    const last = await api.getLastOrder();
    if (last) return last;
    await Demo.ensureCart();
    return api.createOrder(Object.assign({}, Demo.sampleCheckout, { table: await api.getTable() }));
  };

  const SCREENS = {
    Cliente: [['qr', 'QR'], ['menu', 'Carta'], ['cart', 'Carrito'], ['checkout', 'Checkout'], ['confirm', 'Confirmación']],
    Admin: [['admin', 'Panel'], ['admin/products', 'Productos'], ['admin/orders', 'Pedidos'], ['admin/brand', 'Marca'], ['admin/qr', 'QR mesas']],
  };

  async function goTo(route) {
    if (route === 'cart' || route === 'checkout') await Demo.ensureCart();
    if (route === 'confirm') await Demo.ensureOrder();
    g.App.go(route);
  }

  Demo.renderBar = function (bar) {
    const App = g.App;
    const group = (label, children) => h('div', { class: 'db-group' }, h('span', { class: 'db-label' }, label), children);

    const screenBtns = (name) => group(name, SCREENS[name].map((s) => h('button', { type: 'button', class: 'db-btn', 'data-route': s[0], onclick: () => goTo(s[0]) }, s[1])));

    const palettes = group('Paleta', g.Data.palettes.map((p) => h('button', { type: 'button', class: 'db-dot', 'data-palette': p.key, title: p.label, 'aria-label': 'Paleta ' + p.label, style: { background: p.color }, onclick: () => App.updateSettings({ palette: p.key }) })));

    const business = h('select', { class: 'db-select', 'aria-label': 'Negocio de ejemplo', onchange: (e) => {
      const p = g.Data.identityPresets.find((x) => x.key === e.target.value);
      if (p) App.updateSettings({ name: p.name, tagline: p.tagline, logoEmoji: p.logoEmoji, logoImage: null, palette: p.palette });
      e.target.value = '';
    } }, [h('option', { value: '' }, 'Negocio…')].concat(g.Data.identityPresets.map((p) => h('option', { value: p.key }, p.logoEmoji + ' ' + p.name))));

    const currency = h('select', { class: 'db-select db-currency', 'aria-label': 'Moneda', onchange: (e) => App.updateSettings({ currency: e.target.value }) }, Object.keys(H.currencies).map((c) => h('option', { value: c }, H.currencies[c].symbol + ' ' + c)));

    const view = h('div', { class: 'db-seg', role: 'group', 'aria-label': 'Vista' }, [['mobile', 'phone', 'Móvil'], ['desktop', 'desktop', 'PC']].map((v) => h('button', { type: 'button', class: 'db-seg-btn', 'data-view': v[0], 'aria-label': 'Vista ' + v[2], title: v[2], onclick: () => App.setView(v[0]) }, UI.icon(v[1], 16), h('span', null, v[2]))));

    const reset = h('button', { type: 'button', class: 'db-reset', onclick: async () => {
      await api.reset();
      App.settings = await api.getSettings();
      App.applySettings(App.settings, false);
      UI.toast('Demo reiniciada');
      goTo('qr');
    } }, UI.icon('refresh', 16), 'Reiniciar demo');

    H.clear(bar).append(h('div', { class: 'db-brand' }, h('span', { class: 'db-logo' }, '▣'), h('b', null, 'Demo')), screenBtns('Cliente'), screenBtns('Admin'), palettes, group('Negocio', [business, currency]), group('Vista', view), reset);
    Demo.syncBar();
  };

  /** Refleja el estado actual (ruta, paleta, moneda, vista) en los controles de la barra. */
  Demo.syncBar = function () {
    const App = g.App;
    if (!App.settings) return;
    document.querySelectorAll('.db-btn').forEach((b) => b.classList.toggle('active', b.dataset.route === App.path));
    document.querySelectorAll('.db-dot').forEach((b) => b.classList.toggle('active', b.dataset.palette === App.settings.palette));
    document.querySelectorAll('.db-seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === App.view));
    const cur = document.querySelector('.db-currency');
    if (cur) cur.value = App.settings.currency;
  };
})(window);
