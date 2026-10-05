/* Enlaces de WhatsApp (wa.me). */
(function (g) {
  const H = (g.Helpers = g.Helpers || {});

  /** URL de wa.me con el texto prellenado. `number` puede traer +, espacios o guiones. */
  H.whatsappUrl = function (number, text) {
    const digits = String(number || '').replace(/\D/g, '');
    return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text || '');
  };
})(window);
