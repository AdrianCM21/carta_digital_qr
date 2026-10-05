/* Formateadores generales de fechas y textos. */
(function (g) {
  const H = (g.Helpers = g.Helpers || {});
  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  H.pad2 = (n) => (n < 10 ? '0' : '') + n;
  H.fmtTime = (ts) => {
    const d = new Date(ts);
    return H.pad2(d.getHours()) + ':' + H.pad2(d.getMinutes());
  };
  H.dayShort = (ts) => DAYS[new Date(ts).getDay()];
  H.startOfDay = (ts) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  H.timeAgo = (ts) => {
    const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return 'ahora';
    if (m < 60) return 'hace ' + m + ' min';
    const hr = Math.floor(m / 60);
    if (hr < 24) return 'hace ' + hr + ' h';
    return 'hace ' + Math.floor(hr / 24) + ' d';
  };
  H.plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  H.percentChange = (now, before) => (before ? Math.round(((now - before) / before) * 100) : null);
})(window);
