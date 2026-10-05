/* Helpers de DOM de uso general (sin dependencias de la app). */
(function (g) {
  const H = (g.Helpers = g.Helpers || {});
  const PROPS = ['value', 'checked', 'disabled', 'selected'];

  function append(el, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) return child.forEach((c) => append(el, c));
    el.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  /** h('div', {class:'x', onclick:fn}, 'texto', otroNodo, [lista]) */
  H.h = function (tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'html') el.innerHTML = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (PROPS.indexOf(k) !== -1) el[k] = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (let i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  };

  H.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };

  H.clear = function (el) {
    while (el.firstChild) el.removeChild(el.firstChild);
    return el;
  };

  H.clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  H.uid = (p) => (p || 'id') + '_' + Math.random().toString(36).slice(2, 9);
  H.isArray = Array.isArray;
  H.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  H.debounce = function (fn, ms) {
    let t;
    return function () {
      const a = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, a), ms);
    };
  };
})(window);
