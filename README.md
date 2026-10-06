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

En `js/config.js` podés ajustar los precios de tu servicio (`monthlyPrice`, `setupPrice`) que usa la pantalla *Cuánto te deja*.

## Cómo se usa la demo

Al abrirla aparece una **pantalla de inicio**: elegís el tipo de local (cambia nombre, logo y colores) y después:

- **▶ Ver el recorrido (2 min):** 6 pasos guiados con «Siguiente» y «Atrás» (también con las flechas del teclado): QR → carta con fotos → pedido en vivo (celular + panel) → control de la carta → marca → cuánto te deja. Carrito, checkout y confirmación se arman solos.
- **Explorar por mi cuenta:** pestañas Cliente / Negocio / En vivo / Valor para moverse libremente.

Siempre disponible arriba a la derecha:
- **Opciones:** tipo de local, paleta, moneda, vista Móvil/PC, ir a cualquier pantalla suelta y Reiniciar demo.

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
js/screens/admin.js     admin: Pedidos, Mi carta, Mi local (marca + mesas y QR) y Resumen
js/config.js            precios de tu servicio (editar)
img/products/           fotos de los platos (nombre = id del producto) + CREDITS.md con licencias
js/tour.js              pasos del recorrido guiado
js/screens/start.js     pantalla de inicio
js/screens/pitch.js     pantalla Valor (calculadora de ahorro)
js/screens/live.js      vista en vivo (celular + panel)
js/demo.js              barra de demo y datos de ejemplo del recorrido
js/app.js               router y tema
js/vendor/qrcode.min.js generador de QR (qrcodejs, MIT)
```

## Pasar a un proyecto con backend real

Solo hay que reemplazar el cuerpo de las funciones de `js/data/api.js` (todas devuelven `Promise`) por llamadas `fetch` a la API. Las pantallas no se tocan.
