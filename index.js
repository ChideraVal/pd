(function () {
    // ====== Config: REPLACE with your real Formspree endpoint ======
    // Example: const FORMSPREE_ENDPOINT = 'https://formspree.io/f/abcdxyz';
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzdaqpjr'; // <-- replace this
    // =============================================================

    // mobile menu
    // const menuBtn = document.querySelector('.menu-toggle');
    // const mobileMenu = document.getElementById('mobileMenu');
    // if (menuBtn) menuBtn.addEventListener('click', () => {
    //     mobileMenu.classList.toggle('open');
    //     mobileMenu.setAttribute('aria-hidden', !mobileMenu.classList.contains('open'));
    // });
    // mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    //     mobileMenu.classList.remove('open');
    //     mobileMenu.setAttribute('aria-hidden', 'true');
    // }));

    // Mobile menu toggle + auto-close on resize
    const menuBtn = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');

    function setMenuOpen(isOpen) {
        if (!mobileMenu || !menuBtn) return;
        mobileMenu.classList.toggle('open', isOpen);
        mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('open');
            setMenuOpen(isOpen);
        });
    }

    // --- NEW: close mobile menu when any mobile link is clicked ---
    if (mobileMenu) {
        const mobileLinks = Array.from(mobileMenu.querySelectorAll('a[href^="#"], a'));
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Close the menu immediately
                setMenuOpen(false);

                // If the link is an in-page anchor, allow default navigation (closing happens instantly).
                // If the link navigates away (external), closing the menu is still useful but the page will unload.
                // No need to preventDefault here.
            });
        });
    }

    const BREAKPOINT = 900; // match your CSS breakpoint
    function onResizeCloseMenu() {
        if (window.innerWidth > BREAKPOINT && mobileMenu.classList.contains('open')) {
            setMenuOpen(false);
        }
    }
    window.addEventListener('resize', onResizeCloseMenu);
    window.addEventListener('orientationchange', onResizeCloseMenu);
    document.addEventListener('DOMContentLoaded', onResizeCloseMenu);

    // ===== Portfolio lightbox (unchanged functionality) =====
    const projects = Array.from(document.querySelectorAll('.project'));
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbTitle = document.getElementById('lb-title');
    let currentIndex = 0;

    function openLightbox(idx) {
        const el = projects[idx];
        if (!el) return;
        const title = el.getAttribute('data-title') || 'Project';
        const img = el.getAttribute('data-img') || "url('')";
        lbTitle.textContent = title;
        lbImg.style.backgroundImage = img;
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        currentIndex = idx;
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    projects.forEach((p, i) => p.addEventListener('click', () => openLightbox(i)));
    const lbClose = document.getElementById('lb-close');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + projects.length) % projects.length;
            openLightbox(currentIndex);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % projects.length;
            openLightbox(currentIndex);
        });
    }
    document.addEventListener('keydown', (e) => {
        if (lb.classList.contains('open')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevBtn && prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
        }
    });

    // ===== Testimonials manual nav (unchanged) =====
    const slider = document.getElementById('test-slider');
    const btnNext = document.getElementById('test-next');
    const btnPrev = document.getElementById('test-prev');
    let slidePos = 0;
    function updateSlideWidth() {
        const child = slider && slider.children[0];
        if (!child) return 0;
        const rect = child.getBoundingClientRect();
        return Math.round(rect.width) + 12;
    }
    function scrollToSlide(pos) {
        const width = updateSlideWidth();
        slider && slider.scrollTo({ left: width * pos, behavior: 'smooth' });
    }
    if (btnNext) btnNext.addEventListener('click', () => { const count = slider.children.length; slidePos = (slidePos + 1) % count; scrollToSlide(slidePos); });
    if (btnPrev) btnPrev.addEventListener('click', () => { const count = slider.children.length; slidePos = (slidePos - 1 + count) % count; scrollToSlide(slidePos); });
    let scrollTimeout;
    slider && slider.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const width = updateSlideWidth();
            if (width === 0) return;
            const approx = Math.round(slider.scrollLeft / width);
            slidePos = Math.max(0, Math.min(slider.children.length - 1, approx));
        }, 80);
    });

    // ===== Lazy-load Google iframes when they scroll into view =====
    const lazyFrames = Array.from(document.querySelectorAll('iframe[data-src]'));
    if ('IntersectionObserver' in window && lazyFrames.length) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const el = e.target;
                    el.src = el.dataset.src;
                    obs.unobserve(el);
                }
            });
        }, { rootMargin: '300px' });
        lazyFrames.forEach(f => io.observe(f));
    } else {
        // fallback: set all iframe src
        lazyFrames.forEach(f => f.src = f.dataset.src);
    }

    // ===== Contact form wiring (Formspree + fallback) =====
    function serializeForm(form) {
        return new FormData(form);
    }
    async function submitToFormspree(form) {
        const data = serializeForm(form);
        try {
            const resp = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (resp.ok) return { success: true };
            const json = await resp.json().catch(() => null);
            return { success: false, data: json };
        } catch (err) {
            return { success: false, error: err };
        }
    }
    function openMailtoFallback(name, email, message) {
        const subject = encodeURIComponent('Quote request from ' + name);
        const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
        window.location.href = 'mailto:hello@printdesignco.com?subject=' + subject + '&body=' + body;
    }

    async function handleFormSubmission(e, form, msgEl) {
        e.preventDefault();
        const name = form.querySelector('[name="name"]').value.trim();
        const email = form.querySelector('[name="email"]').value.trim();
        const message = form.querySelector('[name="message"]').value.trim();
        if (!name || !email || !message) {
            msgEl.style.color = '';
            msgEl.textContent = 'Please fill name, email and message.';
            return;
        }
        msgEl.style.color = '';
        msgEl.textContent = 'Sending...';

        // If FORMSPREE_ENDPOINT is still the placeholder, fallback to mailto
        if (FORMSPREE_ENDPOINT.includes('yourFormId') || FORMSPREE_ENDPOINT.trim() === '') {
            openMailtoFallback(name, email, message);
            msgEl.textContent = 'Opening your mail client to send request...';
            return;
        }

        const result = await submitToFormspree(form);
        if (result.success) {
            msgEl.style.color = 'green';
            msgEl.textContent = 'Thanks — your message has been sent. We will reply soon.';
            form.reset();
        } else {
            msgEl.style.color = '#a33';
            msgEl.textContent = 'There was an error sending your message. Opening mail client as fallback.';
            openMailtoFallback(name, email, message);
        }
    }

    const contactForm = document.getElementById('contactForm');
    const sendMsg = document.getElementById('sendMsg');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => handleFormSubmission(e, contactForm, sendMsg));
    }

    // Fill year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // keyboard focus hint for accessibility
    document.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.body.classList.add('show-focus-styles'); });
})();
