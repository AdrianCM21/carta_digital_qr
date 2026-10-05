/* Vista en vivo: celular del cliente y panel del negocio lado a lado, compartiendo los mismos datos. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = g.UI;
  const Screens = (g.Screens = g.Screens || {});

  Screens.live = async function () {
    const base = location.href.split('#')[0].split('?')[0] + '?embed=1';
    const phone = h('iframe', { src: base + '#/menu', title: 'Carta del cliente' });
    const admin = h('iframe', { src: base + '#/admin/orders', title: 'Panel del negocio' });

    const prepare = h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: async () => {
      await g.Demo.ensureCart();
      phone.contentWindow.location.hash = '#/checkout';
    } }, UI.icon('bag', 16), 'Armar pedido de ejemplo');

    return h(
      'div',
      { class: 'live' },
      h('div', { class: 'live-hint' }, UI.icon('bolt', 18), h('span', null, h('b', null, 'Vista en vivo. '), 'Pedí desde el celular y mirá cómo llega al panel del negocio, con aviso sonoro.'), prepare),
      h('div', { class: 'live-phone' }, phone),
      h('div', { class: 'live-admin' }, admin)
    );
  };
})(window);
