/* Pasos del recorrido guiado. `who` indica de qué lado se mira: cliente, negocio o ambos. */
(function (g) {
  g.Tour = {
    steps: [
      { route: 'qr', who: 'cliente', title: 'Tu cliente escanea el QR', text: 'Cada mesa tiene su código. Lo escanea con la cámara del celular y se abre la carta, sin descargar nada.' },
      { route: 'menu', who: 'cliente', title: 'Elige con fotos y pide', text: 'Platos con foto, categorías y buscador. Tocá un plato para ver el detalle y agregarlo al pedido.', prep: () => g.Demo.ensureCart() },
      { route: 'live', who: 'ambos', title: 'Tu local lo recibe al instante', text: 'Tocá «Armar pedido de ejemplo», confirmalo en el celular y mirá cómo aparece en el panel, con aviso sonoro.' },
      { route: 'admin/products', who: 'negocio', title: 'Vos controlás tu carta', text: 'Agotá un plato con el interruptor o cambiá un precio directo en la lista: llega a la carta al instante.' },
      { route: 'admin/local', who: 'negocio', title: 'Se adapta a tu marca', text: 'Cambiá nombre, logo y color, y generá el QR de cada mesa. Todo se actualiza en la carta de tus clientes.' },
      { route: 'value', who: 'negocio', title: 'Cuánto te deja', text: 'Poné los números de tu local y mirá el ahorro estimado. Después, hablamos de tu carta.' },
    ],
    who: {
      cliente: '👤 Lo que ve tu cliente',
      negocio: '🏪 Lo que ves vos',
      ambos: '👤 + 🏪 Los dos lados',
    },
  };
})(window);
