/* localStorage con fallback en memoria (modo privado, file://, etc.). */
(function (g) {
  const H = (g.Helpers = g.Helpers || {});
  const mem = {};

  function ls() {
    try {
      return g.localStorage;
    } catch (e) {
      return null;
    }
  }

  H.storage = {
    get(key, fallback) {
      try {
        const store = ls();
        const raw = store ? store.getItem(key) : mem[key];
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      try {
        const store = ls();
        if (store) store.setItem(key, raw);
        else mem[key] = raw;
      } catch (e) {
        mem[key] = raw;
      }
    },
    remove(key) {
      try {
        const store = ls();
        if (store) store.removeItem(key);
      } catch (e) {}
      delete mem[key];
    },
    keys(prefix) {
      const out = [];
      try {
        const store = ls();
        if (store) for (let i = 0; i < store.length; i++) if (store.key(i).indexOf(prefix) === 0) out.push(store.key(i));
      } catch (e) {}
      Object.keys(mem).forEach((k) => k.indexOf(prefix) === 0 && out.indexOf(k) === -1 && out.push(k));
      return out;
    },
  };
})(window);
