/* Monedas: los precios se guardan en guaraníes (base) y se convierten al mostrar. */
(function (g) {
  const H = (g.Helpers = g.Helpers || {});

  const CURRENCIES = {
    PYG: { code: 'PYG', label: 'Guaraní', symbol: 'Gs.', rate: 1, decimals: 0 },
    USD: { code: 'USD', label: 'Dólar', symbol: 'US$', rate: 1 / 7500, decimals: 2 },
    BRL: { code: 'BRL', label: 'Real', symbol: 'R$', rate: 5.5 / 7500, decimals: 2 },
    ARS: { code: 'ARS', label: 'Peso argentino', symbol: '$', rate: 0.16, decimals: 0 },
    EUR: { code: 'EUR', label: 'Euro', symbol: '€', rate: 0.92 / 7500, decimals: 2 },
  };
  let current = 'PYG';
  const fmtCache = {};

  function cfg(code) {
    return CURRENCIES[code] || CURRENCIES.PYG;
  }
  function fmt(c) {
    return (fmtCache[c.code] =
      fmtCache[c.code] || new Intl.NumberFormat('es-PY', { minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals }));
  }

  H.currencies = CURRENCIES;
  H.setCurrency = (code) => (current = CURRENCIES[code] ? code : 'PYG');
  H.getCurrency = () => current;
  /** Formatea un monto en guaraníes (base) en la moneda activa. */
  H.money = function (basePyg, code) {
    const c = cfg(code || current);
    return c.symbol + ' ' + fmt(c).format((basePyg || 0) * c.rate);
  };
  /** Versión corta para etiquetas de gráficos: "Gs. 1,2 M". */
  H.moneyCompact = function (basePyg, code) {
    const c = cfg(code || current);
    return c.symbol + ' ' + new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 }).format((basePyg || 0) * c.rate);
  };
  /** Valor en la moneda indicada -> guaraníes. */
  H.toBase = (value, code) => Math.round((Number(value) || 0) / cfg(code || current).rate);
  /** Guaraníes -> valor numérico en la moneda indicada. */
  H.fromBase = function (base, code) {
    const c = cfg(code || current);
    return +((base || 0) * c.rate).toFixed(c.decimals);
  };
})(window);
