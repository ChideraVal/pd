(function () {
    // ====== Config: REPLACE with your real Formspree endpoint ======
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzdaqpjr'; // <-- replace this
    const WHATSAPP_NUMBER = '09076376746'; // used for Get links (wa.me)

    // Mobile menu toggle + auto-close on resize
    const menuBtn = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');

    function setMenuOpen(isOpen) {
        if (!mobileMenu || !menuBtn) return;
        mobileMenu.classList.toggle('open', isOpen);
        mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        menuBtn.textContent = isOpen ? '✕' : '☰';
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('open');
            setMenuOpen(isOpen);
        });
    }

    if (mobileMenu) {
        const mobileLinks = Array.from(mobileMenu.querySelectorAll('a[href^="#"], a'));
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                setMenuOpen(false);
            });
        });
    }

    const BREAKPOINT = 900;
    function onResizeCloseMenu() {
        if (window.innerWidth > BREAKPOINT && mobileMenu.classList.contains('open')) {
            setMenuOpen(false);
        }
    }
    window.addEventListener('resize', onResizeCloseMenu);
    window.addEventListener('orientationchange', onResizeCloseMenu);
    document.addEventListener('DOMContentLoaded', onResizeCloseMenu);

    // ===== Portfolio paging: show only first N cards on the page, keep rest in DOM for lightbox navigation =====
    (function initPortfolioPaging() {
        const VISIBLE = 8; // number of cards visible on the page by default
        const grid = document.querySelector('.portfolio-grid');
        const controls = document.getElementById('portfolioControls');
        if (!grid || !controls) return;

        const allProjects = Array.from(grid.querySelectorAll('.project'));
        if (allProjects.length <= VISIBLE) {
            controls.setAttribute('aria-hidden', 'true');
            return;
        }

        const extras = allProjects.slice(VISIBLE);
        extras.forEach(el => {
            el.classList.add('extra');
            el.setAttribute('aria-hidden', 'true');
            el.setAttribute('data-hidden-by-toggle', 'true');
        });

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'showAllProjects';
        btn.className = 'tags-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'portfolio');
        btn.textContent = `Show more (${extras.length})`;
        btn.style.fontWeight = '700';
        btn.style.padding = '8px 12px';
        controls.appendChild(btn);
        controls.setAttribute('aria-hidden', 'false');

        let expanded = false;
        btn.addEventListener('click', () => {
            expanded = !expanded;
            btn.setAttribute('aria-expanded', String(expanded));
            if (expanded) {
                extras.forEach(e => {
                    e.classList.remove('extra');
                    e.removeAttribute('aria-hidden');
                    e.removeAttribute('data-hidden-by-toggle');
                });
                btn.textContent = 'Show less';
                extras[0] && extras[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                extras.forEach(e => {
                    e.classList.add('extra');
                    e.setAttribute('aria-hidden', 'true');
                    e.setAttribute('data-hidden-by-toggle', 'true');
                });
                btn.textContent = `Show more (${extras.length})`;
                btn.focus();
            }
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    })();

    // ===== Portfolio lightbox (unchanged functionality except re-querying projects when needed) =====
    let projects = Array.from(document.querySelectorAll('.project'));
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbTitle = document.getElementById('lb-title');
    let currentIndex = 0;

    function refreshProjects() {
        projects = Array.from(document.querySelectorAll('.project'));
    }

    function openLightbox(idx) {
        refreshProjects();
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

    document.addEventListener('click', (e) => {
        // Projects are clickable blocks; find the nearest .project
        const projectEl = e.target.closest && e.target.closest('.project');
        if (projectEl) {
            // compute index
            refreshProjects();
            const idx = projects.indexOf(projectEl);
            if (idx >= 0) openLightbox(idx);
        }
    });

    const lbClose = document.getElementById('lb-close');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            refreshProjects();
            currentIndex = (currentIndex - 1 + projects.length) % projects.length;
            openLightbox(currentIndex);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            refreshProjects();
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

    // ===== NEW: Show more / Show less for tags =====
    (function initTagsToggle() {
        const MAX_VISIBLE = 18; // number of tags visible by default
        const tagsContainer = document.getElementById('serviceTagsList');
        const toggleWrapper = document.getElementById('tagsToggleWrapper');
        if (!tagsContainer || !toggleWrapper) return;
        const tags = Array.from(tagsContainer.querySelectorAll('.tag'));
        if (tags.length <= MAX_VISIBLE) {
            toggleWrapper.setAttribute('aria-hidden', 'true');
            return;
        }

        const hiddenTags = tags.slice(MAX_VISIBLE);
        hiddenTags.forEach(t => {
            t.classList.add('hidden');
            t.setAttribute('aria-hidden', 'true');
            t.setAttribute('data-hidden-by-toggle', 'true');
            t.setAttribute('tabindex', '-1');
        });

        const hiddenCount = hiddenTags.length;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tags-toggle';
        btn.id = 'toggleTagsBtn';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'serviceTagsList');
        btn.textContent = `Show more (${hiddenCount})`;

        toggleWrapper.appendChild(btn);
        toggleWrapper.setAttribute('aria-hidden', 'false');

        let expanded = false;
        btn.addEventListener('click', () => {
            expanded = !expanded;
            btn.setAttribute('aria-expanded', String(expanded));
            if (expanded) {
                hiddenTags.forEach(t => {
                    t.classList.remove('hidden');
                    t.removeAttribute('aria-hidden');
                    t.setAttribute('tabindex', '0');
                });
                btn.textContent = 'Show less';
            } else {
                hiddenTags.forEach(t => {
                    t.classList.add('hidden');
                    t.setAttribute('aria-hidden', 'true');
                    t.setAttribute('tabindex', '-1');
                });
                btn.textContent = `Show more (${hiddenCount})`;
                btn.focus();
            }
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        });
    })();
    // ===== end tags toggle =====

    // ===== Products: modal wiring + Get links + structured description building =====
    (function initProducts() {
        const productCards = Array.from(document.querySelectorAll('.product-card'));
        const modal = document.getElementById('productModal');
        const pmTitle = document.getElementById('pm-title');
        const pmPrice = document.getElementById('pm-price');
        const pmImg = document.getElementById('pmImg');
        const pmDesc = document.getElementById('pm-desc');
        const pmDetails = document.getElementById('pm-details');
        const pmClose = document.getElementById('pmClose');
        const pmGetLink = document.getElementById('pmGetLink');

        if (!modal) return;

        // helper to build whatsapp link
        function whatsappHref(message) {
            const text = encodeURIComponent(message || '');
            return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
        }

        // Build in-grid Get links (update href to include product title)
        productCards.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const getAnchor = card.querySelector('.get-link');
            const defaultMessage = `Hi, I'm interested in ${title}`;
            if (getAnchor) {
                getAnchor.href = whatsappHref(defaultMessage);
                getAnchor.setAttribute('target', '_blank');
                getAnchor.setAttribute('rel', 'noopener noreferrer');
            } else {
                // create if missing
                const actions = card.querySelector('.product-actions');
                if (actions) {
                    const a = document.createElement('a');
                    a.className = 'btn-outline get-link';
                    a.href = whatsappHref(defaultMessage);
                    a.setAttribute('target', '_blank');
                    a.setAttribute('rel', 'noopener noreferrer');
                    a.textContent = 'Get';
                    actions.appendChild(a);
                }
            }
        });

        function buildDetailsHtml(card) {
            // summary
            const summary = card.getAttribute('data-summary') || '';
            // unnamed features separated by ||
            const unnamedRaw = card.getAttribute('data-unnamed') || '';
            const unnamed = unnamedRaw ? unnamedRaw.split('||').map(s => s.trim()).filter(Boolean) : [];

            // named features pairs like Key:Value separated by ||
            const namedRaw = card.getAttribute('data-named') || '';
            const named = [];
            if (namedRaw) {
                namedRaw.split('||').forEach(pair => {
                    const idx = pair.indexOf(':');
                    if (idx > -1) {
                        const key = pair.slice(0, idx).trim();
                        const val = pair.slice(idx + 1).trim();
                        if (key) named.push({ key, val });
                    }
                });
            }

            // Build HTML
            let html = '';
            if (summary) {
                html += `<p>${summary}</p>`;
            }

            if (unnamed.length) {
                html += `<ul class="pm-unnamed-list">`;
                unnamed.forEach(it => {
                    html += `<li>${it}</li>`;
                });
                html += `</ul>`;
            }

            if (named.length) {
                html += `<table class="pm-spec-table" aria-hidden="false">`;
                named.forEach(row => {
                    html += `<tr><th style="width:36%">${row.key}</th><td>${row.val}</td></tr>`;
                });
                html += `</table>`;
            }

            return { html, namedCount: named.length, unnamedCount: unnamed.length };
        }

        function openModalFromCard(card) {
            const title = card.getAttribute('data-title') || '';
            const price = card.getAttribute('data-price') || '';
            const img = card.getAttribute('data-img') || '';
            const details = buildDetailsHtml(card);

            pmTitle.textContent = title;
            pmPrice.textContent = price ? `₦${Number(parseFloat(price).toFixed(2)).toLocaleString()}` : '';
            pmImg.style.backgroundImage = img ? `url('${img}')` : '';
            pmDesc.innerHTML = ''; // keep summary in pmDesc if you prefer; we included summary in details HTML
            pmDetails.innerHTML = details.html || '';

            // update modal Get link with prefilled message referencing product title
            const msg = `Hi, I'm interested in ${title}. Could you provide price and availability?`;
            if (pmGetLink) {
                pmGetLink.href = whatsappHref(msg);
                pmGetLink.setAttribute('target', '_blank');
                pmGetLink.setAttribute('rel', 'noopener noreferrer');
            }

            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            // move keyboard focus to close button for accessibility
            pmClose.focus();
        }

        // Click handlers for "View details" buttons
        productCards.forEach(card => {
            const viewBtn = card.querySelector('.view-details');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    const c = e.target.closest('.product-card');
                    if (!c) return;
                    openModalFromCard(c);
                });
            } else {
                // If there's no view button, allow clicking the card to open modal
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.get-link')) return; // avoid when clicking Get
                    openModalFromCard(card);
                });
            }
        });

        function closeModal() {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        // close handlers
        pmClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });

    })();
    // ===== end product modal js =====

})();