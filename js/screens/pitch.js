/* Pantalla "Valor": calculadora de ahorro editable y pruebas en vivo para presentar el beneficio en plata. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = g.UI;
  const api = g.Data.api;
  const Screens = (g.Screens = g.Screens || {});
  const KEY = 'cartaqr:pitch';

  /** Anima un número de 0 al valor final (formatea con `fmt`). */
  function countUp(el, to, fmt) {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 600);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1 && el.isConnected) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  Screens.value = async function () {
    const C = g.Config || {};
    const monthly = C.monthlyPrice || 0;
    const setup = C.setupPrice || 0;
    const s = Object.assign({ cards: 40, cardCost: 15000, reprints: 4, orders: 600, ticket: 80000, uplift: 3 }, H.storage.get(KEY, {}));
    const [products, orders] = await Promise.all([api.getProducts(), api.getOrders()]);

    // ---- Calculadora
    const totalEl = h('b', { class: 'calc-total' });
    const rowsEl = h('div', { class: 'calc-rows' });
    const noteEl = h('p', { class: 'muted small' });
    let lastTotal = -1;

    function update() {
      const print = s.cards * s.cardCost * s.reprints;
      const sales = Math.round((s.orders * 12 * s.ticket * s.uplift) / 100);
      const benefit = print + sales;
      const service = monthly * 12;
      const net = benefit - service;
      if (benefit !== lastTotal) countUp(totalEl, benefit, (n) => H.money(n));
      lastTotal = benefit;
      const row = (label, val, cls) => h('div', { class: 'srow ' + (cls || '') }, h('span', null, label), h('b', null, val));
      H.clear(rowsEl).append(
        row('Ahorro en impresión de cartas', H.money(print)),
        row('Ventas extra (fotos y sugerencias)', H.money(sales)),
        ...(monthly ? [row('Costo del servicio (12 meses)', '− ' + H.money(service)), row('Resultado neto por año', H.money(net), 'total')] : [])
      );
      const perMonth = benefit / 12 - monthly;
      noteEl.textContent = setup && perMonth > 0 ? 'Se paga en ~' + Math.max(1, Math.ceil(setup / perMonth)) + ' mes(es) contando la implementación.' : 'Estimación con tus propios números: ajustá los valores a tu local.';
      H.storage.set(KEY, s);
    }

    const num = (label, key, o) => {
      const money = o && o.money;
      return UI.field(label, h('input', { type: 'number', min: '0', step: o && o.step ? o.step : '1', value: money ? H.fromBase(s[key]) : s[key], oninput: (e) => {
        const v = Math.max(0, parseFloat(e.target.value) || 0);
        s[key] = money ? H.toBase(v) : v;
        update();
      } }));
    };
    const upliftOut = h('b', null, s.uplift + '%');
    const slider = h('input', { type: 'range', min: '0', max: '15', step: '1', value: s.uplift, 'aria-label': 'Aumento de ventas', oninput: (e) => { s.uplift = +e.target.value; upliftOut.textContent = s.uplift + '%'; update(); } });

    const calc = h(
      'section',
      { class: 'card form-sec calc' },
      h('h3', null, 'Calculá cuánto te deja'),
      h('div', { class: 'two' }, num('Cartas de papel impresas', 'cards'), num('Costo por carta', 'cardCost', { money: true, step: H.getCurrency() === 'PYG' ? '500' : '0.1' })),
      h('div', { class: 'two' }, num('Reimpresiones por año', 'reprints'), num('Pedidos por mes', 'orders')),
      num('Ticket promedio', 'ticket', { money: true, step: H.getCurrency() === 'PYG' ? '1000' : '0.5' }),
      h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Aumento de ventas por fotos y sugerencias: ', upliftOut), slider, h('span', { class: 'field-hint' }, 'Conservador: 2–5 %. Las cartas con fotos y destacados suelen vender más.')),
      h('div', { class: 'calc-result' }, h('span', { class: 'muted' }, 'Beneficio estimado por año'), totalEl, rowsEl, noteEl)
    );

    // ---- Pruebas en vivo
    const surubi = products.find((p) => p.id === 'surubi');
    const milanesa = products.find((p) => p.id === 'milanesa');
    const priceEl = h('b', { class: 'price' });
    const drawPrice = () => (priceEl.textContent = H.money(milanesa.price));
    const adjust = async (f) => {
      milanesa.price = Math.max(1000, Math.round((milanesa.price * f) / 500) * 500);
      await api.saveProduct({ id: milanesa.id, price: milanesa.price });
      drawPrice();
      UI.toast('Precio actualizado en la carta');
    };
    const ordersEl = h('b', { class: 'big-num' }, '0');
    countUp(ordersEl, orders.length, String);

    const tries = h(
      'div',
      { class: 'pitch-tries' },
      surubi ? h('div', { class: 'card try' }, h('div', null, h('b', null, 'Agotá un plato en 1 clic'), h('p', { class: 'muted small' }, surubi.name + ': se oculta de la carta al instante. Sin avisar mesa por mesa.')), h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: surubi.available, 'aria-label': 'Disponible: ' + surubi.name, onchange: async (e) => { await api.setAvailability(surubi.id, e.target.checked); UI.toast(surubi.name + (e.target.checked ? ' disponible' : ' agotado en la carta')); } }), h('span', { class: 'slider' }))) : null,
      milanesa ? h('div', { class: 'card try' }, h('div', null, h('b', null, 'Cambiá un precio al instante'), h('p', { class: 'muted small' }, milanesa.name + ': ', priceEl, '. Sin reimprimir nada.')), h('div', { class: 'btn-row' }, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => adjust(0.95) }, '−5 %'), h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: () => adjust(1.05) }, '+5 %'))) : null,
      h('div', { class: 'card try' }, h('div', null, h('b', null, 'Pedidos en esta demo'), h('p', { class: 'muted small' }, 'Tomados desde el celular del cliente, sin papel y sin errores de anotación.')), ordersEl)
    );
    drawPrice();

    const BENEFITS = [
      ['🖨️', 'Cero reimpresiones', 'Cambiás la carta cuando quieras. El QR de la mesa nunca cambia.'],
      ['⚡', 'Precios al instante', 'Inflación, promo del día o plato agotado: se actualiza en segundos.'],
      ['📸', 'Fotos que venden', 'Un plato con foto se pide más que uno solo en texto.'],
      ['🧾', 'Pedidos sin errores', 'El pedido llega ordenado a cocina, sin malentendidos.'],
      ['⏱️', 'Mesas que rotan más', 'El cliente pide sin esperar al mozo; vos servís más rápido.'],
      ['🌎', 'Para turistas', 'Una carta clara, con precios en su moneda.'],
    ];

    update();
    return h(
      'div',
      { class: 'pitch' },
      h('header', { class: 'pitch-hero' }, h('span', { class: 'tag tag-nuevo' }, 'Por qué conviene'), h('h1', null, 'Tu carta siempre al día. Sin imprimir.'), h('p', null, 'Menos gasto en papel, más ventas por plato y pedidos sin errores. Probalo con tus números.')),
      h('div', { class: 'pitch-grid' }, calc, tries),
      h('div', { class: 'benefits' }, BENEFITS.map((b) => h('div', { class: 'card benefit' }, h('span', { class: 'benefit-emoji' }, b[0]), h('b', null, b[1]), h('p', { class: 'muted small' }, b[2])))),
      UI.ctaCard()
    );
  };
})(window);
