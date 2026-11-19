/* ===========================================================
   IGLESIA JESUCRISTO ES MI AMIGO FIEL — JavaScript v7.1
   (v14 OBSERVADOR: contadores desde assets/social-stats.json,
   actualizados cada 6 horas por un sistema externo que visita
   las páginas públicas y observa los seguidores)
   (v12 UI: el header ahora recibe la clase .scrolled al bajar,
   para el efecto vidrio reforzado del nuevo diseño)
   (v13 EN VIVO: contadores de YouTube en vivo, feed clasificado
   en videos/shorts/en vivo con filtros, banner de transmisión
   en vivo, fotos destacadas desde JSON y marca de última
   actualización, con caché local y respaldo a datos estáticos)
   SOLUCIÓN DEFINITIVA ERROR 153 YOUTUBE
   - Facade Lite pattern (patrón oficial web.dev)
   - Detección de origen (file://, http, https)
   - Fallback en cascada: youtube.com → youtube-nocookie.com → link directo
   - Reintentos automáticos ante Error 150/153
   - Intersection Observer para carga diferida segura
   - Compatibilidad iOS/Android/Desktop
   =========================================================== */

(function() {
  'use strict';

  /* ===== Detección de contexto de ejecución ===== */
  var IS_FILE_PROTOCOL = window.location.protocol === 'file:';
  var IS_HTTPS = window.location.protocol === 'https:';
  var CURRENT_ORIGIN = window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : null;

  /* ===== Helper: safe DOM ready ===== */
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /* =========================================================
     ============ ESTADÍSTICAS DE REDES SOCIALES ============
     Fuente única de verdad: todos los contadores del sitio
     (hero, tarjetas de pastores, botones, barra de YouTube)
     se rellenan automáticamente desde este objeto.

     YOUTUBE EN VIVO (v13): los suscriptores y el total de
     videos de los dos canales se actualizan en vivo desde la
     API pública de SocialCounts (sin clave), cada 15 minutos
     y al volver a la pestaña. Si la red falla, se conservan
     estos valores de referencia y se reintenta en el próximo
     ciclo. Última verificación manual de referencia:
     19 de noviembre de 2026 (Javier: ~250K suscriptores,
     1.540 videos; Marnie: 871 suscriptores, 13 videos).

     OBSERVADOR AUTOMÁTICO (v14): los contadores ya no se actualizan
     a mano. Un sistema externo (actualizar-seguidores.py) visita las
     páginas públicas cada 6 horas, observa los seguidores de cada red
     y guarda el resultado en assets/social-stats.json. La página lee
     ese archivo al cargar y aplica los valores observados. Si el
     archivo no carga, quedan estos valores de referencia.
     Última observación: 19 nov 2026 (TikTok Javier 434.300, X 48,
     YouTube Javier ~250K / 1.540 videos, Marnie 871 / 13 videos).

     INSTAGRAM / FACEBOOK / THREADS: sus páginas públicas no entregan
     el contador a una visita automática (Instagram y Threads no lo
     traen en el HTML; Facebook bloquea con HTTP 400). Esos números
     siguen siendo valores estáticos de referencia hasta que se
     conecten sus APIs oficiales. No se inventan cifras.

     PARA ACTUALIZAR: no toques los números a mano; el observador
     lo hace solo. El sitio entero (hero + tarjetas + botones) se
     actualiza solo, sin tocar el HTML.
     ========================================================= */
  var SOCIAL_STATS = {
    pastorJavier: {
      tiktok:    { count: 434300,  label: 'TikTok' },
      facebook:  { count: 2400000, label: 'Facebook' },
      youtube:   { count: 250000,  label: 'YouTube' },
      ytVideos:  { count: 1540,    label: 'Videos YouTube' },
      instagram: { count: null,    label: 'Instagram' },
      igSiguiendo: { count: 23,    label: 'Seguidos Instagram' }
    },
    pastoraMarnie: {
      facebook:  { count: 7585, label: 'Facebook' },
      youtube:   { count: 871, label: 'YouTube' },
      instagram: { count: 1214, label: 'Instagram' }
    },
    iglesia: {
      publicaciones: { count: 4600,   label: 'Publicaciones' },
      facebook:      { count: 200000, label: 'Facebook Iglesia' }
    }
  };

  // Formatea un número a "372.7K+" / "1,214+" etc.
  function formatFollowers(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    if (n >= 10000) return Math.round(n / 1000) + 'K+';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    return n.toLocaleString('es-DO') + '+';
  }

  // Busca un stat por ruta "pastorJavier.tiktok"
  function getStat(path) {
    var parts = path.split('.');
    var obj = SOCIAL_STATS;
    for (var i = 0; i < parts.length; i++) {
      if (!obj) return null;
      obj = obj[parts[i]];
    }
    return obj || null;
  }

  // Devuelve la red con más seguidores dentro de un grupo de stats
  function topNetwork(group) {
    var best = null;
    Object.keys(group).forEach(function(key) {
      var s = group[key];
      if (s.count !== null && s.count !== undefined && (!best || s.count > best.count)) {
        best = s;
      }
    });
    return best;
  }

  function renderSocialStats() {
    // Rellena cualquier elemento marcado con data-stat="grupo.red"
    document.querySelectorAll('[data-stat]').forEach(function(el) {
      var stat = getStat(el.getAttribute('data-stat'));
      if (stat && stat.count !== null && stat.count !== undefined) {
        el.textContent = formatFollowers(stat.count);
      }
    });

    // Marca automáticamente la red con más seguidores del Pastor
    // (si en el futuro cambian los números, el badge "Mayor alcance"
    // se mueve solo a la red correcta)
    var topJavier = topNetwork(SOCIAL_STATS.pastorJavier);
    document.querySelectorAll('[data-stat-badge="pastorJavier"]').forEach(function(host) {
      var inner = host.querySelector('[data-stat]');
      var stat = inner ? getStat(inner.getAttribute('data-stat')) : null;
      host.classList.toggle('is-top-network', !!(topJavier && stat === topJavier));
    });
  }

  /* ===== Contadores observados (v14): assets/social-stats.json =====
     El observador externo visita las páginas públicas cada 6 horas y
     guarda los seguidores observados en ese archivo. Al cargar, la
     página lo lee y aplica los valores (TikTok, X, YouTube y los que
     se puedan observar). Si el archivo no carga, quedan los valores
     de referencia de SOCIAL_STATS. */
  function loadObservedStats() {
    if (!('fetch' in window)) return;
    fetch('assets/social-stats.json')
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(data) {
        if (!data || !data.stats) return;
        var applied = 0;
        Object.keys(data.stats).forEach(function(group) {
          Object.keys(data.stats[group]).forEach(function(key) {
            var obs = data.stats[group][key];
            var stat = getStat(group + '.' + key);
            if (obs && typeof obs.count === 'number' && stat) {
              stat.count = obs.count;
              applied++;
            }
          });
        });
        if (applied) {
          renderSocialStats();
          var note = document.getElementById('heroStatsNote');
          if (note && data.updated_at_local) {
            note.textContent = 'Cifras públicas de las redes oficiales del Pastor Javier Belliard, cabeza de JEMAF. Observadas automáticamente el ' + data.updated_at_local + ' y actualizadas cada 6 horas; los suscriptores de YouTube además se actualizan en vivo al visitar la página.';
          }
        }
      })
      .catch(function(err) {
        console.info('[Stats] social-stats.json no disponible, usando valores de referencia.', err && err.message || err);
      });
  }

  ready(function() {

    renderSocialStats();
    loadObservedStats();

    /* ===== Rendimiento: decodificación asíncrona de imágenes =====
       Las imágenes se decodifican fuera del hilo principal para no
       bloquear el primer pintado. Las que ya traen loading="lazy"
       en el HTML se mantienen diferidas. */
    try {
      document.querySelectorAll('img').forEach(function(img) {
        if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
      });
    } catch (_) {}


    /* ===== AOS Animations ===== */
    try {
      if (typeof AOS !== 'undefined') {
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        AOS.init({
          duration: prefersReducedMotion ? 0 : 900,
          easing: 'ease-out-cubic',
          once: true,
          offset: 80,
          disable: function() {
            return prefersReducedMotion || window.innerWidth < 480;
          }
        });
      }
    } catch (e) {
      console.warn('[AOS] No se pudo inicializar:', e);
    }

    /* ===== Año actual en footer ===== */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ===== Mobile Nav ===== */
    var navToggle = document.getElementById('navToggle');
    var mainNav = document.getElementById('mainNav');
    var navOverlay = document.getElementById('navOverlay');
    var body = document.body;

    function closeMenu() {
      if (!navToggle || !mainNav) return;
      navToggle.classList.remove('open');
      mainNav.classList.remove('open');
      if (navOverlay) navOverlay.classList.remove('show');
      body.classList.remove('no-scroll');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
    }

    function openMenu() {
      if (!navToggle || !mainNav) return;
      navToggle.classList.add('open');
      mainNav.classList.add('open');
      if (navOverlay) navOverlay.classList.add('show');
      body.classList.add('no-scroll');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Cerrar menú');
    }

    if (navToggle && mainNav) {
      navToggle.addEventListener('click', function() {
        if (mainNav.classList.contains('open')) closeMenu();
        else openMenu();
      });
      mainNav.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', closeMenu);
      });
      if (navOverlay) navOverlay.addEventListener('click', closeMenu);
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('open')) closeMenu();
      });
      window.addEventListener('resize', function() {
        if (window.innerWidth > 980 && mainNav.classList.contains('open')) closeMenu();
      });
    }

    /* ===== Tabs ===== */
    var tabBtns = document.querySelectorAll('.tab-btn');
    var tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = btn.dataset.tab;
        tabBtns.forEach(function(b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tabContents.forEach(function(c) { c.classList.remove('active'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        var targetEl = document.getElementById('tab-' + target);
        if (targetEl) targetEl.classList.add('active');
      });
    });

    /* ===== Copiar datos bancarios ===== */
    function copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function(resolve, reject) {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          ta.style.top = '0';
          ta.setAttribute('readonly', '');
          document.body.appendChild(ta);
          if (navigator.userAgent.match(/ipad|iphone/i)) {
            var range = document.createRange();
            range.selectNodeContents(ta);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            ta.setSelectionRange(0, 999999);
          } else {
            ta.select();
          }
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          if (ok) resolve(); else reject(new Error('execCommand fallida'));
        } catch (err) { reject(err); }
      });
    }

    document.querySelectorAll('.btn-copy[data-copy-text]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var text = btn.dataset.copyText;
        copyToClipboard(text).then(function() {
          var original = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> ¡Copiado!';
          btn.classList.add('copied');
          setTimeout(function() {
            btn.innerHTML = original;
            btn.classList.remove('copied');
          }, 2000);
        }).catch(function(err) {
          console.warn('Error al copiar:', err);
          var original = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i> Copia manual';
          setTimeout(function() { btn.innerHTML = original; }, 2500);
          try { window.prompt('Copia los datos manualmente:', text); } catch(_) {}
        });
      });
    });

    /* =========================================================
       ============ REPRODUCTOR YOUTUBE — SOLUCIÓN ERROR 153 ============
       Estrategia:
       1) Construir URL sin enablejsapi cuando no hay origin válido (file://).
       2) Preferir youtube-nocookie.com para reducir bloqueos por privacidad.
       3) En Error 153/150 → reintentar automáticamente con dominio alterno.
       4) Timeout de carga: si el iframe no dispara 'load' en 8s → fallback.
       5) Fallback final: mostrar thumbnail + botón directo a YouTube.
       ========================================================= */

    var ytMainPlayer = document.getElementById('ytMainPlayer');
    var ytMainTitle = document.getElementById('ytMainTitle');
    var ytGrid = document.getElementById('ytGrid');
    var ytPlayerWrap = document.querySelector('.yt-main-player');

    // Extraer ID desde src o data-vid
    function currentPlayerVid() {
      if (!ytMainPlayer) return null;
      var src = ytMainPlayer.getAttribute('src') || ytMainPlayer.dataset.src || '';
      var m = src.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      return m ? m[1] : (ytMainPlayer.dataset.vid || null);
    }

    // Construye la URL segura de embed
    // - Sin enablejsapi (evita Error 153 cuando el origin es file:// o inválido).
    // - Con parámetros que reducen sugerencias externas.
    // - Elige dominio nocookie para evitar bloqueos por trackers.
    function buildYtEmbedUrl(vid, opts) {
      opts = opts || {};
      var domain = opts.useNocookie ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
      var params = [
        'rel=0',
        'modestbranding=1',
        'playsinline=1',
        'iv_load_policy=3',
        'fs=1',
        'cc_load_policy=0',
        'disablekb=0'
      ];
      if (opts.autoplay) {
        params.push('autoplay=1');
        params.push('mute=1');
      }
      // Sólo enviamos origin si estamos en http/https reales, nunca en file://
      if (!IS_FILE_PROTOCOL && CURRENT_ORIGIN && /^https?:/.test(CURRENT_ORIGIN)) {
        params.push('origin=' + encodeURIComponent(CURRENT_ORIGIN));
      }
      return domain + '/embed/' + vid + '?' + params.join('&');
    }

    // Aplica atributos seguros y estándar al iframe
    function applySafeIframeAttrs(iframe) {
      if (!iframe) return;
      try {
        iframe.setAttribute('allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('webkitallowfullscreen', 'true');
        iframe.setAttribute('mozallowfullscreen', 'true');
        // strict-origin-when-cross-origin es el estándar recomendado por Google
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('title', iframe.getAttribute('title') || 'Reproductor de video YouTube');
      iframe.setAttribute('loading', 'eager'); // Evitar lazy en el player principal
        // Quitar loading=lazy en el destacado (retrasa la primera carga)
        if (iframe.id === 'ytMainPlayer') iframe.removeAttribute('loading');
      } catch (_) {}
    }

    // Construye la vista de fallback (cuando iframe no carga)
    function buildFallbackHtml(vid, title) {
      var t = title || 'Ver en YouTube';
      return '' +
        '<div class="yt-fallback-card">' +
          '<a href="https://www.youtube.com/watch?v=' + vid + '" target="_blank" rel="noopener noreferrer" class="yt-fallback-link" aria-label="Abrir video en YouTube">' +
            '<img src="https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg" onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + vid + '/mqdefault.jpg\';" alt="' + escapeHtml(t) + '" loading="lazy" />' +
            '<span class="yt-fallback-play" aria-hidden="true"><i class="fas fa-play"></i></span>' +
          '</a>' +
          '<div class="yt-fallback-msg">' +
            '<p><i class="fas fa-info-circle" aria-hidden="true"></i> El reproductor embebido no está disponible en este momento.</p>' +
            '<a class="btn btn-primary" href="https://www.youtube.com/watch?v=' + vid + '" target="_blank" rel="noopener noreferrer">' +
              '<i class="fab fa-youtube" aria-hidden="true"></i> Ver en YouTube' +
            '</a>' +
          '</div>' +
        '</div>';
    }

    // Reemplaza el iframe por un iframe nuevo (evita bugs de reutilización del mismo iframe)
    function replaceIframeWithNew(vid, opts) {
      if (!ytPlayerWrap) return null;
      opts = opts || {};
      var newIframe = document.createElement('iframe');
      newIframe.id = 'ytMainPlayer';
      newIframe.dataset.vid = vid;
      newIframe.dataset.attempt = String(opts.attempt || 1);
      newIframe.dataset.useNocookie = opts.useNocookie ? '1' : '0';
      applySafeIframeAttrs(newIframe);
      // Colocamos el src DESPUÉS de setear atributos (evita carreras)
      newIframe.src = buildYtEmbedUrl(vid, opts);

      // Reemplazar
      var oldIframe = document.getElementById('ytMainPlayer');
      if (oldIframe && oldIframe.parentNode) {
        oldIframe.parentNode.replaceChild(newIframe, oldIframe);
      } else {
        ytPlayerWrap.innerHTML = '';
        ytPlayerWrap.appendChild(newIframe);
      }
      ytMainPlayer = newIframe;

      // Escucha de carga y timeout de fallo
      attachLoadWatchdog(newIframe, vid, opts);
      return newIframe;
    }

    // Vigila si el iframe carga; si no, aplica fallback en cascada
    function attachLoadWatchdog(iframe, vid, opts) {
      opts = opts || {};
      var attempt = opts.attempt || 1;
      var loaded = false;

      var onLoad = function() {
        loaded = true;
        iframe.dataset.loaded = '1';
        // Test adicional: si tras cargar, el contenido interno reporta error
        // No podemos leer el iframe por CORS, pero YouTube muestra su propio UI.
        // Los reintentos se disparan sólo por timeout.
      };
      iframe.addEventListener('load', onLoad, { once: true });

      // Timeout: 8 segundos. En redes lentas, damos otra chance con nocookie.
      setTimeout(function() {
        if (loaded) return;
        if (attempt === 1) {
          console.warn('[YT] Iframe no cargó; reintentando con youtube-nocookie.com…');
          replaceIframeWithNew(vid, { attempt: 2, useNocookie: true, autoplay: opts.autoplay });
        } else if (attempt === 2) {
          console.warn('[YT] Segundo intento fallido; usando fallback visual.');
          renderFallback(vid);
        }
      }, 8000);
    }

    function renderFallback(vid) {
      if (!ytPlayerWrap) return;
      var title = ytMainTitle ? ytMainTitle.textContent : '';
      ytPlayerWrap.innerHTML = buildFallbackHtml(vid, title);
    }

    function escapeHtml(s) {
      if (!s) return '';
      return String(s).replace(/[&<>"']/g, function(c) {
        return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
      });
    }

    function truncate(s, n) {
      if (!s) return '';
      return s.length > n ? s.slice(0, n-1) + '…' : s;
    }

    function extractVid(url) {
      if (!url) return null;
      var m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
              url.match(/\/embed\/([a-zA-Z0-9_-]{11})/) ||
              url.match(/\/([a-zA-Z0-9_-]{11})(?:[?&].*)?$/);
      return m ? m[1] : null;
    }

    /* ===== Inicialización del reproductor destacado =====
       Reescribimos el iframe inicial con la URL segura y activamos el watchdog.
       Esto elimina de raíz el Error 153 en file:// y en dominios con CSP restrictiva. */
    if (ytMainPlayer && ytPlayerWrap) {
      applySafeIframeAttrs(ytMainPlayer);
      var initialVid = currentPlayerVid() || 'J8ITiikzhUY';
      // Preferimos youtube.com estándar en HTTPS; si el sitio está en file:// o http,
      // vamos directo con youtube-nocookie para evitar bloqueos.
      var preferNocookie = IS_FILE_PROTOCOL || !IS_HTTPS;
      replaceIframeWithNew(initialVid, { attempt: 1, useNocookie: preferNocookie, autoplay: false });
    }

    /* ===== Click en cards de YouTube => carga en reproductor principal ===== */
    if (ytGrid && ytPlayerWrap) {
      ytGrid.addEventListener('click', function(e) {
        var card = e.target.closest('.yt-card-video');
        if (!card) return;
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;

        var vid = card.dataset.vid;
        if (!vid) return;

        e.preventDefault();

        var title = (card.querySelector('h4') || {}).textContent || '';
        if (ytMainTitle) ytMainTitle.textContent = title;

        var preferNocookie = IS_FILE_PROTOCOL || !IS_HTTPS;
        replaceIframeWithNew(vid, { attempt: 1, useNocookie: preferNocookie, autoplay: true });

        var featured = document.querySelector('.yt-featured');
        if (featured && typeof featured.scrollIntoView === 'function') {
          try { featured.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          catch (_) { featured.scrollIntoView(); }
        }
      });
    }

    /* ===== Back to top ===== */
    var backTop = document.getElementById('backTop');
    if (backTop) {
      var ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          window.requestAnimationFrame(function() {
            if (window.pageYOffset > 500) backTop.classList.add('show');
            else backTop.classList.remove('show');
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      backTop.addEventListener('click', function() {
        // Desactivar smooth scroll temporalmente para asegurar que llegue a 0
        var html = document.documentElement;
        var prev = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        // Restaurar después
        setTimeout(function() { html.style.scrollBehavior = prev || ''; }, 50);
      });
    }

    /* ===== Smooth scroll ===== */
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var id = a.getAttribute('href');
        if (!id || id === '#' || id.length <= 1) return;
        var target;
        try { target = document.querySelector(id); } catch (_) { return; }
        if (target) {
          e.preventDefault();
          try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          catch (_) { target.scrollIntoView(); }
          if (history.replaceState) history.replaceState(null, '', id);
        }
      });
    });

    /* ===== Scrollspy: resalta el enlace activo del menú ===== */
    var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    var spySections = [];
    navLinks.forEach(function(a) {
      var id = a.getAttribute('href');
      var sec = null;
      if (id && id.length > 1) { try { sec = document.querySelector(id); } catch (_) {} }
      if (sec) spySections.push({ link: a, sec: sec });
    });
    if ('IntersectionObserver' in window && spySections.length) {
      var spy = new IntersectionObserver(function(entries) {
        entries.forEach(function(en) {
          if (!en.isIntersecting) return;
          navLinks.forEach(function(l) { l.classList.remove('active'); });
          for (var i = 0; i < spySections.length; i++) {
            if (spySections[i].sec === en.target) {
              spySections[i].link.classList.add('active');
              break;
            }
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      spySections.forEach(function(s) { spy.observe(s.sec); });
    }

    /* ===== Header shadow on scroll (v12: clase .scrolled) ===== */
    var header = document.getElementById('header');
    if (header) {
      var headerTicking = false;
      var updateHeader = function() {
        var scrolled = window.pageYOffset > 30;
        header.classList.toggle('scrolled', scrolled);
        header.style.boxShadow = scrolled
          ? '0 8px 30px rgba(4,22,61,.14)'
          : '0 2px 12px rgba(11,61,145,.08)';
      };
      window.addEventListener('scroll', function() {
        if (!headerTicking) {
          window.requestAnimationFrame(function() {
            updateHeader();
            headerTicking = false;
          });
          headerTicking = true;
        }
      }, { passive: true });
      updateHeader();
    }

    /* ===== Formulario de contacto ===== */
    var contactForm = document.getElementById('contactForm');
    var formNote = document.getElementById('formNote');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        if (!contactForm.checkValidity()) {
          e.preventDefault();
          contactForm.reportValidity();
          if (formNote) {
            formNote.textContent = 'Por favor completa todos los campos requeridos.';
            formNote.className = 'form-note error';
          }
          return;
        }
        if (formNote) {
          formNote.textContent = 'Enviando mensaje...';
          formNote.className = 'form-note';
        }
      });
    }

    /* =========================================================
       YOUTUBE AUTO-UPDATE (feed RSS)
       ========================================================= */
    var CHANNEL_ID = 'UCrrGRL_XdPleFjWNAa0-Dhg';        // Canal oficial del Pastor Javier

    function buildFeedUrls(channelId) {
      var feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId;
      return {
        feedUrl: feedUrl,
        rss2json: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl),
        allorigins: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(feedUrl)
      };
    }

    // Obtiene los items del feed oficial de un canal de YouTube.
    // Cascada: rss2json (JSON) → XML crudo oficial vía allorigins.
    function fetchFeed(channelId) {
      var urls = buildFeedUrls(channelId);
      return fetchWithTimeout(urls.rss2json, 10000)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!data || data.status !== 'ok' || !Array.isArray(data.items) || !data.items.length) {
            throw new Error('rss2json sin items');
          }
          return data.items;
        })
        .catch(function() {
          return fetchWithTimeout(urls.allorigins, 10000)
            .then(function(r) { return r.text(); })
            .then(function(txt) {
              var items = parseRssXml(txt);
              if (!items.length) throw new Error('feed XML vacío');
              return items;
            });
        });
    }

    function fetchWithTimeout(url, ms) {
      var controller = null, timeoutId = null;
      try {
        controller = new AbortController();
        timeoutId = setTimeout(function() { controller.abort(); }, ms);
      } catch (_) {}
      var opts = controller ? { signal: controller.signal } : {};
      return fetch(url, opts).then(function(r) {
        if (timeoutId) clearTimeout(timeoutId);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r;
      });
    }

    // Parsea el XML oficial del feed de YouTube (fallback sin dependencia de rss2json)
    function parseRssXml(xmlText) {
      var items = [];
      try {
        var doc = new DOMParser().parseFromString(xmlText, 'text/xml');
        var entries = doc.getElementsByTagName('entry');
        for (var i = 0; i < entries.length; i++) {
          var en = entries[i];
          var linkEl = en.getElementsByTagName('link')[0];
          var titleEl = en.getElementsByTagName('title')[0];
          var vidEl = en.getElementsByTagName('yt:videoId')[0];
          var vidTxt = vidEl ? vidEl.textContent.trim() : '';
          items.push({
            link: (linkEl && linkEl.getAttribute('href')) || (vidTxt ? 'https://www.youtube.com/watch?v=' + vidTxt : ''),
            guid: vidTxt,
            title: titleEl ? titleEl.textContent : ''
          });
        }
      } catch (_) {}
      return items;
    }

    // Clasifica un item del feed: 'live' | 'short' | 'video'.
    // El RSS oficial de YouTube distingue los Shorts por la URL
    // (/shorts/VIDEO_ID) y las transmisiones por el título.
    function classifyFeedItem(item) {
      var link = item.link || item.guid || '';
      var title = item.title || '';
      if (/\/shorts\//i.test(link)) return 'short';
      if (/en\s+vivo/i.test(title) || /live/i.test(title)) return 'live';
      return 'video';
    }

    // Fecha relativa en español: "hace 2 h", "hace 3 días", "19 nov 2026"
    function relativeDate(pubDate) {
      if (!pubDate) return '';
      var d = new Date(pubDate);
      if (isNaN(d.getTime())) return '';
      var diff = Date.now() - d.getTime();
      var mins = Math.floor(diff / 60000);
      if (mins < 1) return 'ahora mismo';
      if (mins < 60) return 'hace ' + mins + ' min';
      var hours = Math.floor(mins / 60);
      if (hours < 24) return 'hace ' + hours + ' h';
      var days = Math.floor(hours / 24);
      if (days < 7) return 'hace ' + days + (days === 1 ? ' día' : ' días');
      try {
        return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (_) { return ''; }
    }

    function feedItemTitle(item) {
      return (item.title || '').replace(/#\S+/g, '').trim() || 'Predicación';
    }

    function buildFeedCard(item, kind) {
      var v = extractVid(item.link || item.guid);
      if (!v) return '';
      var t = feedItemTitle(item);
      var href = kind === 'short'
        ? 'https://www.youtube.com/shorts/' + v
        : 'https://www.youtube.com/watch?v=' + v;
      var badge = '';
      if (kind === 'short') badge = '<span class="yt-badge yt-badge--short">Short</span>';
      if (kind === 'live') badge = '<span class="yt-badge yt-badge--live"><span class="yt-badge-dot" aria-hidden="true"></span>EN VIVO</span>';
      var date = relativeDate(item.pubDate || item.published);
      return '<a href="' + href + '" target="_blank" rel="noopener noreferrer" class="yt-card-video" data-vid="' + v + '" data-kind="' + kind + '">' +
        '<div class="yt-thumb">' +
        '<img src="https://i.ytimg.com/vi/' + v + '/hqdefault.jpg" alt="' + escapeHtml(t) +
        '" loading="lazy" decoding="async" width="480" height="360"/>' + badge +
        '<span class="yt-play" aria-hidden="true"><i class="fas fa-play"></i></span>' +
        '</div>' +
        '<h4>' + escapeHtml(truncate(t, 80)) + '</h4>' +
        (date ? '<p class="yt-date"><i class="far fa-clock" aria-hidden="true"></i> ' + escapeHtml(date) + '</p>' : '') +
        '</a>';
    }

    // Filtros Todos / Videos / Shorts / En vivo (también valen para
    // las tarjetas estáticas de respaldo, que llevan data-kind).
    var currentYtFilter = 'all';
    function applyYtFilter(filter) {
      currentYtFilter = filter;
      if (!ytGrid) return;
      ytGrid.querySelectorAll('.yt-card-video').forEach(function(card) {
        var kind = card.getAttribute('data-kind') || 'video';
        card.style.display = (filter === 'all' || kind === filter) ? '' : 'none';
      });
      document.querySelectorAll('.yt-filter-btn').forEach(function(b) {
        var active = b.getAttribute('data-filter') === filter;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      var visible = ytGrid.querySelectorAll('.yt-card-video:not([style*="none"])').length;
      var empty = document.getElementById('ytEmpty');
      if (empty) empty.hidden = visible > 0;
    }

    document.querySelectorAll('.yt-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        applyYtFilter(btn.getAttribute('data-filter'));
      });
    });

    function applyFeedItems(items) {
      if (!items || !items.length) return;
      var classified = items.map(function(it) {
        return { item: it, kind: classifyFeedItem(it) };
      });

      // Destacado: primero una transmisión en vivo si la hay, si no
      // el video normal más reciente (nunca un Short vertical).
      var featured = classified.filter(function(c) { return c.kind === 'live'; })[0] ||
                    classified.filter(function(c) { return c.kind === 'video'; })[0] ||
                    classified[0];
      var vid = extractVid(featured.item.link || featured.item.guid);
      if (vid && ytPlayerWrap) {
        var currentVid = currentPlayerVid();
        // Sólo recargamos si el video destacado cambió
        if (vid !== currentVid) {
          var preferNocookie = IS_FILE_PROTOCOL || !IS_HTTPS;
          replaceIframeWithNew(vid, { attempt: 1, useNocookie: preferNocookie, autoplay: false });
        }
      }
      if (ytMainTitle) ytMainTitle.textContent = feedItemTitle(featured.item);

      if (ytGrid) {
        ytGrid.innerHTML = classified.map(function(c) {
          return buildFeedCard(c.item, c.kind);
        }).join('') +
        '<p class="yt-empty" id="ytEmpty" hidden>No hay videos en esta categoría por ahora.</p>';
        applyYtFilter(currentYtFilter);
      }
    }

    /* =========================================================
       ============ SISTEMA EN VIVO (v13) ============
       - Suscriptores y videos de YouTube: API pública
         SocialCounts (sin clave) para los dos canales.
       - Feed de videos: RSS oficial vía rss2json (con
         respaldo allorigins), clasificado en video/short/vivo.
       - Transmisión en vivo: página /live del canal vía
         allorigins; sólo se muestra el banner si YouTube
         confirma que hay una transmisión activa.
       - Fotos destacadas: assets/galeria/destacadas.json
         (mismo origen). Si el archivo no existe o la red
         falla, la galería queda en su orden estático.
       - Caché local (localStorage, 15 min): la página muestra
         los últimos datos guardados al instante y luego los
         refresca en segundo plano. Si todo falla, quedan los
         datos estáticos del HTML y de SOCIAL_STATS.
       ========================================================= */
    var LIVE_CACHE_KEY = 'jemaf_live_cache_v1';
    var LIVE_CACHE_TTL = 15 * 60 * 1000;
    var YT_CHANNELS = {
      pastorJavier: { id: 'UCrrGRL_XdPleFjWNAa0-Dhg', handle: '@Profetajavierbelliard' },
      pastoraMarnie: { id: 'UCv4mZWLz5ZBHLEkT3ycC9fA', handle: '@profetaMarnieBelliard' }
    };

    function loadLiveCache() {
      try {
        var raw = window.localStorage && localStorage.getItem(LIVE_CACHE_KEY);
        if (!raw) return null;
        var data = JSON.parse(raw);
        if (!data || !data.ts || (Date.now() - data.ts) > LIVE_CACHE_TTL) return null;
        return data;
      } catch (_) { return null; }
    }

    function saveLiveCache(patch) {
      try {
        if (!window.localStorage) return;
        var data = loadLiveCache() || {};
        Object.keys(patch).forEach(function(k) { data[k] = patch[k]; });
        data.ts = Date.now();
        localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(data));
      } catch (_) {}
    }

    // Marca visible de última actualización (hora local del visitante)
    function updateLiveTimestamp(ok) {
      var el = document.getElementById('liveUpdated');
      if (!el) return;
      var hora = '';
      try {
        hora = new Date().toLocaleString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      } catch (_) { hora = ''; }
      if (ok) {
        el.innerHTML = '<i class="fas fa-circle-check" aria-hidden="true"></i> Contenido actualizado en vivo · ' + escapeHtml(hora) +
          ' · YouTube en vivo · Instagram, TikTok y Facebook con cifras de referencia.';
      } else {
        el.innerHTML = '<i class="fas fa-info-circle" aria-hidden="true"></i> Mostrando la última información guardada · ' + escapeHtml(hora) +
          ' · YouTube se actualizará solo cuando vuelva la conexión.';
      }
    }

    // Contadores de YouTube en vivo (SocialCounts, sin clave).
    // Devuelve { subscribers, videos, views } o null si falla.
    function fetchYouTubeStats(channelId) {
      return fetchWithTimeout('https://api.socialcounts.org/youtube-live-subscriber-count/' + channelId, 10000)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var c = (data && data.counters && (data.counters.api || data.counters.estimation)) || null;
          if (!c || typeof c.subscriberCount !== 'number') throw new Error('SocialCounts sin datos');
          return { subscribers: c.subscriberCount, videos: c.videoCount, views: c.viewCount };
        });
    }

    function updateYouTubeStats() {
      if (!('fetch' in window)) return Promise.resolve(false);
      var done = 0;
      var jobs = Object.keys(YT_CHANNELS).map(function(key) {
        return fetchYouTubeStats(YT_CHANNELS[key].id)
          .then(function(s) {
            if (key === 'pastorJavier') {
              if (s.subscribers) SOCIAL_STATS.pastorJavier.youtube.count = s.subscribers;
              if (s.videos) SOCIAL_STATS.pastorJavier.ytVideos.count = s.videos;
            } else if (key === 'pastoraMarnie') {
              if (s.subscribers) SOCIAL_STATS.pastoraMarnie.youtube.count = s.subscribers;
            }
            done++;
            return true;
          })
          .catch(function(err) {
            console.info('[YT] Contadores en vivo no disponibles para ' + key + ':', err && err.message || err);
            return false;
          });
      });
      return Promise.all(jobs).then(function(results) {
        var anyOk = results.some(function(r) { return r; });
        if (anyOk) {
          renderSocialStats();
          document.body.classList.add('stats-live');
          saveLiveCache({ stats: {
            javierSubs: SOCIAL_STATS.pastorJavier.youtube.count,
            javierVideos: SOCIAL_STATS.pastorJavier.ytVideos.count,
            marnieSubs: SOCIAL_STATS.pastoraMarnie.youtube.count
          }});
        }
        return anyOk;
      });
    }

    // ¿Hay una transmisión en vivo ahora mismo en el canal principal?
    // Lee la página /live de YouTube vía allorigins y busca la marca
    // "isLive":true junto a un videoId. Sin transmisión, no hay banner.
    function checkLiveNow() {
      if (!('fetch' in window)) return Promise.resolve(null);
      var url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.youtube.com/@Profetajavierbelliard/live');
      return fetchWithTimeout(url, 12000)
        .then(function(r) { return r.text(); })
        .then(function(html) {
          if (!html || html.indexOf('"isLive":true') === -1) return null;
          var idx = html.indexOf('"isLive":true');
          var window_txt = html.slice(Math.max(0, idx - 4000), idx + 4000);
          var m = window_txt.match(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/);
          if (!m) return null;
          var titleMatch = window_txt.match(/"title"\s*:\s*\{\s*"simpleText"\s*:\s*"([^"]+)"/);
          return { vid: m[1], title: titleMatch ? titleMatch[1] : 'Transmisión en vivo del Pastor Javier Belliard' };
        })
        .catch(function(err) {
          console.info('[YT] No se pudo comprobar la transmisión en vivo:', err && err.message || err);
          return null;
        });
    }

    function showLiveBanner(live) {
      var banner = document.getElementById('liveBanner');
      var liveBtn = document.querySelector('.yt-ch-btn.live');
      if (!banner) return;
      if (!live) {
        banner.hidden = true;
        if (liveBtn) {
          liveBtn.classList.remove('is-live');
          var s = liveBtn.querySelector('div span');
          if (s) s.textContent = 'Transmisiones de servicios';
        }
        return;
      }
      banner.hidden = false;
      var titleEl = document.getElementById('liveBannerTitle');
      if (titleEl) titleEl.textContent = live.title;
      var btn = document.getElementById('liveBannerBtn');
      if (btn) btn.href = 'https://www.youtube.com/watch?v=' + live.vid;
      if (liveBtn) {
        liveBtn.classList.add('is-live');
        liveBtn.href = 'https://www.youtube.com/watch?v=' + live.vid;
        var strong = liveBtn.querySelector('div strong');
        if (strong) strong.textContent = 'EN VIVO AHORA';
        var span = liveBtn.querySelector('div span');
        if (span) span.textContent = live.title;
      }
      // El reproductor destacado pasa a la transmisión (sin autoplay).
      if (ytPlayerWrap && currentPlayerVid() !== live.vid) {
        var preferNocookie = IS_FILE_PROTOCOL || !IS_HTTPS;
        replaceIframeWithNew(live.vid, { attempt: 1, useNocookie: preferNocookie, autoplay: false });
        if (ytMainTitle) ytMainTitle.textContent = live.title;
      }
    }

    // Fotos destacadas: lee assets/galeria/destacadas.json y pone esas
    // fotos primero en el carrusel de oraciones, con insignia.
    // Si el JSON no existe o falla, la galería queda como está.
    function loadFeaturedPhotos() {
      if (!('fetch' in window)) return Promise.resolve(false);
      return fetchWithTimeout('assets/galeria/destacadas.json', 5000)
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          var list = (data && data.destacadas) || [];
          if (!list.length) return false;
          var carousel = document.getElementById('prayerCarousel');
          if (!carousel) return false;
          var featuredHtml = '';
          var seen = {};
          list.forEach(function(f) {
            if (!f || !f.src) return;
            seen[f.src] = true;
            var icon = f.icon || 'fa-star';
            var caption = f.caption || '';
            var alt = f.alt || caption || 'Foto destacada';
            featuredHtml += '<div class="prayer-slide prayer-slide--featured">' +
              '<img src="' + escapeHtml(f.src) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async" />' +
              '<span class="featured-badge" aria-hidden="true"><i class="fas fa-star"></i> Destacada</span>' +
              '<div class="prayer-caption"><i class="fas ' + escapeHtml(icon) + '" aria-hidden="true"></i><span>' + escapeHtml(caption) + '</span></div>' +
              '</div>';
          });
          // Quitar de la galería estática las fotos que ahora son destacadas
          // (evita duplicados) y poner las destacadas al principio.
          carousel.querySelectorAll('.prayer-slide').forEach(function(slide) {
            var img = slide.querySelector('img');
            if (img && seen[img.getAttribute('src')]) slide.parentNode.removeChild(slide);
          });
          carousel.querySelectorAll('.prayer-slide').forEach(function(slide, i) {
            slide.classList.toggle('active', i === 0 && !featuredHtml);
          });
          carousel.insertAdjacentHTML('afterbegin', featuredHtml);
          carousel.querySelectorAll('.prayer-slide').forEach(function(slide, i) {
            slide.classList.toggle('active', i === 0);
          });
          return true;
        })
        .catch(function(err) {
          console.info('[Fotos] Sin lista de destacadas, galería estática:', err && err.message || err);
          return false;
        });
    }

    function updateYouTubeFeed() {
      if (!('fetch' in window)) return Promise.resolve(false);
      return fetchFeed(CHANNEL_ID)
        .then(function(items) {
          applyFeedItems(items.slice(0, 12));
          saveLiveCache({ feed: items.slice(0, 12) });
          return true;
        })
        .catch(function(err) {
          console.info('[YT] Feed live no disponible, usando tarjetas estáticas.', err && err.message || err);
          return false;
        });
    }

    // Un solo ciclo de actualización en vivo: feed + contadores + live.
    function runLiveCycle() {
      var feedOk = false, statsOk = false;
      return updateYouTubeFeed()
        .then(function(ok) { feedOk = ok; return updateYouTubeStats(); })
        .then(function(ok) { statsOk = ok; return checkLiveNow(); })
        .then(function(live) {
          showLiveBanner(live);
          updateLiveTimestamp(feedOk || statsOk);
        })
        .catch(function() { updateLiveTimestamp(false); });
    }

    // Caché instantánea al cargar (si tiene menos de 15 min), y luego
    // refresco en segundo plano sin recargar la página.
    (function applyLiveCache() {
      var cache = loadLiveCache();
      if (!cache) return;
      if (cache.stats) {
        if (cache.stats.javierSubs) SOCIAL_STATS.pastorJavier.youtube.count = cache.stats.javierSubs;
        if (cache.stats.javierVideos) SOCIAL_STATS.pastorJavier.ytVideos.count = cache.stats.javierVideos;
        if (cache.stats.marnieSubs) SOCIAL_STATS.pastoraMarnie.youtube.count = cache.stats.marnieSubs;
        renderSocialStats();
      }
      if (cache.feed && cache.feed.length) {
        try { applyFeedItems(cache.feed); } catch (_) {}
      }
    })();

    runLiveCycle();
    var ytInterval = setInterval(runLiveCycle, 15 * 60 * 1000);

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        clearInterval(ytInterval);
      } else {
        ytInterval = setInterval(runLiveCycle, 15 * 60 * 1000);
        runLiveCycle();
      }
    });

    /* ===== Manejo de errores de imágenes (miniaturas, cadena de respaldo) =====
       maxresdefault → sddefault → hqdefault → mqdefault */
    var THUMB_FALLBACK = { maxresdefault: 'sddefault', sddefault: 'hqdefault', hqdefault: 'mqdefault' };
    document.addEventListener('error', function(e) {
      var t = e.target;
      if (!t || t.tagName !== 'IMG') return;
      var src = t.src || '';
      var m = src.match(/i\.ytimg\.com\/vi\/([^\/]+)\/([a-z]+default)\.jpg/);
      if (!m) return;
      var next = THUMB_FALLBACK[m[2]];
      if (next) t.src = 'https://i.ytimg.com/vi/' + m[1] + '/' + next + '.jpg';
    }, true);

    /* =========================================================
       CARRUSELES DE FOTOS CON ROTACIÓN AUTOMÁTICA (v8)
       - Fotos REALES de alta calidad de cada pastor (fotografías
         publicadas en sus redes oficiales; NO miniaturas de video).
       - Cuadro de Oraciones y Personas: slideshow con captions.
       - Las fotos son fijas y curadas manualmente; ya no se
         reemplazan por miniaturas de videos de YouTube.
       ========================================================= */

    // Fábrica de sliders: rota solo, pausa cuando está fuera de pantalla
    // o cuando la pestaña está oculta, y permite refrescar sus fotos.
    function createSlider(rootEl, slideSelector, dotsEl, intervalMs, clickable) {
      var slides = [], dots = [], current = 0, timer = null;

      function collect() {
        slides = Array.prototype.slice.call(rootEl.querySelectorAll(slideSelector));
        dots = [];
        if (dotsEl) {
          dotsEl.innerHTML = '';
          slides.forEach(function(s, i) {
            var d = document.createElement('span');
            if (i === current) d.classList.add('active');
            if (clickable) {
              d.setAttribute('role', 'button');
              d.setAttribute('aria-label', 'Ver foto ' + (i + 1));
              d.addEventListener('click', function() { goTo(i); restart(); });
            }
            dotsEl.appendChild(d);
            dots.push(d);
          });
        }
      }

      function goTo(i) {
        if (!slides.length) return;
        current = ((i % slides.length) + slides.length) % slides.length;
        slides.forEach(function(s, idx) { s.classList.toggle('active', idx === current); });
        dots.forEach(function(d, idx) { d.classList.toggle('active', idx === current); });
      }

      function restart() {
        if (timer) clearInterval(timer);
        if (!document.hidden) timer = setInterval(function() { goTo(current + 1); }, intervalMs);
      }

      function pause() {
        if (timer) { clearInterval(timer); timer = null; }
      }

      collect();

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function(entries) {
          entries.forEach(function(en) {
            if (en.isIntersecting) restart();
            else pause();
          });
        }, { threshold: 0.2 });
        io.observe(rootEl);
      } else {
        restart();
      }

      document.addEventListener('visibilitychange', function() {
        if (document.hidden) pause(); else restart();
      });

      return {
        setSlides: function(html) {
          rootEl.innerHTML = html;
          current = 0;
          collect();
          goTo(0);
        }
      };
    }

    // Las fotos destacadas se cargan primero (con tiempo límite de
    // 1,5 s para no retrasar la página) y luego se crean los
    // carruseles sobre el orden final de las fotos.
    var carouselJavierEl = document.getElementById('carouselJavier');
    var carouselMarnieEl = document.getElementById('carouselMarnie');
    var prayerCarouselEl = document.getElementById('prayerCarousel');

    function initSliders() {
      if (carouselJavierEl) createSlider(carouselJavierEl, '.pc-slide', document.getElementById('dotsJavier'), 5000, false);
      if (carouselMarnieEl) createSlider(carouselMarnieEl, '.pc-slide', document.getElementById('dotsMarnie'), 5000, false);
      if (prayerCarouselEl) createSlider(prayerCarouselEl, '.prayer-slide', document.getElementById('prayerDots'), 6000, true);
    }

    var featuredReady = loadFeaturedPhotos();
    if (featuredReady && typeof featuredReady.then === 'function') {
      var featuredTimeout = new Promise(function(resolve) {
        setTimeout(function() { resolve(false); }, 1500);
      });
      Promise.race([featuredReady, featuredTimeout]).then(function() { initSliders(); });
    } else {
      initSliders();
    }

    // NOTA (v13): Las fotos destacadas de los pastores y de la
    // galería son fotografías reales fijas (curadas desde sus
    // redes oficiales). El orden de la galería de oraciones se
    // puede actualizar sin tocar el HTML: basta con editar
    // assets/galeria/destacadas.json (ver README). Se eliminó
    // la auto-actualización que las reemplazaba por miniaturas
    // de videos de YouTube.

    /* ===== Aviso de contexto file:// (sólo desarrollo local) ===== */
    if (IS_FILE_PROTOCOL) {
      console.info(
        '%c[JEMAF] Estás abriendo el sitio como archivo local (file://).\n' +
        'Algunos navegadores bloquean iframes de YouTube en este modo.\n' +
        'Al desplegar en tu dominio (https://) los videos se reproducirán normalmente.',
        'background:#0b3d91;color:#fff;padding:6px 10px;border-radius:4px;font-weight:bold;'
      );
    }

  }); // end ready

})();
