/* =========================================================
   Francisco's House Cleaning Services — interactions
   Vanilla JS, no dependencies, no external calls.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- current year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- mobile navigation ---------------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
  }

  function toggleNav() {
    if (!nav || !burger) return;
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }

  if (burger) burger.addEventListener('click', toggleNav);

  if (nav) {
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link) closeNav();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 960) closeNav();
  });

  /* ---------------- sticky header shadow ---------------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- scroll reveal ---------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children).filter(function (c) {
          return c.classList.contains('reveal');
        }) : [];
        var index = siblings.indexOf(el);
        el.style.transitionDelay = (index > 0 ? Math.min(index, 6) * 70 : 0) + 'ms';
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- animated stat counters ---------------- */
  var statsWrap = document.getElementById('stats');

  function formatStat(value, suffix) {
    return value.toLocaleString('en-US') + suffix;
  }

  function runCounters() {
    var nums = Array.prototype.slice.call(statsWrap.querySelectorAll('.stats__num'));
    nums.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;
      var duration = 1400;
      var start = null;

      function tick(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatStat(Math.round(target * eased), suffix);
        if (progress < 1) window.requestAnimationFrame(tick);
      }
      el.textContent = formatStat(0, suffix);
      window.requestAnimationFrame(tick);
    });
  }

  if (statsWrap && !reduceMotion && 'IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounters();
        obs.disconnect();
      });
    }, { threshold: 0.4 });
    statObserver.observe(statsWrap);
  }

  /* ---------------- active nav link on scroll ---------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------------- FAQ: one open at a time ---------------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq__list .qa'));
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------------- estimate form -> mailto ---------------- */
  var form = document.getElementById('estimate-form');
  var status = document.getElementById('form-status');

  function setStatus(message, ok) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ok', !!ok);
    status.classList.toggle('is-err', !ok);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var email = form.elements.email.value.trim();
      var service = form.elements.service.value;
      var city = form.elements.city.value.trim();
      var message = form.elements.message.value.trim();

      form.elements.name.setAttribute('aria-invalid', name ? 'false' : 'true');
      form.elements.phone.setAttribute('aria-invalid', phone ? 'false' : 'true');

      if (!name || !phone) {
        setStatus('Please add your name and a phone number so we can send your estimate.', false);
        (name ? form.elements.phone : form.elements.name).focus();
        return;
      }

      var lines = [
        'Name: ' + name,
        'Phone: ' + phone,
        'Email: ' + (email || '—'),
        'Service: ' + service,
        'City: ' + (city || '—'),
        '',
        'Details:',
        message || '—',
        '',
        '— Sent from franciscoshousescleaningservices.com'
      ];

      var subject = 'Free estimate request — ' + service + (city ? ' (' + city + ')' : '');
      var href =
        'mailto:siscuculfrancisco@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = href;
      setStatus('Opening your email app with the details ready to send. Prefer to talk? Call (267) 993-9465 — we answer 24/7.', true);
    });

    form.addEventListener('input', function (e) {
      if (e.target && e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }
})();
