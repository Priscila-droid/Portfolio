// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ========== SCROLL-TRIGGERED ANIMATIONS ==========
const createObserver = (options = {}) => {
  const defaults = { threshold: 0.15, rootMargin: '0px 0px -80px 0px' };
  const config = { ...defaults, ...options };
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, config);
};

const cardObserver = createObserver({ threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
const fadeObserver = createObserver({ threshold: 0.15 });

document.addEventListener('DOMContentLoaded', () => {

  // ========== OBSERVE WRAPPERS ==========
  document.querySelectorAll('.project-wrapper').forEach((wrapper, i) => {
    wrapper.style.transitionDelay = `${i * 0.15}s`;
    cardObserver.observe(wrapper);
  });

  document.querySelectorAll('.fade-in').forEach(el => {
    fadeObserver.observe(el);
  });

  // ========== TIMELINE ANIMATION ==========
  const timelineItems = document.querySelectorAll('.about-timeline__item');
  if (timelineItems.length) {
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          timelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

    timelineItems.forEach((item, i) => {
      item.style.setProperty('--delay', `${i * 0.18}s`);
      item.querySelector('.about-timeline__header').style.transitionDelay = `${i * 0.18 + 0.15}s`;
      item.querySelector('.about-timeline__list').style.transitionDelay = `${i * 0.18 + 0.25}s`;
      item.style.setProperty('transition-delay', `${i * 0.18}s`);
      const before = item;
      before.style.setProperty('--dot-delay', `${i * 0.18 + 0.1}s`);
      timelineObserver.observe(item);
    });
  }

  // ========== NAV SCROLL ==========
  // (nav is now minimal — no scroll state needed)

  // ========== MENU PANEL ==========
  const dots = document.querySelector('.nav__dots');
  const panel = document.querySelector('.nav__panel');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.classList.add('nav__overlay');
  document.body.appendChild(overlay);

  function toggleMenu() {
    dots.classList.toggle('active');
    panel.classList.toggle('open');
    overlay.classList.toggle('visible');
    document.body.style.overflow = panel.classList.contains('open') ? 'hidden' : '';
  }

  function closeMenu() {
    dots.classList.remove('active');
    panel.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (dots) {
    dots.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    panel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ========== CARD FLIP ON SCROLL ==========
  const flipObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target;
      if (entry.isIntersecting) {
        card.classList.add('flipped');
      } else {
        card.classList.remove('flipped');
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.project-card').forEach(card => {
    flipObserver.observe(card);
  });

  // ========== PARALLAX ON SCROLL (desktop) ==========
  const wrappers = document.querySelectorAll('.project-wrapper');

  if (window.matchMedia('(min-width: 769px)').matches) {
    window.addEventListener('scroll', () => {
      wrappers.forEach(wrapper => {
        const rect = wrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          const translateY = (progress - 0.5) * -15;
          const img = wrapper.querySelector('.project-card__image img, .project-card__placeholder');
          if (img) {
            img.style.transform = `translateY(${translateY}px)`;
          }
        }
      });
    }, { passive: true });
  }

  // ========== CURSOR GLOW ON CARDS ==========
  document.querySelectorAll('.project-card').forEach(card => {
    const imageEl = card.querySelector('.project-card__image');

    card.addEventListener('mousemove', (e) => {
      const rect = imageEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      imageEl.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(91, 0, 128, 0.06), transparent 40%)`;
    });

    card.addEventListener('mouseleave', () => {
      imageEl.style.background = '';
    });
  });

  // ========== CUSTOM CURSOR ==========
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.classList.add('cursor');
    cursor.innerHTML = '<span class="cursor__label">explore</span>';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursor.classList.contains('visible')) {
        cursor.classList.add('visible');
      }
    });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('visible');
    });

    // Smooth follow with requestAnimationFrame
    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Grow on interactive elements (exclude nav dots/lang but include menu links)
    const clickables = document.querySelectorAll('a, button, input, [role="button"], .project-card-link, .project-card');
    clickables.forEach(el => {
      const inNavBar = el.closest('.nav');
      const inSidebar = el.closest('.social-sidebar');
      const isCopyBtn = el.closest('.footer__copy-btn');
      const isBackTop = el.closest('.footer__back-top');
      const isFooterNav = el.closest('.footer__nav');
      const isPasswordGate = el.closest('.password-gate');
      if (inNavBar || inSidebar || isCopyBtn || isBackTop || isFooterNav || isPasswordGate) return;
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });

    // Menu links get explore cursor
    document.querySelectorAll('.nav__panel .nav__links a').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });

    // Collab items get context cursor
    const cursorLabel = cursor.querySelector('.cursor__label');
    const collabHTML = document.documentElement.lang === 'en' ? 'view<br>details' : 'ver<br>contexto';
    document.querySelectorAll('.collabs__item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorLabel.innerHTML = collabHTML;
        cursorLabel.style.whiteSpace = 'normal';
        cursorLabel.style.textAlign = 'center';
        cursorLabel.style.lineHeight = '1.3';
        cursor.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        cursorLabel.textContent = 'explore';
        cursorLabel.style.whiteSpace = '';
        cursorLabel.style.textAlign = '';
        cursorLabel.style.lineHeight = '';
        cursor.classList.remove('active');
      });
    });

    // Copy button cursor
    const copyBtn = document.querySelector('.footer__copy-btn');
    if (copyBtn) {
      const copyText = document.documentElement.lang === 'en' ? 'copy' : 'copiar';
      copyBtn.addEventListener('mouseenter', () => {
        cursorLabel.textContent = copyText;
        cursor.classList.add('active');
      });
      copyBtn.addEventListener('mouseleave', () => {
        cursorLabel.textContent = 'explore';
        cursor.classList.remove('active');
      });
    }

    // Back to top cursor
    const backTop = document.querySelector('.footer__back-top');
    if (backTop) {
      const backText = document.documentElement.lang === 'en' ? 'back' : 'voltar';
      backTop.addEventListener('mouseenter', () => {
        cursorLabel.textContent = backText;
        cursor.classList.add('active');
      });
      backTop.addEventListener('mouseleave', () => {
        cursorLabel.textContent = 'explore';
        cursor.classList.remove('active');
      });
    }
  }

  // ========== MARQUEE SPEED ON HOVER ==========
  document.querySelectorAll('.project-wrapper').forEach(wrapper => {
    const track = wrapper.querySelector('.project-marquee__track');
    if (!track) return;

    wrapper.addEventListener('mouseenter', () => {
      track.style.animationDuration = '15s';
    });

    wrapper.addEventListener('mouseleave', () => {
      track.style.animationDuration = '25s';
    });
  });

  // ========== TYPEWRITER EFFECT ==========
  const typewriterEl = document.querySelector('.typewriter');
  if (typewriterEl) {
    const phrases = JSON.parse(typewriterEl.dataset.phrases);
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 80;
    const deleteSpeed = 50;
    const pauseAfterType = 2000;
    const pauseAfterDelete = 400;

    // Proof points sync
    const proofEl = document.querySelector('.hero__proof');
    const proofTitleEl = document.querySelector('.hero__proof-title');
    const proofTextEl = document.querySelector('.hero__proof-text');
    const proofs = proofEl ? JSON.parse(proofEl.dataset.proofs) : [];

    function updateProof(index) {
      if (!proofEl || !proofs[index]) return;
      proofEl.classList.add('hero__proof--fading');
      setTimeout(() => {
        proofTitleEl.textContent = proofs[index].title;
        proofTextEl.textContent = proofs[index].text;
        proofEl.classList.remove('hero__proof--fading');
      }, 300);
    }

    // Show initial proof
    if (proofs.length) {
      proofTitleEl.textContent = proofs[0].title;
      proofTextEl.textContent = proofs[0].text;
    }

    function type() {
      const current = phrases[phraseIndex];

      if (!isDeleting) {
        typewriterEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(type, pauseAfterType);
          return;
        }
        setTimeout(type, typeSpeed);
      } else {
        typewriterEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          updateProof(phraseIndex);
          setTimeout(type, pauseAfterDelete);
          return;
        }
        setTimeout(type, deleteSpeed);
      }
    }

    setTimeout(type, 1000);
  }

  // ========== FLOATING IMAGES ==========
  const floatContainer = document.querySelector('.hero__floating-images');
  if (floatContainer) {
    const images = JSON.parse(floatContainer.dataset.images);
    let lastIndex = -1;
    let lastZoneIndex = -1;

    const zones = [
      { xMin: -5, xMax: 18, yMin: 5, yMax: 30 },    // top-left
      { xMin: 75, xMax: 98, yMin: 5, yMax: 30 },     // top-right
      { xMin: -5, xMax: 18, yMin: 60, yMax: 85 },    // bottom-left
      { xMin: 75, xMax: 98, yMin: 60, yMax: 85 },    // bottom-right
    ];

    // Map each zone to its opposite
    const opposites = { 0: 3, 1: 2, 2: 1, 3: 0 };

    function getRandomPosition() {
      let zoneIndex;
      if (lastZoneIndex === -1) {
        zoneIndex = Math.floor(Math.random() * zones.length);
      } else {
        zoneIndex = opposites[lastZoneIndex];
      }
      lastZoneIndex = zoneIndex;

      const zone = zones[zoneIndex];
      return {
        x: zone.xMin + Math.random() * (zone.xMax - zone.xMin),
        y: zone.yMin + Math.random() * (zone.yMax - zone.yMin),
      };
    }

    function showRandomImage() {
      let index;
      do {
        index = Math.floor(Math.random() * images.length);
      } while (index === lastIndex && images.length > 1);
      lastIndex = index;

      const img = document.createElement('img');
      img.src = images[index];
      img.classList.add('hero__floating-img');

      const pos = getRandomPosition();
      img.style.left = pos.x + '%';
      img.style.top = pos.y + '%';

      floatContainer.appendChild(img);

      requestAnimationFrame(() => {
        img.classList.add('hero__floating-img--visible');
      });

      setTimeout(() => {
        img.remove();
      }, 3500);
    }

    setTimeout(showRandomImage, 800);
    setInterval(showRandomImage, 2800);
  }

  // ========== FOOTER TYPEWRITER ==========
  const footerTypewriter = document.querySelector('.footer__typewriter');
  if (footerTypewriter) {
    const phrases = JSON.parse(footerTypewriter.dataset.phrases);
    let fPhraseIndex = 0;
    let fCharIndex = 0;
    let fIsDeleting = false;

    function footerType() {
      const current = phrases[fPhraseIndex];

      if (!fIsDeleting) {
        footerTypewriter.textContent = current.substring(0, fCharIndex + 1);
        fCharIndex++;
        if (fCharIndex === current.length) {
          fIsDeleting = true;
          setTimeout(footerType, 2200);
          return;
        }
        setTimeout(footerType, 90);
      } else {
        footerTypewriter.textContent = current.substring(0, fCharIndex - 1);
        fCharIndex--;
        if (fCharIndex === 0) {
          fIsDeleting = false;
          fPhraseIndex = (fPhraseIndex + 1) % phrases.length;
          setTimeout(footerType, 500);
          return;
        }
        setTimeout(footerType, 55);
      }
    }

    // Start when footer is visible
    const footerObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        footerType();
        footerObs.disconnect();
      }
    }, { threshold: 0.3 });
    footerObs.observe(footerTypewriter.closest('.footer__hero'));
  }

  // ========== COPY EMAIL BUTTON ==========
  const copyBtn = document.querySelector('.footer__copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.dataset.email;
      navigator.clipboard.writeText(email).then(() => {
        const label = copyBtn.querySelector('.footer__copy-label');
        const original = label.textContent;
        label.textContent = '✓ Copiado';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          label.textContent = original;
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // ========== COLLABS MINI CARD ==========
  const card = document.createElement('div');
  card.classList.add('collabs__card');
  card.innerHTML = `
    <button class="collabs__card-close">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
    </button>
    <div class="collabs__card-header">
      <span class="collabs__card-brand"></span>
      <span class="collabs__card-year"></span>
    </div>
    <div class="collabs__card-meta">
      <span class="collabs__card-tag collabs__card-role"></span>
      <span class="collabs__card-tag collabs__card-type"></span>
    </div>
    <p class="collabs__card-summary"></p>
  `;
  document.body.appendChild(card);

  function closeCard() {
    card.classList.remove('visible');
  }

  card.querySelector('.collabs__card-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeCard();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.collabs__item') && !e.target.closest('.collabs__card')) {
      closeCard();
    }
  });

  document.querySelectorAll('.collabs__item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const { brand, year, role, type, summary } = item.dataset;
      if (!brand) return;

      card.querySelector('.collabs__card-brand').textContent = brand;
      card.querySelector('.collabs__card-year').textContent = year;
      card.querySelector('.collabs__card-role').textContent = role;
      card.querySelector('.collabs__card-type').textContent = type;
      card.querySelector('.collabs__card-summary').textContent = summary;

      const rect = item.getBoundingClientRect();
      let top = rect.bottom + 12;
      let left = rect.left + (rect.width / 2) - 160;

      if (left < 16) left = 16;
      if (left + 320 > window.innerWidth - 16) left = window.innerWidth - 336;
      if (top + 220 > window.innerHeight) top = rect.top - 220;

      card.style.top = top + 'px';
      card.style.left = left + 'px';

      card.classList.remove('visible');
      requestAnimationFrame(() => {
        card.classList.add('visible');
      });
    });
  });
});
