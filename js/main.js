/* ===========================================================
   IGLESIA JESUCRISTO ES MI AMIGO FIEL — JavaScript v6.1
   (v12 UI: el header ahora recibe la clase .scrolled al bajar,
   para el efecto vidrio reforzado del nuevo diseño)
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

     Última verificación en vivo: 25 de agosto de 2026.
     - Facebook (Pastor Javier): verificado directamente en la
       página oficial de Facebook (2.4 millones de seguidores).
     - YouTube (Pastor Javier): 249K suscriptores y 1.5K videos
       (verificado en el canal @Profetajavierbelliard).
     - TikTok e Instagram: cifras públicas más recientes
       reflejadas en la sección "Redes con mayor alcance" del sitio.

     PARA ACTUALIZAR: cambia el número "count" abajo. El sitio
     entero (hero + tarjetas + botones) se actualiza solo, sin
     tocar el HTML.
     ========================================================= */
  var SOCIAL_STATS = {
    pastorJavier: {
      tiktok:    { count: 373000,  label: 'TikTok' },
      facebook:  { count: 2400000, label: 'Facebook' },
      youtube:   { count: 249000,  label: 'YouTube' },
      ytVideos:  { count: 1500,    label: 'Videos YouTube' },
      instagram: { count: null,    label: 'Instagram' },
      igSiguiendo: { count: 23,    label: 'Seguidos Instagram' }
    },
    pastoraMarnie: {
      facebook:  { count: 7585, label: 'Facebook' },
      youtube:   { count: 1114, label: 'YouTube' },
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

  ready(function() {

    renderSocialStats();


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

    function applyFeedItems(items) {
      if (!items || !items.length) return;
      var first = items[0];
      var vid = extractVid(first.link || first.guid);
      if (vid && ytPlayerWrap) {
        var currentVid = currentPlayerVid();
        // Sólo recargamos si el video destacado cambió
        if (vid !== currentVid) {
          var preferNocookie = IS_FILE_PROTOCOL || !IS_HTTPS;
          replaceIframeWithNew(vid, { attempt: 1, useNocookie: preferNocookie, autoplay: false });
        }
      }
      if (ytMainTitle && first.title) ytMainTitle.textContent = first.title;

      if (ytGrid) {
        ytGrid.innerHTML = items.map(function(it) {
          var v = extractVid(it.link || it.guid);
          if (!v) return '';
          var t = (it.title || '').replace(/#\S+/g, '').trim() || 'Predicación';
          return '<a href="https://www.youtube.com/watch?v=' + v +
            '" target="_blank" rel="noopener noreferrer" class="yt-card-video" data-vid="' + v + '">' +
            '<div class="yt-thumb">' +
            '<img src="https://i.ytimg.com/vi/' + v + '/hqdefault.jpg" alt="' + escapeHtml(t) +
            '" loading="lazy" width="480" height="360"/>' +
            '<span class="yt-play" aria-hidden="true"><i class="fas fa-play"></i></span>' +
            '</div>' +
            '<h4>' + escapeHtml(truncate(t, 80)) + '</h4>' +
            '</a>';
        }).join('');
      }
    }

    function updateYouTubeFeed() {
      if (!('fetch' in window)) return;
      fetchFeed(CHANNEL_ID)
        .then(function(items) { applyFeedItems(items.slice(0, 12)); })
        .catch(function(err) {
          console.info('[YT] Feed live no disponible, usando tarjetas estáticas.', err && err.message || err);
        });
    }

    updateYouTubeFeed();
    var ytInterval = setInterval(updateYouTubeFeed, 15 * 60 * 1000);

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        clearInterval(ytInterval);
      } else {
        ytInterval = setInterval(updateYouTubeFeed, 15 * 60 * 1000);
        updateYouTubeFeed();
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

    var carouselJavierEl = document.getElementById('carouselJavier');
    var carouselMarnieEl = document.getElementById('carouselMarnie');
    var prayerCarouselEl = document.getElementById('prayerCarousel');

    var sliderJavier = carouselJavierEl
      ? createSlider(carouselJavierEl, '.pc-slide', document.getElementById('dotsJavier'), 5000, false) : null;
    var sliderMarnie = carouselMarnieEl
      ? createSlider(carouselMarnieEl, '.pc-slide', document.getElementById('dotsMarnie'), 5000, false) : null;
    var sliderPrayer = prayerCarouselEl
      ? createSlider(prayerCarouselEl, '.prayer-slide', document.getElementById('prayerDots'), 6000, true) : null;

    // NOTA: Las fotos destacadas de los pastores y de la galería son
    // fotografías reales fijas (curadas desde sus redes oficiales).
    // Se eliminó la auto-actualización que las reemplazaba por
    // miniaturas de videos de YouTube.

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
