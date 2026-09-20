(function() {
  function startTyping() {
    var el = document.getElementById('roleText');
    if (!el) return;

    var roles = ['BSIT Student', 'Web Developer', 'Aspiring Software Engineer', 'Problem Solver'];
    var ri = 0, ci = 0, deleting = false;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) { el.textContent = roles[0]; return; }

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
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var current = stored || (prefersDark ? 'dark' : 'light');

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
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
          var bars = entry.target.querySelectorAll('.bar-fill');
          bars.forEach(function(b, i) {
            setTimeout(function() {
              b.style.width = b.getAttribute('data-pct') + '%';
            }, i * 90);
          });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el) { io.observe(el); });

    // Scroll progress bar + parallax + hero fade (single rAF loop)
    var bar = document.getElementById('scrollBar');
    var blob = document.querySelector('.hero-blob');
    var heroInner = document.querySelector('.hero-inner');
    var avatar = document.querySelector('.avatar-mark');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ticking = false;

    function onScroll() {
      var h = document.documentElement;
      var y = h.scrollTop;
      var max = h.scrollHeight - h.clientHeight;

      // progress bar
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

      if (!reduce) {
        // parallax: blob drifts slower than the page
        if (blob) blob.style.transform = 'translateY(' + (y * 0.25) + 'px)';

        // hero copy gently lifts and fades as it scrolls away
        if (heroInner) {
          var vh = window.innerHeight;
          var p = Math.min(y / (vh * 0.8), 1);
          heroInner.style.opacity = String(1 - p * 0.85);
          heroInner.style.transform = 'translateY(' + (p * -40) + 'px)';
        }

        // avatar counter-drifts for depth
        if (avatar) {
          var r = avatar.getBoundingClientRect();
          var off = (window.innerHeight / 2 - (r.top + r.height / 2)) * 0.05;
          avatar.style.transform = 'translateY(' + off + 'px)';
        }
      }
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

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
