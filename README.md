# Iglesia Jesucristo es Mi Amigo Fiel (JEMAF) — Sitio Web Oficial

**Pastores:** Profeta Javier Belliard · Pastora Marnie Belliard
**Ubicación:** Av. Estrella Sadhalá #14, Santiago de los Caballeros, RD
**Versión:** 11.0 — Corrección de legibilidad, enlaces y contenido desactualizado

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
│   ├── galeria/               # Fotos del cuadro de oraciones (oracion-01..06.jpg)
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

## 🔄 YouTube auto-update

El feed RSS del canal `@Profetajavierbelliard` se lee cada 15 minutos (pausado cuando la pestaña no está visible). Sin API key. Para cambiar el canal edita `js/main.js`:
```js
var CHANNEL_ID = 'UCrrGRL_XdPleFjWNAa0-Dhg';
```

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
