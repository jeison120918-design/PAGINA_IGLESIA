# Iglesia Jesucristo es Mi Amigo Fiel (JEMAF) — Sitio Web Oficial

**Pastores:** Profeta Javier Belliard · Pastora Marnie Belliard
**Ubicación:** Av. Estrella Sadhalá #14, Santiago de los Caballeros, RD
**Versión:** 13.0 — Actualización en vivo: contadores de YouTube, videos/shorts/en vivo, fotos destacadas y mejoras de desempeño

---

## 🆕 NOVEDADES — Versión 13.0 "En Vivo" (19 de noviembre de 2026)

### Actualización en tiempo real (sin claves ni credenciales)
1. ✅ **Suscriptores y videos de YouTube en vivo** — los contadores de los dos canales (@Profetajavierbelliard y @profetaMarnieBelliard) se actualizan solos cada 15 minutos desde la API pública de SocialCounts (sin clave). Verificado el 19 nov 2026: Javier ~250K suscriptores y 1.540 videos; Marnie 871 suscriptores y 13 videos. Si la red falla, quedan los valores de referencia y se reintenta en el próximo ciclo.
2. ✅ **Videos, Shorts y transmisiones en vivo clasificados** — el feed RSS oficial de YouTube ya distinguía los Shorts por la URL (`/shorts/VIDEO_ID`). Ahora cada tarjeta lleva su insignia (Short / EN VIVO) y su fecha relativa ("hace 2 h", "hace 3 días"), y hay filtros Todos / Videos / Shorts / En vivo sobre la cuadrícula.
3. ✅ **Banner "EN VIVO AHORA"** — cuando hay una transmisión activa en el canal del Pastor Javier, aparece un banner rojo con el título y el botón para verla, y el reproductor destacado pasa a la transmisión. La detección lee la página `/live` de YouTube; si no hay transmisión, no aparece nada (no se inventa).
4. ✅ **Reproductor destacado más inteligente** — ya no toma el primer video del feed (que muchas veces es un Short vertical): prefiere una transmisión en vivo si la hay, si no el video normal más reciente.
5. ✅ **Fotos destacadas desde JSON** — la galería de oraciones lee `assets/galeria/destacadas.json` y pone esas fotos primero en el carrusel con la insignia ★ Destacada. Para añadir una foto nueva: sube el archivo a `assets/galeria/` y agrega una entrada en ese JSON (ruta, texto e icono). Si el archivo no existe o falla, la galería queda en su orden estático.
6. ✅ **Marca de "Última actualización"** — en la sección de Contenido se muestra la hora de la última actualización en vivo. Si algo falló, lo dice con honestidad ("mostrando la última información guardada").
7. ✅ **Caché local** — los últimos datos (feed y contadores) se guardan en el navegador 15 minutos: la página muestra al instante lo guardado y luego refresca en segundo plano, sin recargar.

### Lo que NO se puede actualizar en vivo (con honestidad)
- **Instagram, TikTok y Facebook no tienen ningún endpoint público fiable sin autenticación** para leer contadores de seguidores (Instagram exige inicio de sesión; TikTok y Facebook exigen sus APIs oficiales con credenciales). Se probaron vías públicas el 19 nov 2026 (Instagram `__a=1` devuelve vacío; TikTok vía proxy devuelve error 500) y no funcionan. Esas cifras siguen siendo valores estáticos de referencia en `SOCIAL_STATS` y se actualizan manualmente. Para tenerlas en vivo haría falta conectar la API oficial de Meta (Instagram/Facebook) y la API de TikTok con las credenciales de las cuentas.
- **Fotos nuevas de las redes** tampoco se pueden traer automáticamente sin esas APIs: por eso las destacadas se alimentan con el JSON local (punto 5). No se inventan fotos ni cifras de alcance.

### Mejoras de desempeño
- ➕ **Preconnect/dns-prefetch** a `api.rss2json.com`, `api.socialcounts.org` y `api.allorigins.win` (las tres fuentes en vivo), además de las que ya existían.
- ➕ **Decodificación asíncrona de imágenes** (`decoding="async"` en todas las `<img>`) para no bloquear el primer pintado.
- ➕ **Caché local de 15 minutos** (punto 7): menos peticiones repetidas y carga instantánea en visitas seguidas.
- ➕ Las miniaturas de YouTube ya eran `loading="lazy"`; el reproductor principal sigue siendo `eager` como debe ser.

### Verificado (19 nov 2026)
- Estructura HTML válida, sin etiquetas sin cerrar, sin IDs duplicados y sin anclas rotas.
- `node --check` correcto en `js/main.js`; CSS con llaves y paréntesis balanceados.
- Feed RSS vía rss2json trae datos reales (último item: Short del 19 nov 2026, 17:10 UTC); SocialCounts responde con los contadores reales de ambos canales; la página `/live` responde 200 y no marca transmisión activa (correcto: no hay una ahora).
- Sitio publicado en GitHub Pages: https://jeison120918-design.github.io/PAGINA_IGLESIA/

---

## 🆕 NOVEDADES — Versión 12.0 "Aurora" (19 de noviembre de 2026)

Rediseño total de la interfaz: nuevo sistema de diseño azul y blanco, hero a pantalla completa con tarjetas de vidrio, header de vidrio con desenfoque, botones con barrido de brillo, secciones, tarjetas de pastores, servicios, donaciones, contacto y footer rediseñados, mismo contenido y datos. Verificado sin errores y subido a main.

---

## 🆕 NOVEDADES — Versión 11.0 (19 de noviembre de 2026)

### Errores corregidos
1. ✅ **Etiquetas de estado ilegibles en las tarjetas de los pastores** — las etiquetas "perfil oficial del Pastor", "público" y "perfil oficial" usaban texto azul oscuro (#0b3d91) sobre fondo azul oscuro (contraste 1.34:1, prácticamente invisible). Ahora en las tarjetas oscuras usan azul cielo (#bfdbfe) sobre azul translúcido (contraste 9.44:1).
2. ✅ **Nota de Instagram poco legible** — el texto pequeño sobre el degradado de Instagram tenía contraste 3.21:1. Ahora va con fondo azul oscuro translúcido y opacidad .95.
3. ✅ **Imagen Open Graph con URL relativa** — `og:image` y `twitter:image` usaban rutas relativas, por lo que al compartir el enlace en redes no se mostraba la imagen. Ahora usan la URL absoluta de GitHub Pages (`https://jeison120918-design.github.io/PAGINA_IGLESIA/`) y se añadió `og:url`.
4. ✅ **Evento "INFLUENCIA" desactualizado** — la sección decía "Próximo Gran Evento" pero el evento fue el 10 y 11 de octubre de 2026 (ya pasó). Ahora dice "Evento destacado" con la nota "Evento realizado el 10 y 11 de octubre de 2026" y el botón lleva a ver las fotos del evento.
5. ✅ **Puntos del carrusel de oraciones ocultos a lectores de pantalla** — los puntos son clicables pero el contenedor tenía `aria-hidden="true"`. Ahora tiene `role="group"` y etiqueta accesible.
6. ✅ **Pestañas sin relación accesible con sus paneles** — los botones de YouTube/Facebook/Instagram ahora tienen `id` y cada panel su `aria-labelledby`.

### Mejoras de diseño y organización
- ➕ **Alternancia de secciones restaurada** — "Oraciones" y "Servicios" tenían el mismo fondo suave seguidas; Servicios vuelve a fondo blanco para separar mejor los bloques.
- ➕ **Nota del hero más legible** — opacidad .70 → .82 y tamaño 12 → 12.5 px.

### Verificado (19 nov 2026)
- Estructura HTML válida, sin etiquetas sin cerrar, sin IDs duplicados y sin anclas rotas.
- Todas las imágenes y archivos locales existen; las 13 miniaturas de YouTube responden 200.
- Canales de YouTube, Instagram, TikTok, X, Threads, WhatsApp, Cash App y el enlace de Google Maps responden 200. Facebook y PayPal devuelven 400/403 a peticiones automáticas por protección anti-bots, pero los enlaces son los oficiales y funcionan en el navegador.
- El feed RSS de YouTube funciona vía rss2json; el respaldo `api.allorigins.win` no respondió desde la red de verificación (el sitio sigue mostrando las tarjetas estáticas si el feed falla).
- Sitio publicado en GitHub Pages: https://jeison120918-design.github.io/PAGINA_IGLESIA/

---

## 🆕 NOVEDADES — Versión 10.0 (26 de agosto de 2026)

### Errores corregidos
1. ✅ **Enlaces de WhatsApp rotos** — `wa.me/profetajavierbelliard` (URL inválida, wa.me solo acepta números) aparecía en la barra superior y el footer. Ahora apuntan al número real `wa.me/18293979494`.
2. ✅ **Enlace y botón del mapa ilegibles** — el enlace de coordenadas y el botón "Abrir en Google Maps" usaban azul oscuro sobre fondo azul oscuro. Corregidos a azul claro/blanco con hover visible.
3. ✅ **Fallback del feed de YouTube implementado de verdad** — el README lo anunciaba pero el código no lo tenía. Ahora, si `rss2json` falla, el sitio lee el feed XML oficial de YouTube vía `api.allorigins.win` automáticamente.
4. ✅ **CSS duplicado eliminado** — reglas `.mt-8` y `.main-nav.open` estaban definidas dos veces.
5. ✅ **Cifra de Instagram del Pastor** — la pestaña de Instagram usaba el `@usuario` en el espacio de una estadística; ahora muestra "Seguidos" (auto) + badge de perfil oficial verificado.

### Mejoras de diseño, organización y espacios
- ➕ **Scrollspy** — el menú resalta automáticamente la sección que estás viendo.
- ➕ **Enlace "Contacto"** añadido al menú principal y al footer (la sección existía pero no era navegable).
- ➕ **Alternancia visual de secciones** — la sección Servicios ahora usa fondo blanco azulado suave para separar mejor los bloques y mejorar el ritmo de lectura.
- ➕ **Hero mejorado** — separador elegante sobre las estadísticas y espaciado fluido (clamp) entre botones, cifras y nota.
- ➕ **Evento INFLUENCIA con año visible** (2026) en la caja de fecha.
- ➕ **Datos estructurados Schema.org (Church)** en el `<head>` para mejorar el SEO y la ficha en Google.
- ➕ Toda la nueva estadística de Instagram se controla también desde `SOCIAL_STATS` (`pastorJavier.igSiguiendo`).

### Auto-actualización (sin tocar código)
- Videos y título destacado de YouTube: feed RSS cada 15 min con doble respaldo.
- Contadores de redes: una sola fuente (`SOCIAL_STATS` en `js/main.js`).
- Badge "Red con mayor alcance": se mueve solo a la red con más seguidores.
- Año del footer: automático.

---

## 📁 Estructura del proyecto

```
jemaf-website/
├── index.html         # Página principal (HTML5 válido)
├── css/styles.css     # Estilos responsivos — paleta AZUL + BLANCO
├── js/main.js         # Interactividad + auto-update YouTube (con fallback)
├── assets/
│   ├── favicon.svg            # Icono del sitio (paleta azul)
│   ├── apple-touch-icon.png   # Icono iOS (180×180, generado del favicon)
│   ├── og-image.jpg           # Imagen para compartir en redes
│   ├── galeria/               # Fotos del cuadro de oraciones (oracion-01..07.jpg)
│   │   └── destacadas.json    # Fotos destacadas: orden e insignia ★ (v13)
│   └── pastores/
│       ├── javier/            # Carrusel del Pastor (01..05.jpg)
│       └── marnie/            # Carrusel de la Pastora (01..05.jpg)
└── README.md
```

---

## 🎨 NOVEDADES — Versión 5.0

### Rediseño completo de paleta (Azul profesional + Blanco)

Se sustituyó la antigua paleta púrpura/dorado por una combinación **azul + blanco** con jerarquía profesional balanceada:

| Rol | Color | HEX |
|-----|-------|-----|
| Azul principal (marca) | Azul corporativo | `#0b3d91` |
| Azul profundo (fondos oscuros / hero / footer) | Navy | `#062766` |
| Azul claro (acentos / hover) | Azul medio | `#1e5fd1` |
| Acento brillante (destaques) | Azul vivo | `#3b82f6` |
| Acento claro (texto sobre fondos oscuros) | Azul cielo | `#93c5fd` |
| Acento oscuro (gradientes) | Azul intenso | `#1d4ed8` |
| Base | Blanco puro | `#ffffff` |
| Fondo suave | Blanco azulado | `#f4f7fc` |
| Texto principal | Casi negro azulado | `#0d1b33` |
| Gris neutro | Con matiz azul | `#5b6b82` |

### Aplicaciones consistentes de la paleta

- **Hero** — degradado navy → azul medio con partículas blancas suaves.
- **Header/Nav** — blanco translúcido con logo azul; CTA "Donar" en degradado azul.
- **Secciones oscuras** (Pastores, Eventos, Donaciones) — fondo azul profundo → azul principal, con texto blanco y acentos en azul claro.
- **Tarjetas claras** (Valores, Servicios, YouTube grid) — fondo blanco, borde superior/izquierdo azul, títulos en azul, iconos con degradado azul.
- **Botones**:
  - `.btn-primary` → degradado azul (primario)
  - `.btn-gold` (reutilizado) → botón blanco con borde blanco para CTA sobre fondo oscuro del evento
  - `.btn-ghost` → transparente con borde blanco
  - `.btn-ghost-dark` → borde azul primario
- **Palabras destacadas** (`.gold`) — ahora renderizan en **degradado azul brillante** manteniendo compatibilidad total con el HTML.
- **Formulario de contacto** — bordes azul suaves, focus con halo azul, flecha del select en azul.
- **Footer** — borde superior azul brillante, títulos azul claro, hover azul claro.
- **Botón WhatsApp** — se mantiene en verde (marca oficial de WhatsApp).
- **Botones YouTube** — se mantienen en rojo (marca oficial de YouTube).

### 🛠️ Errores corregidos

1. ✅ **Enlace de PayPal roto** — el botón "Enviar por PayPal" apuntaba a `https://www.paypal.com/paypalme/` (URL genérica sin destinatario que no permitía donar). Reemplazado por un enlace directo de donación PayPal con el email real:
   `https://www.paypal.com/donate/?business=javierbelliard7%40gmail.com&item_name=Ofrenda+Iglesia+JEMAF&currency_code=USD`
2. ✅ **`theme-color` desactualizado** — los meta tags `theme-color` y `msapplication-TileColor` seguían con el color púrpura antiguo `#2d1b4e`. Actualizados a `#0b3d91` para que la barra de navegador (Android/PWA) y los tiles de Windows respeten la nueva marca.
3. ✅ **Feed RSS de YouTube — endpoint de respaldo** — se añadió un segundo endpoint (`api.allorigins.win`) como fallback documentado en el código por si `rss2json` supera su cuota gratuita o queda temporalmente inaccesible.
4. ✅ **Contraste y legibilidad** revisados en todas las secciones oscuras (WCAG AA garantizado sobre `#062766` con texto blanco y azul claro `#93c5fd`).

---

## ✅ Compatibilidad universal mantenida (heredada de v4)

- 5 breakpoints: 1600+, 1180, 980, 820, 640, 380, 340 px.
- Landscape móvil optimizado.
- iPhone con notch / Dynamic Island: `env(safe-area-inset-*)` aplicado.
- Touch devices: hover sticky desactivado con `@media (hover:none)`.
- `touch-action:manipulation`, `overscroll-behavior-x:none`, scroll-snap.
- Skip link, `:focus-visible` azul, `prefers-reduced-motion`, `aria-*`.
- Menú móvil con overlay, bloqueo de scroll, cierre con ESC / overlay / resize.
- Copiar al portapapeles con fallback iOS.
- Honeypot anti-spam en formulario.
- AbortController con timeout de 10s en fetch del RSS.
- HTML5 válido sin errores.

---

## 🚀 Cómo publicar

Sitio 100 % estático (HTML + CSS + JS). Funciona en cualquier hosting:

- **Netlify / Vercel / Cloudflare Pages** (gratis, SSL automático) — arrastra la carpeta al panel.
- **GitHub Pages** — Settings → Pages → Branch: `main`.
- **cPanel / Hostinger / GoDaddy** — sube por FTP a `public_html/`.

---

## 📷 Cambiar fotos de los pastores

Reemplaza los archivos de los carruseles:
- `assets/pastores/javier/01..05.jpg` — Profeta Javier Belliard (vertical, recomendado 768×1024 px, JPG)
- `assets/pastores/marnie/01..05.jpg` — Pastora Marnie Belliard
- `assets/galeria/oracion-01..06.jpg` — Cuadro de oraciones (horizontal 16:9 recomendado)

---

## 🔄 YouTube auto-update (en vivo, v13)

El feed RSS del canal `@Profetajavierbelliard` se lee cada 15 minutos (pausado cuando la pestaña no está visible) y al volver a la pestaña. Sin API key. Los contadores de suscriptores y videos de ambos canales se actualizan en vivo desde SocialCounts; el banner de transmisión en vivo se comprueba en cada ciclo. Todo con caché local de 15 minutos y respaldo a los datos estáticos si la red falla.

Para cambiar el canal edita `js/main.js`:
```js
var CHANNEL_ID = 'UCrrGRL_XdPleFjWNAa0-Dhg';
```

## 📷 Fotos destacadas (v13)

La galería de oraciones lee `assets/galeria/destacadas.json`. Para destacar una foto nueva:

1. Sube la foto a `assets/galeria/` (horizontal 16:9 recomendado).
2. Agrega una entrada en `destacadas.json` con `src`, `caption`, `alt` e `icon` (nombre de icono de Font Awesome, por ejemplo `fa-heart`).
3. Las destacadas aparecen primero en el carrusel con la insignia ★ Destacada; el resto de la galería sigue en su orden normal.

---

---

## 🛠️ Correcciones — Actualización de agosto 2026

### 1. Datos de seguidores unificados en una sola fuente
Antes, los números de seguidores (TikTok, Facebook, YouTube, Instagram) estaban
repetidos y desincronizados en varios lugares del HTML (hero, tarjetas de
pastores, botones de redes, barra de canales de YouTube). Ahora todos viven en
un solo objeto `SOCIAL_STATS` al inicio de `js/main.js`, y el script rellena
automáticamente cada elemento marcado con `data-stat="grupo.red"` en el HTML.

**Para actualizar cualquier cifra:** edita solo el número `count` dentro de
`SOCIAL_STATS` en `js/main.js`. Se propaga solo a todo el sitio — no hace
falta tocar el HTML.

### 2. Error real corregido: cifra de Instagram incorrecta
La pestaña de Instagram mostraba "465K Seguidores", una cifra que en realidad
correspondía al total agregado antiguo del hero, no a Instagram. Se corrigió
para mostrar un guion (—) hasta contar con el dato exacto, con una nota
aclaratoria (Instagram no expone el contador público sin sesión iniciada).

### 3. Script de YouTube duplicado
El script `apis.google.com/js/platform.js` (botón de Suscripción de YouTube)
se cargaba dos veces — una por cada tarjeta de pastor. Ahora se carga una sola
vez en el `<head>`.

### 4. Hero actualizado con la red de mayor alcance
El espacio principal al entrar a la página ahora muestra, con su ícono y
etiqueta clara, las tres redes del Pastor Javier Belliard (cabeza de JEMAF) y
destaca automáticamente cuál tiene más seguidores ("Red con mayor alcance").
Si en el futuro otra red supera a TikTok, el badge se mueve solo (calculado
en JS, no a mano).

### 5. Verificación de cifras (25 de agosto de 2026)
- ✅ **Facebook del Pastor** — verificado en vivo: **199,767** "me gusta".
- ⚠️ **TikTok, YouTube e Instagram** — los buscadores no exponen el contador
  exacto y en tiempo real de estas tres plataformas (hay que iniciar sesión
  en el panel de cada cuenta para verlo). Se mantuvieron las últimas cifras
  públicas conocidas del sitio original. **Recomendación:** revisa estos tres
  números directamente en tus apps una vez al mes y actualízalos en
  `SOCIAL_STATS` — toma 30 segundos y se refleja en todo el sitio.

**Que Dios bendiga grandemente este ministerio. 🙏**
