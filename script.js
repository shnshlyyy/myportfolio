/* ---- Typing animation (self-contained so nothing else can break it) ---- */
(function() {
  function startTyping() {
    var el = document.getElementById('roleText');
    if (!el) return;

    var roles = ['BSIT Student', 'Web Developer', 'Aspiring Software Engineer', 'Problem Solver'];
    var ri = 0, ci = 0, deleting = false;

    function tick() {
      var word = roles[ri];
      if (!deleting) {
        ci++;
        el.textContent = word.slice(0, ci);
        if (ci >= word.length) { deleting = true; setTimeout(tick, 1400); return; }
      } else {
        ci--;
        el.textContent = word.slice(0, ci);
        if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; }
      }
      setTimeout(tick, deleting ? 45 : 95);
    }
    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTyping);
  } else {
    startTyping();
  }
})();

(function() {
    // Dark / light mode toggle
    var root = document.documentElement;
    var themeBtn = document.getElementById('themeBtn');
    var siteLogo = document.getElementById('siteLogo');
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var current = stored || (prefersDark ? 'dark' : 'light');

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      siteLogo.src = theme === 'dark' ? 'assets/logo_light.png' : 'assets/logo_dark.png';
    }
    applyTheme(current);

    themeBtn.addEventListener('click', function() {
      current = current === 'dark' ? 'light' : 'dark';
      applyTheme(current);
      try { localStorage.setItem('theme', current); } catch (e) {}
    });
  })();

  (function() {
    var btn = document.getElementById('menuBtn');
    var links = document.getElementById('navlinks');
    btn.addEventListener('click', function() {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        links.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Native smooth in-page navigation that clears the fixed header.
    document.querySelectorAll('.navlinks a, .footer-nav a, .logo, .footer-logo').forEach(function(link) {
      link.addEventListener('click', function(event) {
        var hash = link.getAttribute('href');
        if (!hash || hash.charAt(0) !== '#') return;
        var target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        var header = document.querySelector('header');
        var headerHeight = header ? header.getBoundingClientRect().height : 0;
        var destination = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight);

        var start = window.scrollY;
        var distance = destination - start;
        var duration = Math.min(1600, Math.max(900, Math.abs(distance) * 0.55));
        var startedAt = performance.now();

        function easeInOutCubic(progress) {
          return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        }

        function animateScroll(now) {
          var progress = Math.min((now - startedAt) / duration, 1);
          window.scrollTo(0, start + distance * easeInOutCubic(progress));
          if (progress < 1) requestAnimationFrame(animateScroll);
        }

        requestAnimationFrame(animateScroll);

        if (window.location.hash !== hash) history.pushState(null, '', hash);
      });
    });

    // Contact form
    var form = document.getElementById('contactForm');
    var note = document.getElementById('formNote');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        note.textContent = 'Sending…';
        note.className = 'form-note';
        var data = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(function(res) {
          if (res.ok) {
            note.textContent = "Thanks! Your message has been sent.";
            note.className = 'form-note success';
            form.reset();
          } else {
            note.textContent = "Something went wrong. Please email me directly instead.";
            note.className = 'form-note';
          }
        }).catch(function() {
          note.textContent = "Couldn't send right now — please email me directly instead.";
          note.className = 'form-note';
        });
      });
    }

    // Scroll-reveal + staggered children + animated skill bars
    var revealEls = document.querySelectorAll('.reveal, .stagger');
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el) { io.observe(el); });

    // Scroll progress bar + parallax + hero fade (single rAF loop)
    var bar = document.getElementById('scrollBar');
    var header = document.querySelector('header');
    var blob = document.querySelector('.hero-blob');
    var heroInner = document.querySelector('.hero-inner');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // eased (lerped) scroll-driven values so parallax/fade trail the scroll
    // smoothly instead of snapping to it frame-by-frame
    var smoothY = window.scrollY || 0;
    var loopRunning = false;

    function renderScrollEffects() {
      var h = document.documentElement;
      var rawY = h.scrollTop;
      var max = h.scrollHeight - h.clientHeight;

      // progress bar tracks the raw position directly (should feel exact)
      bar.style.width = (max > 0 ? (rawY / max) * 100 : 0) + '%';
      if (header) header.classList.toggle('is-scrolled', rawY > 12);

      if (reduce) {
        smoothY = rawY;
      } else {
        // ease toward the real scroll position each frame
        smoothY += (rawY - smoothY) * 0.12;
        if (Math.abs(rawY - smoothY) < 0.05) smoothY = rawY;

        // parallax: blob drifts slower than the page
        if (blob) blob.style.transform = 'translateY(' + (smoothY * 0.25) + 'px)';

        // hero copy gently lifts and fades as it scrolls away
        if (heroInner) {
          var vh = window.innerHeight;
          var p = Math.min(smoothY / (vh * 0.8), 1);
          heroInner.style.opacity = String(1 - p * 0.85);
          heroInner.style.transform = 'translateY(' + (p * -40) + 'px)';
        }
      }

      if (!reduce && Math.abs(rawY - smoothY) > 0.05) {
        requestAnimationFrame(renderScrollEffects);
      } else {
        loopRunning = false;
      }
    }

    function requestScrollRender() {
      if (!loopRunning) { loopRunning = true; requestAnimationFrame(renderScrollEffects); }
    }

    window.addEventListener('scroll', requestScrollRender, { passive: true });
    window.addEventListener('resize', requestScrollRender, { passive: true });
    requestScrollRender();

    // Active nav link highlighting
    var sections = document.querySelectorAll('main section[id]');
    var navMap = {};
    document.querySelectorAll('.navlinks a').forEach(function(a) {
      navMap[a.getAttribute('href').slice(1)] = a;
    });
    var navIO = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var link = navMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(navMap).forEach(function(k) { navMap[k].classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });
    sections.forEach(function(s) { navIO.observe(s); });
  })();
