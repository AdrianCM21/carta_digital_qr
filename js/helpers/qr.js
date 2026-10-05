/* Dibuja un QR dentro de un elemento usando js/vendor/qrcode.min.js. */
(function (g) {
  const H = (g.Helpers = g.Helpers || {});

  H.renderQR = function (el, text, size) {
    H.clear(el);
    if (!g.QRCode) {
      el.textContent = 'QR no disponible';
      return;
    }
    new g.QRCode(el, { text: text, width: size, height: size, colorDark: '#111111', colorLight: '#ffffff', correctLevel: g.QRCode.CorrectLevel.M });
  };

  /** PNG (data URL) del QR ya renderizado dentro de `el`. */
  H.qrDataUrl = function (el) {
    const canvas = el.querySelector('canvas');
    if (canvas) return canvas.toDataURL('image/png');
    const img = el.querySelector('img');
    return img ? img.src : null;
  };

  /** URL absoluta de una ruta hash de esta misma app (para codificar en el QR). */
  H.appUrl = (route) => location.href.split('#')[0] + '#/' + route;

  H.download = function (dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
})(window);
