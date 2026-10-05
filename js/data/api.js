/*
 * Capa de acceso a datos. Es lo ÚNICO que habla con el almacenamiento (localStorage en la demo).
 * Todas las funciones devuelven Promesas: para un backend real basta con reemplazar el cuerpo de
 * cada función por un fetch(); las pantallas no se tocan.
 */
(function (g) {
  const Data = (g.Data = g.Data || {});
  const store = g.Helpers.storage;
  const PREFIX = 'cartaqr:v1:';

  const load = (key, fallback) => store.get(PREFIX + key, fallback);
  const save = (key, value) => store.set(PREFIX + key, value);

  function seedAll() {
    const s = Data.buildSeed();
    save('settings', s.settings);
    save('categories', s.categories);
    save('products', s.products);
    save('orders', s.orders);
    save('orderSeq', s.orderSeq);
    save('cart', []);
    save('table', 7);
    store.remove(PREFIX + 'lastOrder');
    save('seeded', true);
  }
  if (!load('seeded', false)) seedAll();

  const wrap = (fn) => (...args) => new Promise((resolve, reject) => {
    try {
      resolve(fn(...args));
    } catch (e) {
      reject(e);
    }
  });

  function productsMap() {
    const m = {};
    load('products', []).forEach((p) => (m[p.id] = p));
    return m;
  }

  function cartSummary() {
    const map = productsMap();
    const lines = load('cart', [])
      .filter((l) => map[l.productId])
      .map((l) => ({ lineId: l.lineId, product: map[l.productId], qty: l.qty, note: l.note || '', total: map[l.productId].price * l.qty }));
    return {
      lines: lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.total, 0),
    };
  }

  const api = {
    // ---- Negocio
    getSettings: wrap(() => Object.assign({}, load('settings', {}))),
    saveSettings: wrap((patch) => {
      const next = Object.assign({}, load('settings', {}), patch);
      save('settings', next);
      return next;
    }),

    // ---- Carta
    getCategories: wrap(() => load('categories', [])),
    getProducts: wrap(() => load('products', [])),
    getProduct: wrap((id) => productsMap()[id] || null),
    saveProduct: wrap((p) => {
      const list = load('products', []);
      const idx = list.findIndex((x) => x.id === p.id);
      if (idx >= 0) list[idx] = Object.assign({}, list[idx], p);
      else list.push(Object.assign({ id: g.Helpers.uid('p'), tags: [], available: true }, p));
      save('products', list);
      return true;
    }),
    deleteProduct: wrap((id) => {
      save('products', load('products', []).filter((p) => p.id !== id));
      return true;
    }),
    setAvailability: wrap((id, available) => {
      save('products', load('products', []).map((p) => (p.id === id ? Object.assign({}, p, { available: !!available }) : p)));
      return true;
    }),

    // ---- Carrito (sesión del cliente)
    getCart: wrap(cartSummary),
    addToCart: wrap((item) => {
      const cart = load('cart', []);
      const note = (item.note || '').trim();
      const same = cart.find((l) => l.productId === item.productId && (l.note || '') === note);
      if (same) same.qty += item.qty || 1;
      else cart.push({ lineId: g.Helpers.uid('l'), productId: item.productId, qty: item.qty || 1, note: note });
      save('cart', cart);
      return cartSummary();
    }),
    setCartQty: wrap((lineId, qty) => {
      const cart = load('cart', [])
        .map((l) => (l.lineId === lineId ? Object.assign({}, l, { qty: qty }) : l))
        .filter((l) => l.qty > 0);
      save('cart', cart);
      return cartSummary();
    }),
    clearCart: wrap(() => {
      save('cart', []);
      return cartSummary();
    }),
    getTable: wrap(() => load('table', 7)),
    setTable: wrap((n) => save('table', n)),

    // ---- Pedidos
    getOrders: wrap(() => load('orders', []).slice().sort((a, b) => b.createdAt - a.createdAt)),
    getOrder: wrap((id) => load('orders', []).find((o) => o.id === id) || null),
    getLastOrder: wrap(() => {
      const id = load('lastOrder', null);
      return id ? load('orders', []).find((o) => o.id === id) || null : null;
    }),
    createOrder: wrap((payload) => {
      const cart = cartSummary();
      if (!cart.lines.length) throw new Error('El carrito está vacío');
      const seq = load('orderSeq', 1000) + 1;
      const tip = Math.round((cart.subtotal * (payload.tipPct || 0)) / 100);
      const order = {
        id: seq,
        createdAt: Date.now(),
        status: 'new',
        customer: payload.customer,
        phone: payload.phone || '',
        type: payload.type,
        table: payload.type === 'mesa' ? payload.table : null,
        payment: payload.payment,
        notes: payload.notes || '',
        lines: cart.lines.map((l) => ({ productId: l.product.id, name: l.product.name, emoji: l.product.emoji, price: l.product.price, qty: l.qty, note: l.note })),
        subtotal: cart.subtotal,
        tip: tip,
        total: cart.subtotal + tip,
      };
      const orders = load('orders', []);
      orders.push(order);
      save('orders', orders);
      save('orderSeq', seq);
      save('cart', []);
      save('lastOrder', seq);
      return order;
    }),
    updateOrderStatus: wrap((id, status) => {
      save('orders', load('orders', []).map((o) => (o.id === id ? Object.assign({}, o, { status: status }) : o)));
      return true;
    }),

    // ---- Estadísticas del panel
    getStats: wrap(() => {
      const orders = load('orders', []);
      const H = g.Helpers;
      const t0 = H.startOfDay(Date.now());
      const sum = (arr) => arr.reduce((s, o) => s + o.total, 0);
      const inDay = (offset) => orders.filter((o) => H.startOfDay(o.createdAt) === t0 - offset * 86400000);
      const today = inDay(0);
      const yesterday = inDay(1);
      const days = [];
      for (let d = 6; d >= 0; d--) {
        const list = inDay(d);
        days.push({ ts: t0 - d * 86400000, label: d === 0 ? 'Hoy' : H.dayShort(t0 - d * 86400000), sales: sum(list), orders: list.length });
      }
      const agg = {};
      orders
        .filter((o) => o.createdAt >= t0 - 6 * 86400000)
        .forEach((o) =>
          o.lines.forEach((l) => {
            const a = (agg[l.productId] = agg[l.productId] || { name: l.name, emoji: l.emoji, qty: 0, revenue: 0 });
            a.qty += l.qty;
            a.revenue += l.price * l.qty;
          })
        );
      return {
        today: { sales: sum(today), orders: today.length, avg: today.length ? Math.round(sum(today) / today.length) : 0, active: orders.filter((o) => o.status !== 'delivered').length },
        yesterday: { sales: sum(yesterday), orders: yesterday.length, avg: yesterday.length ? Math.round(sum(yesterday) / yesterday.length) : 0 },
        days: days,
        top: Object.keys(agg).map((k) => agg[k]).sort((a, b) => b.qty - a.qty).slice(0, 5),
        recent: orders.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
      };
    }),

    // ---- Demo
    reset: wrap(() => {
      store.keys(PREFIX).forEach((k) => store.remove(k));
      seedAll();
      return true;
    }),
  };

  Data.api = api;
})(window);
