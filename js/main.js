/**
 * TSJ — Custom Cabinetry
 * Interactive Scripts + i18n Language Switcher
 */

document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    initSlider();
    initMobileMenu();
    initHeaderScroll();
    initBackToTop();
    initCookieBanner();
    initContactForm();
    initScrollAnimations();
    initActiveNavLink();
    initSmoothScroll();
});

// ==========================================
// I18n — Language Switcher
// ==========================================
function initI18n() {
    const langSelect = document.getElementById('langSelect');
    if (!langSelect) return;

    // Load saved preference, default to English
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    applyLanguage(savedLang);
    langSelect.value = savedLang;

    langSelect.addEventListener('change', () => {
        const lang = langSelect.value;
        applyLanguage(lang);
        localStorage.setItem('preferredLang', lang);
    });
}

function getCurrentLang() {
    return document.getElementById('htmlRoot').getAttribute('lang') || 'en';
}

function applyLanguage(lang) {
    const translations = I18N[lang];
    if (!translations) return;

    // Update html lang attribute
    document.getElementById('htmlRoot').setAttribute('lang', lang);

    // Walk all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (key && translations[key]) {
            el.innerHTML = translations[key];
        }

        // Handle data-i18n-attr (format: "attrName:i18nKey")
        const attrDef = el.dataset.i18nAttr;
        if (attrDef) {
            attrDef.split(',').forEach(pair => {
                const [attrName, i18nKey] = pair.split(':').map(s => s.trim());
                if (attrName && i18nKey && translations[i18nKey]) {
                    el.setAttribute(attrName, translations[i18nKey]);
                }
            });
        }
    });

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && translations.metaDesc) {
        metaDesc.setAttribute('content', translations.metaDesc);
    }
}

function t(key) {
    const lang = getCurrentLang();
    return I18N[lang]?.[key] || I18N.en[key] || key;
}

// ==========================================
// Hero Slider
// ==========================================
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const slider = document.getElementById('heroSlider');

    if (!slides.length) return;

    let currentIndex = 0;
    let autoplayInterval;
    let isTransitioning = false;

    function goToSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        currentIndex = (index + slides.length) % slides.length;

        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');

        setTimeout(() => { isTransitioning = false; }, 800);
    }

    function next() { goToSlide(currentIndex + 1); }
    function prev() { goToSlide(currentIndex - 1); }

    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(next, 6000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    prevBtn?.addEventListener('click', () => { prev(); startAutoplay(); });
    nextBtn?.addEventListener('click', () => { next(); startAutoplay(); });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.index));
            startAutoplay();
        });
    });

    // Touch swipe
    let touchStartX = 0;
    slider?.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider?.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? next() : prev();
            startAutoplay();
        }
    }, { passive: true });

    // Pause on hover
    slider?.addEventListener('mouseenter', stopAutoplay);
    slider?.addEventListener('mouseleave', startAutoplay);

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
        if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    });

    startAutoplay();
}

// ==========================================
// Mobile Menu
// ==========================================
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close on nav link click
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (nav.classList.contains('active') &&
            !nav.contains(e.target) &&
            !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ==========================================
// Header Scroll Effect
// ==========================================
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
}

// ==========================================
// Back to Top
// ==========================================
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==========================================
// Cookie Consent
// ==========================================
function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;

    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => banner.classList.add('show'), 1500);
    }

    document.getElementById('acceptCookies')?.addEventListener('click', () => {
        banner.classList.remove('show');
        localStorage.setItem('cookieConsent', 'accepted');
    });

    document.getElementById('rejectCookies')?.addEventListener('click', () => {
        banner.classList.remove('show');
        localStorage.setItem('cookieConsent', 'declined');
    });
}

// ==========================================
// Contact Form (with i18n messages)
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(form));

        // Validate required fields
        if (!data.name || !data.email || !data.message) {
            showFormMessage(t('formError'), 'error');
            return;
        }

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            showFormMessage(t('formEmailError'), 'error');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = t('formSending');
        btn.disabled = true;

        // Simulate submission
        setTimeout(() => {
            showFormMessage(t('formSuccess'), 'success');
            form.reset();
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1500);
    });
}

function showFormMessage(message, type) {
    const existing = document.querySelector('.form-message');
    existing?.remove();

    const el = document.createElement('div');
    el.className = `form-message form-message--${type}`;
    el.textContent = message;

    const form = document.getElementById('contactForm');
    form.insertBefore(el, form.firstChild);

    // Auto-dismiss
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s ease';
        setTimeout(() => el.remove(), 300);
    }, 5000);
}

// ==========================================
// Scroll Animations
// ==========================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
        '.category-card, .portfolio-card, .why-card, .featured-card, .step, .trust-item, .section-header'
    ).forEach(el => observer.observe(el));
}

// ==========================================
// Active Nav on Scroll
// ==========================================
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    if (!sections.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }, { passive: true });
}

// ==========================================
// Smooth Scroll
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;

            e.preventDefault();
            const offset = document.querySelector('.header')?.offsetHeight || 80;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset - offset,
                behavior: 'smooth'
            });
        });
    });
}

// ==========================================
// Inquiry Button
// ==========================================
(function () {
    const btn = document.getElementById('btnInquiry');
    btn?.addEventListener('click', () => {
        const target = document.getElementById('sendform');
        if (target) {
            const offset = document.querySelector('.header')?.offsetHeight || 80;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset - offset - 20,
                behavior: 'smooth'
            });
        }
    });
})();
