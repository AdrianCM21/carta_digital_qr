/* Datos de ejemplo creíbles. Precios en guaraníes (base). */
(function (g) {
  const Data = (g.Data = g.Data || {});

  Data.identityPresets = [
    { key: 'esquina', kind: 'Parrilla y pizzería', name: 'La Esquina de Mateo', tagline: 'Cocina casera · Parrilla · Pizzas', logoEmoji: '🔥', palette: 'brasa' },
    { key: 'verde', kind: 'Cocina saludable', name: 'Verde Bistró', tagline: 'Cocina fresca y de estación', logoEmoji: '🌿', palette: 'bosque' },
    { key: 'puerto', kind: 'Pescados y mariscos', name: 'Puerto Azul', tagline: 'Pescados, mariscos y tragos', logoEmoji: '⚓', palette: 'oceano' },
    { key: 'uva', kind: 'Café y pastelería', name: 'Maison Uva', tagline: 'Café de especialidad y pastelería', logoEmoji: '🍇', palette: 'uva' },
    { key: 'noche', kind: 'Bar de tapas', name: 'Noche Dorada', tagline: 'Bar · Tapas · Coctelería', logoEmoji: '🥂', palette: 'noche' },
  ];

  Data.palettes = [
    { key: 'brasa', label: 'Brasa', color: '#d4472b' },
    { key: 'bosque', label: 'Bosque', color: '#2f7d5b' },
    { key: 'oceano', label: 'Océano', color: '#1f6fb2' },
    { key: 'uva', label: 'Uva', color: '#7a4fd1' },
    { key: 'noche', label: 'Noche', color: '#e8b04b' },
  ];

  Data.statusLabels = { new: 'Nuevo', preparing: 'En preparación', ready: 'Listo', delivered: 'Entregado' };
  Data.statusFlow = ['new', 'preparing', 'ready', 'delivered'];

  const CATEGORIES = [
    { id: 'entradas', name: 'Entradas', emoji: '🥟' },
    { id: 'principales', name: 'Platos principales', emoji: '🥩' },
    { id: 'pizzas', name: 'Pizzas', emoji: '🍕' },
    { id: 'postres', name: 'Postres', emoji: '🍰' },
    { id: 'bebidas', name: 'Bebidas', emoji: '🍹' },
  ];

  // tags: popular | nuevo | picante | veggie
  const P = (id, cat, name, desc, price, emoji, tags) => ({ id, cat, name, desc, price, emoji, image: 'img/products/' + id + '.jpg', tags: tags || [], available: true });
  const PRODUCTS = [
    P('chipa', 'entradas', 'Chipa guasu', 'Clásico paraguayo de choclo, queso y cebolla, horneado en el momento.', 22000, '🌽', ['popular', 'veggie']),
    P('empanadas', 'entradas', 'Empanadas de carne (3 u.)', 'Masa casera, carne cortada a cuchillo, huevo y aceituna.', 24000, '🥟', ['popular']),
    P('provoleta', 'entradas', 'Provoleta a la parrilla', 'Queso provolone gratinado con orégano y tomates asados.', 32000, '🧀', ['veggie']),
    P('rabas', 'entradas', 'Rabas con alioli', 'Anillos de calamar rebozados, crocantes, con limón y alioli.', 45000, '🦑', ['nuevo']),
    P('asado', 'principales', 'Asado de tira', 'Costilla de novillo a la parrilla con mandioca y ensalada mixta.', 89000, '🥩', ['popular']),
    P('milanesa', 'principales', 'Milanesa napolitana', 'Lomo empanizado, jamón, muzzarella y salsa de tomate, con papas fritas.', 68000, '🍗', ['popular']),
    P('surubi', 'principales', 'Surubí a la parrilla', 'Filet de surubí con puré rústico y verduras grilladas.', 82000, '🐟', []),
    P('noquis', 'principales', 'Ñoquis al pesto', 'Ñoquis de papa caseros con pesto de albahaca y nueces.', 54000, '🍝', ['veggie']),
    P('margherita', 'pizzas', 'Pizza Margherita', 'Salsa de tomate, muzzarella fresca y albahaca. Masa de 24 h de fermentación.', 58000, '🍕', ['veggie']),
    P('muzza', 'pizzas', 'Pizza Muzzarella', 'La de siempre: salsa, muzzarella y aceitunas verdes.', 52000, '🍕', []),
    P('calabresa', 'pizzas', 'Pizza Calabresa', 'Muzzarella, longaniza calabresa y un toque de ají molido.', 64000, '🌶️', ['picante', 'popular']),
    P('cuatroq', 'pizzas', 'Pizza Cuatro quesos', 'Muzzarella, provolone, gorgonzola y parmesano.', 69000, '🧀', ['nuevo']),
    P('flan', 'postres', 'Flan casero', 'Con dulce de leche y crema chantilly.', 26000, '🍮', ['popular', 'veggie']),
    P('brownie', 'postres', 'Brownie con helado', 'Brownie tibio de chocolate con bocha de vainilla.', 32000, '🍫', ['veggie']),
    P('helado', 'postres', 'Helado artesanal (2 bochas)', 'Sabores del día: dulce de leche, frutilla, chocolate.', 24000, '🍨', ['veggie']),
    P('tiramisu', 'postres', 'Tiramisú', 'Receta italiana con café y mascarpone.', 34000, '🍰', ['nuevo', 'veggie']),
    P('limonada', 'bebidas', 'Limonada con menta', 'Jarra individual, exprimida al momento.', 18000, '🍋', ['popular', 'veggie']),
    P('terere', 'bebidas', 'Tereré de frutas', 'Con hierbas medicinales y fruta de estación.', 20000, '🧉', ['veggie']),
    P('cerveza', 'bebidas', 'Cerveza artesanal 500 ml', 'Rubia, roja o IPA de productores locales.', 28000, '🍺', []),
    P('malbec', 'bebidas', 'Copa de vino Malbec', 'Selección de la casa, servida en copa.', 36000, '🍷', []),
    P('cafe', 'bebidas', 'Café espresso', 'Blend 100% arábica, tostado local.', 12000, '☕', []),
    P('agua', 'bebidas', 'Agua mineral 500 ml', 'Con o sin gas.', 9000, '💧', []),
  ];

  const CUSTOMERS = ['Camila Benítez', 'Diego Ferreira', 'Lucía Gómez', 'Martín Acosta', 'Sofía Román', 'Javier Cabrera', 'Valentina Duarte', 'Andrés Villalba', 'Romina Giménez', 'Fabián Ortiz', 'Carolina Báez', 'Nicolás Aquino'];
  const PAYMENTS = ['efectivo', 'tarjeta', 'transferencia'];

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildOrders(products) {
    const rnd = mulberry32(2026);
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const now = Date.now();
    const day0 = new Date();
    day0.setHours(0, 0, 0, 0);
    const orders = [];
    let seq = 1000;

    function make(ts, status) {
      const n = 1 + Math.floor(rnd() * 4);
      const lines = [];
      const used = {};
      for (let i = 0; i < n; i++) {
        const p = pick(products);
        if (used[p.id]) continue;
        used[p.id] = 1;
        lines.push({ productId: p.id, name: p.name, emoji: p.emoji, price: p.price, qty: rnd() < 0.7 ? 1 : 2 + Math.floor(rnd() * 2), note: '' });
      }
      const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const mesa = rnd() < 0.78;
      seq += 1;
      orders.push({
        id: seq,
        createdAt: ts,
        status: status,
        customer: pick(CUSTOMERS),
        phone: '+595 98' + (1 + Math.floor(rnd() * 8)) + ' ' + (100 + Math.floor(rnd() * 899)) + ' ' + (100 + Math.floor(rnd() * 899)),
        type: mesa ? 'mesa' : 'retiro',
        table: mesa ? 1 + Math.floor(rnd() * 12) : null,
        payment: pick(PAYMENTS),
        notes: '',
        lines: lines,
        subtotal: subtotal,
        tip: 0,
        total: subtotal,
      });
    }

    // 6 días anteriores (de más viejo a más nuevo, para que los ids crezcan en el tiempo)
    for (let d = 6; d >= 1; d--) {
      const count = 9 + Math.floor(rnd() * 8) + (d === 1 || d === 2 ? 4 : 0);
      const times = [];
      for (let i = 0; i < count; i++) times.push(day0.getTime() - d * 86400000 + (11.5 + rnd() * 11) * 3600000);
      times.sort((a, b) => a - b).forEach((t) => make(t, 'delivered'));
    }
    // hoy: pedidos cada 8-25 min hacia atrás desde ahora
    const today = [];
    let t = now - 4 * 60000;
    for (let i = 0; i < 14; i++) {
      today.push(t);
      t -= (8 + rnd() * 17) * 60000;
    }
    const statuses = ['new', 'new', 'preparing', 'preparing', 'ready'];
    today.reverse().forEach((ts, i, arr) => {
      const fromEnd = arr.length - 1 - i;
      make(ts, fromEnd < statuses.length ? statuses[fromEnd] : 'delivered');
    });
    return { orders: orders, seq: seq };
  }

  Data.buildSeed = function () {
    const products = JSON.parse(JSON.stringify(PRODUCTS));
    const built = buildOrders(products);
    const preset = Data.identityPresets[0];
    return {
      settings: {
        name: preset.name,
        tagline: preset.tagline,
        logoEmoji: preset.logoEmoji,
        logoImage: null,
        palette: preset.palette,
        currency: 'PYG',
        address: 'Av. Mariscal López 1450, Asunción',
        hours: 'Abierto todos los días · 11:30 a 23:30',
        tables: 12,
      },
      categories: CATEGORIES,
      products: products,
      orders: built.orders,
      orderSeq: built.seq,
    };
  };
})(window);
