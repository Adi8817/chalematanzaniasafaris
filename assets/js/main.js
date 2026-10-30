/* =========================================================
   main.js — page interactions (no content rendering)
   1. Mobile navigation
   2. Package / category pre-selection
   3. FAQ accordion + "show all questions"
   4. Client-side form validation and success messages
   5. Current year in the footer
   6. Photo gallery "View More Photos" / "Show Less"
   7. Gallery lightbox
   8. Multi-select dropdown (quote form "Experiences")
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Mobile navigation ---------- */
  var header = document.querySelector('.site-header');
  var menuToggle = document.querySelector('.menu-toggle');
  var mainNav = document.getElementById('main-nav');

  function setMenu(open) {
    if (!header || !menuToggle) return;
    header.classList.toggle('is-menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-menu-open')) {
        setMenu(false);
        menuToggle.focus();
      }
    });
    window.matchMedia('(min-width: 1200px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
    // Close when clicking anywhere outside the header
    document.addEventListener('click', function (e) {
      if (header.classList.contains('is-menu-open') && !header.contains(e.target)) setMenu(false);
    });
  }

  /* Header: soft shadow once the page is scrolled */
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 4); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Header: mark the nav link of the section currently in view (aria-current) */
  var navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current') === 'true') {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- 2. Package / category pre-selection ----------
     Any link with data-package="value" sets every safari select
     (name="safari_type") to that value, then the link scrolls to #quote. */
  var safariSelects = document.querySelectorAll('select[name="safari_type"]');

  function selectSafari(value) {
    safariSelects.forEach(function (select) {
      select.value = value;
      clearError(select);
    });
  }

  document.querySelectorAll('[data-package]').forEach(function (link) {
    link.addEventListener('click', function () {
      selectSafari(link.getAttribute('data-package'));
    });
  });

  // Keep the hero and main form safari choice in sync (as in the original design)
  safariSelects.forEach(function (select) {
    select.addEventListener('change', function () { selectSafari(select.value); });
  });

  /* ---------- 3. FAQ ---------- */
  var faqButtons = document.querySelectorAll('.faq-question');

  function closeFaq(btn) {
    btn.setAttribute('aria-expanded', 'false');
    document.getElementById(btn.getAttribute('aria-controls')).hidden = true;
  }

  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach(closeFaq); // only one answer open at a time
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
      }
    });
  });

  var faqToggle = document.querySelector('.faq-toggle');
  if (faqToggle) {
    faqToggle.addEventListener('click', function () {
      var expand = faqToggle.getAttribute('aria-expanded') !== 'true';
      faqToggle.setAttribute('aria-expanded', String(expand));
      document.querySelectorAll('.faq-item--extra').forEach(function (item) {
        item.hidden = !expand;
        if (!expand) closeFaq(item.querySelector('.faq-question'));
      });
    });
  }

  /* ---------- 4. Forms ----------
     Hero form and quote form (data-async-submit) both stay visible; the result
     appears under the submit button. Each POSTs to its data-endpoint and reports
     success only on a 2xx response. With no endpoint set, the "not active yet"
     notice is shown and nothing is sent. Each form has its own messages. */
  function isFieldValid(field) {
    if (field.type === 'checkbox') return field.checked;
    if (field.type === 'tel') {
      return field.value.replace(/\D/g, '').length >= 6;
    }
    return field.checkValidity();
  }

  function errorFor(field) {
    return document.getElementById(field.id + '-error');
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    var err = errorFor(field);
    if (err) err.hidden = true;
  }

  function validateField(field) {
    var valid = isFieldValid(field);
    var err = errorFor(field);
    if (valid) {
      clearError(field);
    } else {
      field.setAttribute('aria-invalid', 'true');
      if (err) err.hidden = false;
    }
    return valid;
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var fields = form.querySelectorAll('[required]');

    fields.forEach(function (field) {
      var evt = (field.tagName === 'SELECT' || field.type === 'checkbox') ? 'change' : 'blur';
      field.addEventListener(evt, function () {
        if (field.getAttribute('aria-invalid') === 'true' || field.value) validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      submitAsync(form);
    });
  });

  function showStatus(form, which) {
    form.querySelectorAll('.form-status').forEach(function (el) {
      el.hidden = el.getAttribute('data-status') !== which;
    });
  }

  function submitAsync(form) {
    if (form.getAttribute('data-sending') === 'true') return; // block duplicate submits
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    showStatus(form, null);

    if (!endpoint) {
      // Force a reflow between hide and show so repeated clicks replay the fade-in
      void form.offsetWidth;
      showStatus(form, 'offline');
      return;
    }

    var button = form.querySelector('[type="submit"]');
    form.setAttribute('data-sending', 'true');
    form.setAttribute('aria-busy', 'true');
    button.disabled = true;
    button.classList.add('is-sending');

    fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        // reset() restores hidden fields to their HTML defaults; keep the current language
        form.querySelectorAll('input[data-lang-field]').forEach(function (input) {
          input.value = document.documentElement.lang;
        });
        showStatus(form, 'success');
      })
      .catch(function () {
        showStatus(form, 'error');
      })
      .then(function () {
        form.removeAttribute('data-sending');
        form.removeAttribute('aria-busy');
        button.disabled = false;
        button.classList.remove('is-sending');
      });
  }

  /* ---------- 5. Footer year ---------- */
  document.querySelectorAll('[data-current-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- 6. Photo gallery ---------- */
  var galleryToggle = document.querySelector('.gallery-toggle');
  if (galleryToggle) {
    galleryToggle.addEventListener('click', function () {
      var expand = galleryToggle.getAttribute('aria-expanded') !== 'true';
      galleryToggle.setAttribute('aria-expanded', String(expand));
      document.querySelectorAll('.gallery-item--extra').forEach(function (item) {
        item.hidden = !expand;
      });
      if (!expand) {
        var gallery = document.getElementById('gallery');
        if (gallery.getBoundingClientRect().top < 0) window.scrollTo({ top: gallery.offsetTop - 84 });
      }
    });
  }

  /* ---------- 7. Gallery lightbox ----------
     Uses every [data-lightbox] link in the gallery (including the extra ones,
     whether or not they are currently revealed). The lightbox markup is in index.html. */
  var lightbox = document.getElementById('lightbox');
  var lbLinks = Array.prototype.slice.call(document.querySelectorAll('#gallery [data-lightbox]'));

  if (lightbox && lbLinks.length) {
    var lbImage = lightbox.querySelector('.lightbox-image');
    var lbCurrent = lightbox.querySelector('.lightbox-current');
    var lbClose = lightbox.querySelector('.lightbox-close');
    var lbPrev = lightbox.querySelector('.lightbox-prev');
    var lbNext = lightbox.querySelector('.lightbox-next');
    var lbIndex = 0;
    var lbReturnFocus = null;
    var touchStartX = null;

    lightbox.querySelector('.lightbox-total').textContent = String(lbLinks.length);

    function showImage(i) {
      lbIndex = (i + lbLinks.length) % lbLinks.length;
      var link = lbLinks[lbIndex];
      lbImage.src = link.getAttribute('href');
      lbImage.alt = link.querySelector('img').alt;
      lbCurrent.textContent = String(lbIndex + 1);
    }

    function openLightbox(i) {
      lbReturnFocus = document.activeElement;
      showImage(i);
      lightbox.hidden = false;
      document.documentElement.classList.add('is-lightbox-open');
      lbClose.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.documentElement.classList.remove('is-lightbox-open');
      lbImage.removeAttribute('src');
      if (lbReturnFocus && document.contains(lbReturnFocus) && lbReturnFocus.offsetParent !== null) lbReturnFocus.focus();
    }

    lbLinks.forEach(function (link, i) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openLightbox(i);
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { showImage(lbIndex - 1); });
    lbNext.addEventListener('click', function () { showImage(lbIndex + 1); });

    // Click on the dark overlay closes; clicks on the image or buttons do not
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-stage')) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(lbIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showImage(lbIndex + 1); }
      else if (e.key === 'Tab') {
        // keep keyboard focus inside the dialog
        var focusables = [lbClose, lbPrev, lbNext];
        var pos = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var nextPos = e.shiftKey ? (pos <= 0 ? focusables.length - 1 : pos - 1) : (pos + 1) % focusables.length;
        focusables[nextPos].focus();
      }
    });

    // Swipe left/right on touch screens
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.touches.length === 1 ? e.touches[0].clientX : null;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) showImage(lbIndex + (dx < 0 ? 1 : -1));
      touchStartX = null;
    });
  }

  /* ---------- 8. Multi-select dropdown ----------
     Markup: [data-multiselect] > .ms-trigger + .ms-panel with real checkboxes.
     Keyboard: ArrowDown opens, ArrowUp/Down/Home/End move, Space toggles,
     Enter or Escape closes. Click/tap outside or tabbing away also closes. */
  document.querySelectorAll('[data-multiselect]').forEach(function (ms) {
    var trigger = ms.querySelector('.ms-trigger');
    var panel = ms.querySelector('.ms-panel');
    var valueEl = ms.querySelector('.ms-value');
    var placeholder = ms.querySelector('.ms-placeholder');
    var boxes = Array.prototype.slice.call(ms.querySelectorAll('input[type="checkbox"]'));

    function labelOf(box) {
      var span = box.parentNode.querySelector('[data-lang="' + document.documentElement.lang + '"]');
      return (span || box.parentNode).textContent.trim();
    }

    function update() {
      var selected = boxes.filter(function (b) { return b.checked; }).map(labelOf);
      placeholder.hidden = selected.length > 0;
      valueEl.hidden = selected.length === 0;
      valueEl.textContent = selected.length <= 2
        ? selected.join(', ')
        : selected.slice(0, 2).join(', ') + ' +' + (selected.length - 2);
      trigger.title = selected.join(', ');
    }

    function open(focusFirst) {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      if (focusFirst) (boxes.filter(function (b) { return b.checked; })[0] || boxes[0]).focus();
    }

    function close(returnFocus) {
      if (panel.hidden) return;
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    }

    trigger.addEventListener('click', function () {
      if (panel.hidden) open(false); else close(false);
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(true); }
    });

    panel.addEventListener('keydown', function (e) {
      var i = boxes.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); boxes[Math.min(i + 1, boxes.length - 1)].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); boxes[Math.max(i - 1, 0)].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); boxes[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); boxes[boxes.length - 1].focus(); }
      else if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(true); }
    });

    // relatedTarget check keeps the panel open on browsers that don't focus checkboxes on click
    ms.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !ms.contains(e.relatedTarget)) close(false);
    });
    document.addEventListener('click', function (e) {
      if (!ms.contains(e.target)) close(false);
    });

    boxes.forEach(function (b) { b.addEventListener('change', update); });
    var form = ms.closest('form');
    if (form) form.addEventListener('reset', function () { setTimeout(update, 0); });
    document.addEventListener('languagechange', update);
    update();
  });
})();
