/* Router, modos de la demo (inicio / recorrido / explorar), tema y arranque. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const api = g.Data.api;
  const S = g.Screens;
  const UI_KEY = 'cartaqr:ui';

  const ROUTES = {
    start: { layout: 'start', fn: S.start },
    qr: { layout: 'customer', fn: S.qr },
    menu: { layout: 'customer', fn: S.menu },
    cart: { layout: 'customer', fn: S.cart },
    checkout: { layout: 'customer', fn: S.checkout },
    confirm: { layout: 'customer', fn: S.confirm },
    live: { layout: 'live', fn: S.live },
    value: { layout: 'pitch', fn: S.value },
    admin: { layout: 'admin', fn: S.adminDashboard },
    'admin/products': { layout: 'admin', fn: S.adminProducts },
    'admin/orders': { layout: 'admin', fn: S.adminOrders },
    'admin/brand': { layout: 'admin', fn: S.adminBrand },
    'admin/qr': { layout: 'admin', fn: S.adminQR },
  };
  // Estas pantallas ocupan todo el escenario, sin marco de celular/escritorio.
  const BARE = { live: true, start: true };

  const App = (g.App = {
    settings: null,
    path: 'start',
    mode: 'start', // start | tour | free
    step: 0,
    view: 'mobile',
    _layout: null,
    _tok: 0,
    _leave: [],
    embed: new URLSearchParams(location.search).get('embed') === '1',

    go(route) {
      const target = '#/' + route;
      if (location.hash === target) return App.rerender();
      location.hash = target;
    },
    onLeave(fn) {
      App._leave.push(fn);
    },
    rerender() {
      return renderRoute();
    },
    setView(v) {
      App.view = v;
      document.getElementById('stage').dataset.view = v;
      g.Demo.refresh();
    },
    /** Aplica la configuración del negocio (tema, moneda, barra) y opcionalmente redibuja la pantalla. */
    async applySettings(s, rerender) {
      App.settings = s;
      applyTheme();
      g.Demo.refresh();
      // En la vista en vivo los iframes se actualizan solos (evento storage); no hay que recargarlos.
      if (rerender && App.path !== 'live') await renderRoute();
    },
    async updateSettings(patch) {
      await App.applySettings(await api.saveSettings(patch), true);
    },

    // ---- Recorrido guiado
    startTour() {
      return App.goStep(0);
    },
    async goStep(i) {
      const steps = g.Tour.steps;
      App.step = H.clamp(i, 0, steps.length - 1);
      App.mode = 'tour';
      saveUi();
      const st = steps[App.step];
      if (st.prep) await st.prep();
      g.Demo.refresh();
      App.go(st.route);
    },
    /** Modo libre: se navega por todas las pantallas sin guía. */
    explore(route) {
      App.mode = 'free';
      saveUi();
      g.Demo.refresh();
      App.go(route || 'qr');
    },
  });

  function saveUi() {
    H.storage.set(UI_KEY, { mode: App.mode === 'tour' ? 'tour' : 'free', step: App.step });
  }

  function applyTheme() {
    document.documentElement.dataset.palette = App.settings.palette;
    H.setCurrency(App.settings.currency);
    document.title = App.settings.name + ' · Carta digital';
  }

  function parseHash() {
    const raw = (location.hash || '').replace(/^#\/?/, '');
    const parts = raw.split('?');
    return { path: ROUTES[parts[0]] ? parts[0] : 'start', query: Object.fromEntries(new URLSearchParams(parts[1] || '')) };
  }

  function scroller() {
    return document.querySelector('.admin-main') || document.querySelector('.screen') || document.getElementById('stage');
  }

  async function renderRoute() {
    const token = ++App._tok;
    const { path, query } = parseHash();
    const def = ROUTES[path];
    const samePage = path === App.path;
    const scrollTop = samePage && scroller() ? scroller().scrollTop : 0;

    App._leave.splice(0).forEach((fn) => fn());
    let node;
    try {
      node = await def.fn({ path: path, query: query, settings: App.settings });
    } catch (e) {
      console.error(e);
      node = g.UI.empty('⚠️', 'Algo salió mal', e.message || 'Error inesperado');
    }
    if (token !== App._tok) return;

    if (path === 'start') App.mode = 'start';
    else if (App.mode === 'start') App.mode = 'free';

    // Al cambiar de tipo de pantalla se ajusta la vista (celular para la carta, PC para el resto).
    if (App._layout !== def.layout) {
      App._layout = def.layout;
      App.view = def.layout === 'customer' ? 'mobile' : 'desktop';
    }
    App.path = path;
    const stage = document.getElementById('stage');
    stage.dataset.view = App.view;
    stage.dataset.layout = def.layout;
    const content = def.layout === 'admin' ? S.adminShell(path, node, App.settings) : node;
    H.clear(stage).appendChild(BARE[def.layout] ? node : h('div', { class: 'device' }, h('div', { class: 'screen screen-' + def.layout + ' enter' }, content)));
    if (scrollTop && scroller()) scroller().scrollTop = scrollTop;
    g.Demo.refresh();
  }

  async function init() {
    App.settings = await api.getSettings();
    applyTheme();
    if (App.embed) {
      document.documentElement.classList.add('embed');
      // Si el presentador cambia paleta/moneda/negocio en la ventana principal, este iframe lo refleja.
      api.onExternalChange('settings', async () => App.applySettings(await api.getSettings(), true));
    } else {
      const ui = H.storage.get(UI_KEY, {});
      App.mode = ui.mode === 'tour' ? 'tour' : 'free';
      App.step = H.clamp(ui.step || 0, 0, g.Tour.steps.length - 1);
      g.Demo.init();
    }
    g.addEventListener('hashchange', renderRoute);
    if (!location.hash || location.hash === '#/') location.hash = '#/start';
    else renderRoute();
  }

  init();
})(window);
