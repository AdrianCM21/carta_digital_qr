# Carta digital QR · Demo

Demo estática (HTML + CSS + JS, sin build ni dependencias) para mostrar a dueños de restaurantes cómo se vería y se manejaría su carta digital con QR.

## Cómo verla

Abrí `index.html` directamente, o servila con cualquier servidor estático:

```bash
python3 -m http.server 8765
```

## Publicar

Es 100 % estática: subí la carpeta tal cual a Netlify, Vercel, GitHub Pages, Cloudflare Pages o cualquier hosting.
El QR de las mesas apunta a la URL donde esté publicada.

## Antes de publicar

Editá `js/config.js` con tu nombre y tu número de WhatsApp (formato internacional, solo dígitos). Lo usan el botón *Quiero mi carta* y, por defecto, el WhatsApp del local de la demo (donde llegan los pedidos enviados desde la confirmación).

## Guion para presentar

La barra superior oscura sirve para saltar entre pantallas:

- **Cliente**: QR → Carta → Carrito → Checkout → Confirmación. Carrito, checkout y confirmación se arman solos con datos de ejemplo.
- **Admin**: Panel → Productos → Pedidos → Marca → QR de mesas. Un pedido hecho en la carta aparece en *Pedidos*.
- **Paleta**: 5 paletas (Brasa, Bosque, Océano, Uva, Noche).
- **Negocio**: carga otro nombre, logo y colores de ejemplo. **Moneda**: PYG, USD, BRL, ARS, EUR.
- **En vivo**: celular del cliente y panel del negocio lado a lado. El pedido llega al panel con aviso sonoro; el botón *Armar pedido de ejemplo* lo prepara en un clic.
- **Quiero mi carta**: botón verde que abre WhatsApp contigo con un mensaje prellenado.
- **Vista**: Móvil / PC. **Reiniciar demo** vuelve todo al estado inicial.

Las fotos son de Wikimedia Commons (licencias libres, ver `img/CREDITS.md`); reemplazalas por las de cada cliente o subilas desde *Productos*.

Los datos viven en el `localStorage` del navegador, así que cada visitante ve su propia copia.

## Estructura

```
index.html
css/styles.css          paletas (variables CSS), componentes y pantallas
js/helpers/             utilidades de uso general (DOM, storage, moneda, formato, QR, archivos)
js/data/seed.js         datos de ejemplo (carta, pedidos, identidades)
js/data/api.js          ÚNICA capa de acceso a datos
js/ui/components.js     componentes compartidos (modal, toast, stepper, íconos…)
js/screens/customer.js  QR, carta, carrito, checkout, confirmación
js/screens/admin.js     panel, productos, pedidos, marca, QR de mesas
js/config.js            tu nombre y WhatsApp (editar)
img/products/           fotos de los platos (nombre = id del producto) + CREDITS.md con licencias
js/screens/live.js      vista en vivo (celular + panel)
js/demo.js              barra de demo y datos de ejemplo del recorrido
js/app.js               router y tema
js/vendor/qrcode.min.js generador de QR (qrcodejs, MIT)
```

## Pasar a un proyecto con backend real

Solo hay que reemplazar el cuerpo de las funciones de `js/data/api.js` (todas devuelven `Promise`) por llamadas `fetch` a la API. Las pantallas no se tocan.
