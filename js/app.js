/* Router, tema y arranque de la app. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const api = g.Data.api;
  const S = g.Screens;

  const ROUTES = {
    qr: { layout: 'customer', fn: S.qr },
    menu: { layout: 'customer', fn: S.menu },
    cart: { layout: 'customer', fn: S.cart },
    checkout: { layout: 'customer', fn: S.checkout },
    confirm: { layout: 'customer', fn: S.confirm },
    admin: { layout: 'admin', fn: S.adminDashboard },
    'admin/products': { layout: 'admin', fn: S.adminProducts },
    'admin/orders': { layout: 'admin', fn: S.adminOrders },
    'admin/brand': { layout: 'admin', fn: S.adminBrand },
    'admin/qr': { layout: 'admin', fn: S.adminQR },
  };

  const App = (g.App = {
    settings: null,
    path: 'qr',
    view: 'mobile',
    _layout: null,
    _tok: 0,
    _leave: [],

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
      g.Demo.syncBar();
    },
    /** Aplica la configuración del negocio (tema, moneda, barra) y opcionalmente redibuja la pantalla. */
    async applySettings(s, rerender) {
      App.settings = s;
      applyTheme();
      g.Demo.syncBar();
      if (rerender) await renderRoute();
    },
    async updateSettings(patch) {
      await App.applySettings(await api.saveSettings(patch), true);
    },
  });

  function applyTheme() {
    document.documentElement.dataset.palette = App.settings.palette;
    H.setCurrency(App.settings.currency);
    document.title = App.settings.name + ' · Carta digital';
  }

  function parseHash() {
    const raw = (location.hash || '').replace(/^#\/?/, '');
    const parts = raw.split('?');
    return { path: ROUTES[parts[0]] ? parts[0] : 'qr', query: Object.fromEntries(new URLSearchParams(parts[1] || '')) };
  }

  function scroller() {
    return document.querySelector('.admin-main') || document.querySelector('.screen');
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

    // Al cambiar entre cliente y admin se ajusta la vista (celular para la carta, PC para el panel).
    if (App._layout !== def.layout) {
      App._layout = def.layout;
      App.view = def.layout === 'admin' ? 'desktop' : 'mobile';
    }
    App.path = path;
    const stage = document.getElementById('stage');
    stage.dataset.view = App.view;
    stage.dataset.layout = def.layout;
    const content = def.layout === 'admin' ? S.adminShell(path, node, App.settings) : node;
    H.clear(stage).appendChild(h('div', { class: 'device' }, h('div', { class: 'screen screen-' + def.layout + ' enter' }, content)));
    if (scrollTop && scroller()) scroller().scrollTop = scrollTop;
    g.Demo.syncBar();
  }

  async function init() {
    App.settings = await api.getSettings();
    applyTheme();
    g.Demo.renderBar(document.getElementById('demobar'));
    g.addEventListener('hashchange', renderRoute);
    if (!location.hash) location.hash = '#/qr';
    else renderRoute();
  }

  init();
})(window);
