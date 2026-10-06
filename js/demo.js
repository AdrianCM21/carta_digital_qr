/* Herramientas de presentación: barra superior, panel de opciones, guía del recorrido y datos de ejemplo. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = g.UI;
  const api = g.Data.api;
  const Demo = (g.Demo = {});

  // ------------------------------------------------------------------ Datos de ejemplo
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

  // Pantallas sueltas (panel de Opciones). Carrito, checkout y confirmación se preparan solos.
  const SCREENS = [
    ['Cliente', [['qr', 'Escaneo del QR'], ['menu', 'Carta'], ['cart', 'Carrito'], ['checkout', 'Finalizar pedido'], ['confirm', 'Pedido confirmado']]],
    ['Negocio', [['admin', 'Resumen'], ['admin/orders', 'Pedidos del local'], ['admin/products', 'Mi carta'], ['admin/brand', 'Personalizar'], ['admin/qr', 'Códigos QR']]],
    ['Para vender', [['live', 'Vista en vivo'], ['value', 'Cuánto te deja']]],
  ];
  const TABS = [
    ['Cliente', 'qr', (p) => ['qr', 'menu', 'cart', 'checkout', 'confirm'].indexOf(p) !== -1],
    ['Negocio', 'admin', (p) => p.indexOf('admin') === 0],
    ['En vivo', 'live', (p) => p === 'live'],
    ['Valor', 'value', (p) => p === 'value'],
  ];

  async function prepare(route) {
    if (route === 'cart' || route === 'checkout') await Demo.ensureCart();
    if (route === 'confirm') await Demo.ensureOrder();
  }
  /** Salta a una pantalla suelta: sale del recorrido y pasa a modo libre. */
  async function jump(route) {
    await prepare(route);
    g.App.explore(route);
  }

  const ctaUrl = () => H.whatsappUrl((g.Config || {}).sellerWhatsapp, (g.Config || {}).ctaMessage);

  // ------------------------------------------------------------------ Barra superior
  let optsOpen = false;

  function renderBar() {
    const App = g.App;
    const bar = document.getElementById('demobar');
    const parts = [h('button', { class: 'db-brand', type: 'button', 'aria-label': 'Ir al inicio', onclick: () => App.go('start') }, h('span', { class: 'db-logo' }, '▣'), h('b', null, 'Carta digital QR'))];

    if (App.mode === 'tour') {
      parts.push(h('nav', { class: 'db-steps', 'aria-label': 'Pasos del recorrido' }, g.Tour.steps.map((st, i) => h('button', { type: 'button', class: 'db-step' + (i === App.step ? ' active' : i < App.step ? ' done' : ''), 'aria-label': 'Paso ' + (i + 1) + ': ' + st.title, 'aria-current': i === App.step ? 'step' : null, onclick: () => App.goStep(i) }, i + 1))));
    } else if (App.mode === 'free') {
      parts.push(h('nav', { class: 'db-tabs', 'aria-label': 'Secciones' }, TABS.map((t) => h('button', { type: 'button', class: 'db-tab' + (t[2](App.path) ? ' active' : ''), onclick: () => jump(t[1]) }, t[0]))), h('button', { type: 'button', class: 'db-tour', onclick: () => App.startTour() }, '▶ Recorrido'));
    }

    parts.push(h('span', { class: 'db-spacer' }), h('a', { class: 'db-cta', href: ctaUrl(), target: '_blank', rel: 'noopener', 'aria-label': 'Quiero mi carta' }, UI.icon('whatsapp', 16), h('span', null, 'Quiero mi carta')), h('button', { type: 'button', class: 'db-opts-btn', 'aria-expanded': String(optsOpen), 'aria-controls': 'opts', onclick: toggleOpts }, UI.icon('sliders', 16), h('span', null, 'Opciones')));
    H.clear(bar).append(...parts);
  }

  // ------------------------------------------------------------------ Guía del recorrido (barra inferior)
  function renderCoach() {
    const App = g.App;
    const coach = document.getElementById('coach');
    const on = App.mode === 'tour';
    document.body.classList.toggle('has-coach', on);
    coach.hidden = !on;
    if (!on) return;
    const steps = g.Tour.steps;
    const st = steps[App.step];
    const last = App.step === steps.length - 1;
    H.clear(coach).append(
      h('div', { class: 'coach-info' }, h('div', { class: 'coach-meta' }, h('span', { class: 'coach-who' }, g.Tour.who[st.who]), h('span', null, 'Paso ' + (App.step + 1) + ' de ' + steps.length)), h('b', null, st.title), h('p', null, st.text)),
      h(
        'div',
        { class: 'coach-actions' },
        h('button', { class: 'coach-link', type: 'button', onclick: () => App.explore(st.route) }, 'Explorar libre'),
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => (App.step ? App.goStep(App.step - 1) : App.go('start')) }, '← Atrás'),
        last ? h('a', { class: 'btn btn-wa btn-sm', href: ctaUrl(), target: '_blank', rel: 'noopener' }, UI.icon('whatsapp', 16), 'Quiero mi carta') : h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: () => App.goStep(App.step + 1) }, 'Siguiente →')
      )
    );
  }

  // ------------------------------------------------------------------ Panel de opciones
  function toggleOpts() {
    optsOpen = !optsOpen;
    renderOpts();
    renderBar();
  }
  function closeOpts() {
    if (!optsOpen) return;
    optsOpen = false;
    renderOpts();
    renderBar();
  }

  function renderOpts() {
    const App = g.App;
    const panel = document.getElementById('opts');
    panel.hidden = !optsOpen;
    if (!optsOpen) return H.clear(panel);
    const s = App.settings;
    const sec = (title, body) => h('section', { class: 'opts-sec' }, h('h4', null, title), body);

    const kinds = g.Data.identityPresets.map((k) => h('button', { type: 'button', class: 'chip' + (k.name === s.name ? ' active' : ''), onclick: () => App.updateSettings({ name: k.name, tagline: k.tagline, logoEmoji: k.logoEmoji, logoImage: null, palette: k.palette }) }, k.logoEmoji + ' ' + k.kind));
    const pals = g.Data.palettes.map((p) => h('button', { type: 'button', class: 'swatch' + (s.palette === p.key ? ' active' : ''), 'aria-pressed': String(s.palette === p.key), onclick: () => App.updateSettings({ palette: p.key }) }, h('span', { class: 'swatch-dot', style: { background: p.color } }), p.label));
    const curs = Object.keys(H.currencies).map((c) => h('button', { type: 'button', class: 'chip' + (s.currency === c ? ' active' : ''), onclick: () => App.updateSettings({ currency: c }) }, H.currencies[c].symbol + ' ' + c));
    const views = h('div', { class: 'segmented' }, [['mobile', 'phone', 'Móvil'], ['desktop', 'desktop', 'PC']].map((v) => h('button', { type: 'button', class: App.view === v[0] ? 'active' : '', onclick: () => { App.setView(v[0]); renderOpts(); } }, UI.icon(v[1], 16), ' ' + v[2])));
    const screens = SCREENS.map((grp) => h('div', { class: 'opts-screens' }, h('small', null, grp[0]), h('div', null, grp[1].map((r) => h('button', { type: 'button', class: 'chip', onclick: () => { closeOpts(); jump(r[0]); } }, r[1])))));

    H.clear(panel).append(
      h('div', { class: 'opts-head' }, h('b', null, 'Opciones de la demo'), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Cerrar opciones', onclick: closeOpts }, UI.icon('close', 18))),
      sec('Tipo de local', h('div', { class: 'chips chips-wrap-inline' }, kinds)),
      sec('Paleta de colores', h('div', { class: 'palette-grid' }, pals)),
      sec('Moneda', h('div', { class: 'chips chips-wrap-inline' }, curs)),
      sec('Vista', views),
      sec('Ir a una pantalla', h('div', null, screens)),
      h('button', { class: 'btn btn-ghost btn-block', type: 'button', onclick: async () => {
        await api.reset();
        closeOpts();
        await App.applySettings(await api.getSettings(), false);
        UI.toast('Demo reiniciada');
        App.go('start');
      } }, UI.icon('refresh', 16), 'Reiniciar demo')
    );
  }

  // ------------------------------------------------------------------ API pública
  Demo.refresh = function () {
    if (g.App.embed || !g.App.settings) return;
    renderBar();
    renderCoach();
    if (optsOpen) renderOpts();
  };

  Demo.init = function () {
    // Cerrar opciones al hacer clic afuera o con Escape; flechas para avanzar/retroceder el recorrido.
    document.addEventListener('mousedown', (e) => {
      if (optsOpen && !e.target.closest('#opts') && !e.target.closest('.db-opts-btn')) closeOpts();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') return closeOpts();
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName) || (e.target && e.target.isContentEditable);
      if (typing || e.altKey || e.ctrlKey || e.metaKey || g.App.mode !== 'tour' || document.querySelector('.overlay')) return;
      if (e.key === 'ArrowRight') g.App.goStep(g.App.step + 1);
      if (e.key === 'ArrowLeft' && g.App.step > 0) g.App.goStep(g.App.step - 1);
    });
  };
})(window);
