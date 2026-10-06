/* Componentes de UI reutilizables entre pantallas. */
(function (g) {
  const H = g.Helpers;
  const h = H.h;
  const UI = (g.UI = {});

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bag: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
    qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
    dashboard: '<rect x="4" y="4" width="7" height="9"/><rect x="13" y="4" width="7" height="5"/><rect x="13" y="11" width="7" height="9"/><rect x="4" y="15" width="7" height="5"/>',
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
    brush: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="1"/><circle cx="14" cy="9" r="1"/><circle cx="15" cy="14" r="1"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    print: '<path d="M7 9V4h10v5M7 17H5v-6h14v6h-2"/><path d="M7 14h10v6H7z"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 5v6h-6"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5 12v8h14v-8"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
    upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
  };

  UI.icon = function (name, size) {
    const s = size || 20;
    return h('span', { class: 'ico', html: '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>' });
  };

  UI.toast = function (msg) {
    const wrap = document.getElementById('toasts');
    const t = h('div', { class: 'toast' }, UI.icon('check', 16), msg);
    wrap.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2600);
  };

  /** Logo del negocio: imagen subida o emoji sobre un tile con el color de la paleta. */
  UI.brandLogo = function (settings, size) {
    const s = size || 44;
    const style = { width: s + 'px', height: s + 'px', fontSize: Math.round(s * 0.52) + 'px' };
    if (settings.logoImage) return h('span', { class: 'logo logo-img', style: style }, h('img', { src: settings.logoImage, alt: settings.name }));
    return h('span', { class: 'logo', style: style }, settings.logoEmoji || '🍽️');
  };

  /** Foto del producto sobre su emoji: si la imagen falta o falla, queda el emoji. */
  UI.photo = function (product, el) {
    if (product.image) {
      const img = h('img', { src: product.image, alt: '', loading: 'lazy', decoding: 'async', onerror: () => img.remove() });
      el.appendChild(img);
    }
    return el;
  };

  UI.thumb = function (product, size) {
    return UI.photo(product, h('span', { class: 'thumb', style: { width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.52) + 'px' } }, product.emoji));
  };

  const TAGS = { popular: ['★ Popular', 'tag-popular'], nuevo: ['Nuevo', 'tag-nuevo'], picante: ['🌶 Picante', 'tag-picante'], veggie: ['🌱 Veggie', 'tag-veggie'] };
  UI.tags = function (product) {
    return (product.tags || []).filter((t) => TAGS[t]).map((t) => h('span', { class: 'tag ' + TAGS[t][1] }, TAGS[t][0]));
  };

  UI.stepper = function (qty, onChange, min) {
    return h(
      'div',
      { class: 'stepper' },
      h('button', { type: 'button', 'aria-label': 'Quitar uno', onclick: () => onChange(qty - 1) }, UI.icon(min === 0 && qty <= 1 ? 'trash' : 'minus', 16)),
      h('span', { class: 'qty' }, qty),
      h('button', { type: 'button', 'aria-label': 'Agregar uno', onclick: () => onChange(qty + 1) }, UI.icon('plus', 16))
    );
  };

  UI.statusBadge = (status) => h('span', { class: 'badge status-' + status }, g.Data.statusLabels[status] || status);

  /**
   * Modal / bottom-sheet. `parent` permite montarlo dentro del marco del celular.
   * Devuelve { close, el }.
   */
  UI.modal = function (opts) {
    const parent = opts.parent || document.body;
    const prevFocus = document.activeElement;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey);
      overlay.classList.add('out');
      setTimeout(() => overlay.remove(), 180);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (opts.onClose) opts.onClose();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    const head = opts.title
      ? h('div', { class: 'modal-head' }, h('h3', null, opts.title), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Cerrar', onclick: close }, UI.icon('close', 18)))
      : null;
    const dialog = h('div', { class: 'modal ' + (opts.class || ''), role: 'dialog', 'aria-modal': 'true' }, head, h('div', { class: 'modal-body' }, opts.body), opts.footer ? h('div', { class: 'modal-foot' }, opts.footer) : null);
    const overlay = h('div', { class: 'overlay' + (parent === document.body ? ' overlay-fixed' : '') }, dialog);
    overlay.addEventListener('mousedown', (e) => e.target === overlay && close());
    document.addEventListener('keydown', onKey);
    parent.appendChild(overlay);
    const first = dialog.querySelector('input,select,textarea,button.btn');
    if (first && !opts.noFocus) first.focus();
    return { close: close, el: dialog };
  };

  UI.confirm = function (opts) {
    let m;
    m = UI.modal({
      title: opts.title,
      class: 'modal-sm',
      body: h('p', { class: 'muted' }, opts.message),
      footer: [
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => m.close() }, 'Cancelar'),
        h('button', { class: 'btn ' + (opts.danger ? 'btn-danger' : 'btn-primary'), type: 'button', onclick: () => { m.close(); opts.onConfirm(); } }, opts.confirmLabel || 'Confirmar'),
      ],
    });
  };

  UI.field = function (label, input, hint) {
    // Si el control ya es un <label> (switch) no se anida otro label.
    const wrapper = input.tagName === 'LABEL' ? 'div' : 'label';
    return h(wrapper, { class: 'field' }, h('span', { class: 'field-label' }, label), input, hint ? h('span', { class: 'field-hint' }, hint) : null);
  };

  UI.empty = function (emoji, title, text, action) {
    return h('div', { class: 'empty' }, h('div', { class: 'empty-emoji' }, emoji), h('h3', null, title), h('p', { class: 'muted' }, text), action || null);
  };
})(window);
