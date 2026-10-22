/* Respekt Avto — page script. No dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* 1. Open/closed ticker (Chelyabinsk time, UTC+5) */
  var OPEN_M = 540, CLOSE_M = 1260;
  function statusNow() {
    var d = new Date();
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    var t = new Date(utc + 5 * 3600000);
    var m = t.getHours() * 60 + t.getMinutes();
    if (m >= OPEN_M && m < CLOSE_M) return { open: true, text: 'Открыто сейчас · до 21:00' };
    if (m < OPEN_M) return { open: false, text: 'Закрыто · откроемся в 9:00' };
    return { open: false, text: 'Закрыто · откроемся завтра в 9:00' };
  }
  function renderStatus() {
    var s = statusNow(), v = s.open ? 'open' : 'closed', el, tx;
    el = document.getElementById('status');
    if (el) {
      el.setAttribute('data-open', v);
      tx = document.getElementById('status-text');
      if (tx) tx.textContent = s.text;
    }
    el = document.getElementById('status-2');
    if (el) {
      el.setAttribute('data-open', v);
      tx = el.querySelector('.status__text');
      if (tx) tx.textContent = s.text;
    }
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  /* 2. Burger menu */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (burger) {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }
  /* 3. Reviews carousel (fade slides) */
  var car = document.getElementById('carousel');
  if (car) {
    var slides = Array.prototype.slice.call(car.querySelectorAll('.rev-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('#carousel-dots .dot'));
    var nowEl = document.getElementById('carousel-now');
    var idx = 0, timer = null, paused = false;
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, j) {
        s.classList.toggle('is-active', j === idx);
        s.setAttribute('aria-hidden', j === idx ? 'false' : 'true');
      });
      dots.forEach(function (d, j) {
        d.classList.toggle('is-active', j === idx);
        if (j === idx) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
      if (nowEl) nowEl.textContent = String(idx + 1);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function start() {
      stop();
      if (paused || reduce.matches || slides.length < 2) return;
      timer = setInterval(function () { show(idx + 1); }, 6000);
    }
    function go(i) { show(i); start(); }
    var prevBtn = document.getElementById('carousel-prev');
    var nextBtn = document.getElementById('carousel-next');
    var pauseBtn = document.getElementById('carousel-pause');
    if (prevBtn) prevBtn.addEventListener('click', function () { go(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(idx + 1); });
    dots.forEach(function (d, j) { d.addEventListener('click', function () { go(j); }); });
    if (pauseBtn) pauseBtn.addEventListener('click', function () {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', paused ? 'Возобновить автопрокрутку отзывов' : 'Остановить автопрокрутку отзывов');
      if (paused) stop(); else start();
    });
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);
    car.addEventListener('focusin', stop);
    car.addEventListener('focusout', start);
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    show(0);
    start();
  }
  /* 4. Reveal on scroll */
  var revealSel = '.adv__card, .card, .price-group, .steps__list li, .stat, .proof__conds li, .sec-head, .booking__intro, .booking__points li, .contacts__info, .carousel__viewport';
  var auto = document.querySelectorAll(revealSel);
  Array.prototype.forEach.call(auto, function (el) {
    el.classList.add('reveal');
    var sibs = el.parentNode ? el.parentNode.children : null;
    if (sibs) {
      var i = Array.prototype.indexOf.call(sibs, el);
      if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
    }
  });
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce.matches) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* 5. Phone mask */
  var phone = document.getElementById('f-phone');
  if (phone) {
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '');
      if (!d) { phone.value = ''; return; }
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(1, 11);
      var out = '+7';
      out += ' (' + d.slice(0, 3);
      if (d.length >= 3) out += ')';
      if (d.length > 3) out += ' ' + d.slice(3, 6);
      if (d.length > 6) out += '-' + d.slice(6, 8);
      if (d.length > 8) out += '-' + d.slice(8, 10);
      phone.value = out;
    });
  }

  /* 6. Booking form -> prefilled WhatsApp */
  var form = document.getElementById('booking-form');
  if (form) {
    var hint = document.getElementById('form-hint');
    var fName = document.getElementById('f-name');
    var fCar = document.getElementById('f-car');
    var fDate = document.getElementById('f-date');
    var fNote = document.getElementById('f-note');
    if (fDate) {
      var t = new Date();
      var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
      fDate.min = t.getFullYear() + '-' + p2(t.getMonth() + 1) + '-' + p2(t.getDate());
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = function (msg, el) {
        if (hint) {
          hint.textContent = msg;
          hint.classList.remove('is-ok');
          hint.classList.add('is-error');
        }
        if (el) {
          el.setAttribute('aria-invalid', 'true');
          el.focus();
        }
      };
      var name = fName ? fName.value.trim() : '';
      var digits = phone ? phone.value.replace(/\D/g, '') : '';
      if (name.length < 2) { bad('Напишите, как к вам обращаться.', fName); return; }
      if (digits.length < 11) { bad('Укажите телефон полностью.', phone); return; }
      if (hint) {
        hint.textContent = 'Открываем WhatsApp — проверьте сообщение и нажмите «Отправить».';
        hint.classList.remove('is-error');
        hint.classList.add('is-ok');
      }
      [fName, phone, fCar, fDate].forEach(function (el) {
        if (el) el.removeAttribute('aria-invalid');
      });
      var parts = ['Здравствуйте! Хочу записаться на ремонт.', 'Имя: ' + name, 'Телефон: ' + phone.value];
      var carVal = fCar ? fCar.value.trim() : '';
      if (carVal) parts.push('Авто: ' + carVal);
      if (fDate && fDate.value) {
        var dp = fDate.value.split('-');
        parts.push('Дата: ' + dp[2] + '.' + dp[1] + '.' + dp[0]);
      }
      var note = fNote ? fNote.value.trim() : '';
      if (note) parts.push('Комментарий: ' + note);
      window.open('https://wa.me/79123143994?text=' + encodeURIComponent(parts.join('\n')), '_blank', 'noopener');
    });
  }

  /* 7. Footer year */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
