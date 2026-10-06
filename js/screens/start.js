/* Pantalla de inicio: elegir el tipo de local y empezar el recorrido o explorar libremente. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = g.UI;
  const api = g.Data.api;
  const Screens = (g.Screens = g.Screens || {});

  Screens.start = async function () {
    const [s, products] = await Promise.all([api.getSettings(), api.getProducts()]);
    const color = {};
    g.Data.palettes.forEach((p) => (color[p.key] = p.color));

    const kinds = g.Data.identityPresets.map((k) => {
      const active = k.name === s.name;
      return h(
        'button',
        { class: 'kind' + (active ? ' active' : ''), type: 'button', role: 'radio', 'aria-checked': active, onclick: () => g.App.updateSettings({ name: k.name, tagline: k.tagline, logoEmoji: k.logoEmoji, logoImage: null, palette: k.palette }) },
        h('span', { class: 'kind-emoji' }, k.logoEmoji),
        h('b', null, k.kind),
        h('span', { class: 'kind-dot', style: { background: color[k.palette] } })
      );
    });

    return h(
      'div',
      { class: 'start' },
      h('header', { class: 'start-hero' }, h('span', { class: 'tag tag-nuevo' }, 'Demo interactiva'), h('h1', null, 'Carta digital con QR para tu restaurante'), h('p', null, 'Tus clientes escanean, piden desde la mesa y vos recibís el pedido al instante. Mirá cómo funciona en 2 minutos.')),
      h('section', { class: 'start-pick' }, h('h2', null, '¿Qué tipo de local tenés?'), h('p', { class: 'muted' }, 'Elegí uno y mirá cómo se adapta nombre, logo y colores.'), h('div', { class: 'kinds', role: 'radiogroup', 'aria-label': 'Tipo de local' }, kinds)),
      h('section', { class: 'start-preview', 'aria-label': 'Vista previa' }, h('div', { class: 'start-preview-brand' }, UI.brandLogo(s, 60), h('div', null, h('small', null, 'Así se verá tu carta'), h('h3', null, s.name), h('p', null, s.tagline))), h('div', { class: 'start-preview-dishes' }, products.slice(0, 4).map((p) => UI.thumb(p, 64)))),
      h('div', { class: 'start-actions' }, h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: () => g.App.startTour() }, '▶ Ver el recorrido · 2 min'), h('button', { class: 'btn btn-ghost btn-lg', type: 'button', onclick: () => g.App.explore() }, 'Explorar por mi cuenta')),
      h('ul', { class: 'start-points' }, h('li', null, '📱 Sin descargar apps'), h('li', null, '⚡ Pedidos al instante'), h('li', null, '🎨 Con tu marca y tus platos'))
    );
  };
})(window);
