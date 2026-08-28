/* ==========================================================================
   VARNAM MIND CARE — KOWSALYA MURUGANANTHAM
   Interactive Features & Animations JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initSplitText();
  init3DTilt();
  initMagneticButtons();
  initStatCounters();
  initMarqueeCloning();
  initStepReveal();
  initBookingModal();
  updateFooterYear();
});

/* --------------------------------------------------------------------------
   0. Loading Screen
   -------------------------------------------------------------------------- */
function initPageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;

  // Both clocks run from navigation start (what performance.now() measures),
  // not from when this script happens to run - otherwise the visitor waits
  // 3s PLUS however long parsing took, and the splash overstays.
  const MIN_VISIBLE = 3000;  // splash is on screen for 3 seconds
  const MAX_WAIT = 3200;     // and never longer, even if an image is still loading
  let dismissed = false;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    const remaining = Math.max(0, MIN_VISIBLE - performance.now());
    setTimeout(() => loader.classList.add('is-done'), remaining);
  };

  if (document.readyState === 'complete') {
    dismiss();
  } else {
    window.addEventListener('load', dismiss, { once: true });
  }

  setTimeout(dismiss, Math.max(0, MAX_WAIT - performance.now()));
}

/* --------------------------------------------------------------------------
   1. Split Special Characters (.split-text) & Staggered Entry
   -------------------------------------------------------------------------- */
function initSplitText() {
  const splitElements = document.querySelectorAll('[data-split]');

  splitElements.forEach(el => {
    splitChildNodes(el);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15 });

  splitElements.forEach(el => observer.observe(el));
}

function splitChildNodes(node) {
  let charCount = 0;

  function traverse(currentNode) {
    const children = Array.from(currentNode.childNodes);

    children.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (!text.trim() && text.length === 1) return;

        const fragment = document.createDocumentFragment();
        const specialCharsRegex = /[.,!?*+%\/★\-]/;

        // Group characters into per-word boxes. Each .char is inline-block, so
        // without a wrapper the browser may break a line between any two
        // letters ("being" -> "be / ing"). The word box keeps them together.
        text.split(/(\s+)/).forEach(token => {
          if (!token) return;

          if (/^\s+$/.test(token)) {
            fragment.appendChild(document.createTextNode(' '));
            return;
          }

          const word = document.createElement('span');
          word.classList.add('word');

          for (let i = 0; i < token.length; i++) {
            const char = token[i];
            const span = document.createElement('span');

            span.textContent = char;
            span.classList.add('char');
            span.style.setProperty('--char-index', charCount++);

            if (specialCharsRegex.test(char)) {
              span.classList.add('special-char');
            }

            word.appendChild(span);
          }

          fragment.appendChild(word);
        });

        child.parentNode.replaceChild(fragment, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        traverse(child);
      }
    });
  }

  traverse(node);
}

/* --------------------------------------------------------------------------
   2. 3D Card Depth Tilt (.tilt-card)
   -------------------------------------------------------------------------- */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* --------------------------------------------------------------------------
   3. Magnetic Hover CTA Buttons (.magnetic-btn)
   -------------------------------------------------------------------------- */
function initMagneticButtons() {
  const magneticBtns = document.querySelectorAll('.magnetic-btn');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

/* --------------------------------------------------------------------------
   4. Animated Stat Counters (.counter)
   -------------------------------------------------------------------------- */
function initStatCounters() {
  const counters = document.querySelectorAll('.counter');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(counterEl) {
  const target = parseInt(counterEl.getAttribute('data-target'), 10) || 0;
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutProgress = 1 - Math.pow(1 - progress, 2);
    const currentValue = Math.floor(easeOutProgress * target);

    counterEl.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      counterEl.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

/* --------------------------------------------------------------------------
   4b. Scroll reveals — How It Works steps and Areas of Practice cards
   -------------------------------------------------------------------------- */
function initStepReveal() {
  // .step-reveal and .feature-reveal slide in from the right, .card-reveal
  // rises from below — same observer, the direction is decided in CSS.
  const steps = document.querySelectorAll('.step-reveal, .card-reveal, .feature-reveal');
  if (!steps.length) return;

  // No IntersectionObserver (or reduced motion): show them straight away
  // rather than leaving the section empty.
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    steps.forEach(s => s.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);   // reveal once, don't re-run on scroll back
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

  steps.forEach(s => io.observe(s));
}

/* --------------------------------------------------------------------------
   5. Soft-Masked Testimonial Marquee Ticker Cloning
   -------------------------------------------------------------------------- */
function initMarqueeCloning() {
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (!marqueeTrack) return;

  const cards = Array.from(marqueeTrack.children);
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    marqueeTrack.appendChild(clone);
  });
}

/* --------------------------------------------------------------------------
   6. Booking Modal — 3-step intake form posted to the Varnam Google Form
   -------------------------------------------------------------------------- */
const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSeETgXWdqlj_d8l7B0XdYckM50R0XfiHJyR_HzLb2sxNKjrOg/formResponse';

// Google splits a date question into three fields on submit
const DATE_ENTRY = 'entry.1958507019';

function initBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  const form = document.getElementById('bookingForm');
  const steps = Array.from(form.querySelectorAll('.form-step'));
  const bar = document.getElementById('formProgressBar');
  const stepLabel = document.getElementById('formStepLabel');
  const backBtn = document.getElementById('formBackBtn');
  const nextBtn = document.getElementById('formNextBtn');
  const errorBox = document.getElementById('formError');
  const done = document.getElementById('formDone');
  const dateInput = document.getElementById('prefDate');

  const LABELS = ['About you', 'How to reach you', 'Your session'];
  let current = 0;

  /* ---------- open / close ---------- */
  const openModal = () => {
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', 'true');
  };

  const closeModal = () => {
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  };

  ['openNavModalBtn', 'openContactModalBtn', 'openMobileModalBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', openModal);
  });

  const closeBtn = document.getElementById('closeModalBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  /* ---------- step navigation ---------- */
  function showStep(index) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((s, i) => s.classList.toggle('is-active', i === current));

    const pct = ((current + 1) / steps.length) * 100;
    if (bar) bar.style.width = pct + '%';
    if (stepLabel) {
      stepLabel.textContent =
        'Step ' + (current + 1) + ' of ' + steps.length + ' · ' + LABELS[current];
    }

    const isLastStep = current === steps.length - 1;
    backBtn.hidden = current === 0;
    nextBtn.textContent = isLastStep ? 'Submit' : 'Continue';

    hideError();
    const firstField = steps[current].querySelector('input, select, textarea');
    if (firstField) firstField.focus({ preventScroll: true });
    modal.querySelector('.modal-content').scrollTop = 0;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  // Validate only the fields on the current step, so a later required field
  // can't block progress with a message the visitor cannot see.
  function validateStep(index) {
    const fields = Array.from(
      steps[index].querySelectorAll('input, select, textarea')
    ).filter(f => !f.disabled && f.type !== 'hidden' && !f.hidden);

    for (const field of fields) {
      field.classList.remove('is-invalid');
    }

    for (const field of fields) {
      if (!field.checkValidity()) {
        const group = field.closest('.form-group');
        if (group) {
          const target = group.querySelector('input, select, textarea');
          if (target) target.classList.add('is-invalid');
        }
        field.classList.add('is-invalid');
        const label = group && group.querySelector('label, .label');
        showError(
          label
            ? 'Please complete: ' + label.textContent.replace('*', '').trim()
            : 'Please complete every required field on this step.'
        );
        (group || field).scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (field.focus) field.focus({ preventScroll: true });
        return false;
      }
    }
    return true;
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(current)) return;

    if (current === steps.length - 1) {
      // Route through the form's submit event so there is one submission path
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      return;
    }

    showStep(current + 1);
  });

  backBtn.addEventListener('click', () => showStep(current - 1));

  /* ---------- "Other" text inputs reveal themselves ---------- */
  form.addEventListener('change', (e) => {
    if (e.target.type !== 'radio') return;
    const group = e.target.closest('.form-group');
    if (!group) return;
    const otherInput = group.querySelector('.other-input');
    if (!otherInput) return;

    const wantsOther = e.target.dataset.other !== undefined;
    otherInput.hidden = !wantsOther;
    otherInput.required = wantsOther;
    if (wantsOther) otherInput.focus({ preventScroll: true });
    else otherInput.value = '';
  });

  /* ---------- submit ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(current)) return;

    // Build a throwaway form so the page itself never navigates. Google rejects
    // cross-origin fetch/XHR, but a plain form POST into a hidden iframe is fine.
    const post = document.createElement('form');
    post.action = GOOGLE_FORM_ACTION;
    post.method = 'POST';
    post.target = 'googleFormSink';
    post.style.display = 'none';

    const add = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      post.appendChild(input);
    };

    new FormData(form).forEach((value, name) => {
      if (typeof value === 'string' && value.trim() !== '') add(name, value);
    });

    // Google wants the date split into three separate entries
    if (dateInput && dateInput.value) {
      const [year, month, day] = dateInput.value.split('-');
      add(DATE_ENTRY + '_year', year);
      add(DATE_ENTRY + '_month', String(Number(month)));
      add(DATE_ENTRY + '_day', String(Number(day)));
    }

    document.body.appendChild(post);
    nextBtn.disabled = true;
    nextBtn.textContent = 'Sending…';
    post.submit();

    // The iframe is cross-origin, so its load event is the only signal we get.
    const sink = document.getElementById('googleFormSink');
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      post.remove();
      form.hidden = true;
      document.querySelector('.form-progress').hidden = true;
      stepLabel.hidden = true;
      done.hidden = false;
      nextBtn.disabled = false;
      nextBtn.textContent = 'Submit';
    };

    sink.addEventListener('load', finish, { once: true });
    setTimeout(finish, 4000);
  });

  showStep(0);
}

/* --------------------------------------------------------------------------
   7. Dynamic Footer Year
   -------------------------------------------------------------------------- */
function updateFooterYear() {
  const yearSpan = document.getElementById('yearSpan');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}
