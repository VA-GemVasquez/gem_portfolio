/**
 * ==========================================================================
 * Minimalist Black & White Portfolio Controller
 * Theme switcher & micro-interactions
 * ==========================================================================
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'rocol-portfolio-theme';
    const THEME_BLACK = 'black';
    const THEME_WHITE = 'white';

    // Get current theme from storage or system preference
    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) || THEME_BLACK;
        } catch (e) {
            return THEME_BLACK;
        }
    }

    // Save theme to localStorage
    function setStoredTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Unable to persist theme to localStorage', e);
        }
    }

    // Update the button UI state
    function updateToggleButton(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        const isBlack = theme === THEME_BLACK;
        toggleBtn.setAttribute('aria-pressed', isBlack ? 'false' : 'true');
        toggleBtn.setAttribute('title', isBlack ? 'Switch to White mode' : 'Switch to Black mode');
        toggleBtn.setAttribute('aria-label', isBlack ? 'Switch to White mode' : 'Switch to Black mode');

        // Sun icon (White mode) | Moon icon (Black mode)
        // Active icon gets the white pill highlight
        const sunActive = !isBlack;
        const moonActive = isBlack;

        toggleBtn.innerHTML = `
            <span class="theme-toggle-icon${sunActive ? ' is-active' : ''}" aria-hidden="true" title="White mode">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="4.5"></circle>
                    <line x1="12" y1="2" x2="12" y2="4.5"></line>
                    <line x1="12" y1="19.5" x2="12" y2="22"></line>
                    <line x1="4.22" y1="4.22" x2="5.93" y2="5.93"></line>
                    <line x1="18.07" y1="18.07" x2="19.78" y2="19.78"></line>
                    <line x1="2" y1="12" x2="4.5" y2="12"></line>
                    <line x1="19.5" y1="12" x2="22" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.93" y2="18.07"></line>
                    <line x1="18.07" y1="5.93" x2="19.78" y2="4.22"></line>
                </svg>
            </span>
            <span class="theme-toggle-icon${moonActive ? ' is-active' : ''}" aria-hidden="true" title="Black mode">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" stroke="currentColor"></path>
                </svg>
            </span>
        `.trim();
    }

    // Apply theme to DOM
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateToggleButton(theme);
    }

    // Toggle theme handler
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || THEME_BLACK;
        const nextTheme = currentTheme === THEME_BLACK ? THEME_WHITE : THEME_BLACK;
        
        applyTheme(nextTheme);
        setStoredTheme(nextTheme);
    }

    // Initialize as soon as DOM is ready
    function init() {
        const initialTheme = getStoredTheme();
        applyTheme(initialTheme);

        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }

        // Setup smooth page transition handler
        setupPageTransitions();

        // Setup subtle pointer parallax for the floating product mockup
        setupMockupParallax();

        // Setup constellation canvas background
        setupConstellationBackground();

        // Setup scroll-triggered content reveals
        setupScrollReveals();

        // Setup scrollspy navigation for single-page layout
        setupScrollspy();

        // Setup reading-progress bar
        setupReadingProgressBar();

        // Setup SVG scroll-draw journey line
        setupJourneyLine();

        // Optional keyboard shortcut: 'T' toggles black & white
        window.addEventListener('keydown', function (e) {
            // Ignore if typing in input/textarea/select
            const tag = e.target.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

            if (e.key === 't' || e.key === 'T') {
                toggleTheme();
            }
        });
    }

    /**
     * Floating Product Mockup Parallax
     * Subtly translates the mockup a few px toward the cursor with a spring-like transition.
     * Honors prefers-reduced-motion to keep the mockup still.
     */
    function setupMockupParallax() {
        const heroSection = document.getElementById('profile') || document.querySelector('.hero-section');
        const parallaxWrapper = document.getElementById('mockup-parallax-wrapper');
        if (!heroSection || !parallaxWrapper) return;

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motionQuery.matches) {
            parallaxWrapper.style.setProperty('--parallax-x', '0px');
            parallaxWrapper.style.setProperty('--parallax-y', '0px');
            return;
        }

        // Maximum parallax offset in pixels (subtle translation)
        const MAX_OFFSET_PX = 9;
        let isHovered = false;
        let ticking = false;
        let clientX = 0;
        let clientY = 0;

        function updateParallax() {
            if (!isHovered) {
                ticking = false;
                return;
            }

            const rect = heroSection.getBoundingClientRect();
            // Calculate cursor offset relative to hero center
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Clamped normalized delta (-1 to 1)
            const normX = Math.max(-1, Math.min(1, (clientX - centerX) / (rect.width / 2)));
            const normY = Math.max(-1, Math.min(1, (clientY - centerY) / (rect.height / 2)));

            // Translate a few px toward the cursor
            const targetX = (normX * MAX_OFFSET_PX).toFixed(2);
            const targetY = (normY * MAX_OFFSET_PX).toFixed(2);

            parallaxWrapper.style.setProperty('--parallax-x', `${targetX}px`);
            parallaxWrapper.style.setProperty('--parallax-y', `${targetY}px`);

            ticking = false;
        }

        function onPointerMove(e) {
            // Touch screens don't require hover parallax
            if (e.pointerType === 'touch') return;
            if (motionQuery.matches) return;

            isHovered = true;
            clientX = e.clientX;
            clientY = e.clientY;

            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        function onPointerLeave() {
            isHovered = false;
            parallaxWrapper.style.setProperty('--parallax-x', '0px');
            parallaxWrapper.style.setProperty('--parallax-y', '0px');
        }

        heroSection.addEventListener('pointermove', onPointerMove, { passive: true });
        heroSection.addEventListener('pointerleave', onPointerLeave, { passive: true });

        // Dynamically respond to accessibility preference changes
        motionQuery.addEventListener('change', function (e) {
            if (e.matches) {
                onPointerLeave();
            }
        });
    }

    // Intercept internal page navigations for smooth enter/exit animations
    function setupPageTransitions() {
        // Reset exiting class on pageshow (e.g. back/forward navigation from bfcache)
        window.addEventListener('pageshow', function () {
            document.body.classList.remove('page-is-exiting');
        });

        document.addEventListener('click', function (e) {
            const anchor = e.target.closest('a');
            if (!anchor) return;

            // Skip if modifier keys used (open in new tab/window)
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (anchor.target && anchor.target !== '_self' && anchor.target !== '') return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Skip hash anchors, mailto, tel, javascript, external links
            if (
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('javascript:') ||
                href.startsWith('http://') ||
                href.startsWith('https://')
            ) {
                return;
            }

            try {
                const targetUrl = new URL(anchor.href, window.location.href);
                // If it's on the exact same page, let browser handle anchor/hash smoothly
                if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
                    return;
                }
            } catch (err) {
                // If URL parsing fails, continue default
            }

            // Smooth exit transition
            e.preventDefault();
            document.body.classList.add('page-is-exiting');

            setTimeout(function () {
                window.location.href = anchor.href;
            }, 180);
        });
    }

    /**
     * ==========================================================================
     * Constellation Canvas Background Controller
     * ==========================================================================
     */
    function setupConstellationBackground() {
        let canvas = document.getElementById('constellation-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'constellation-canvas';
            canvas.className = 'constellation-bg';
            canvas.setAttribute('aria-hidden', 'true');
            document.body.prepend(canvas);
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let nodes = [];
        let animId = null;
        let lastTime = performance.now();

        // Pointer node (extra interactive node)
        const pointer = {
            x: -9999,
            y: -9999,
            active: false
        };

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Cap node count on small screens (O(n^2) pair checks)
        function getOptimalNodeCount(w) {
            if (w < 640) return 28;  // Mobile: keep O(n^2) fast
            if (w < 1024) return 40; // Tablet
            return 52;               // Desktop (within 35-60)
        }

        // Initialize / re-seed nodes with random positions and slow random velocities
        function initNodes() {
            const count = getOptimalNodeCount(width);
            nodes = [];
            for (let i = 0; i < count; i++) {
                const speed = 14 + Math.random() * 16; // 14 to 30 px/sec slow velocity
                const angle = Math.random() * Math.PI * 2;
                nodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed
                });
            }
        }

        // Size the canvas from clientWidth and clientHeight * dpr (cap 2)
        function resizeCanvas() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.clientWidth || window.innerWidth;
            height = canvas.clientHeight || window.innerHeight;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);

            // Re-scale context for crisp HiDPI drawing in CSS coordinates
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Re-seed or clamp existing nodes within bounds
            if (nodes.length === 0 || Math.abs(nodes.length - getOptimalNodeCount(width)) > 10) {
                initNodes();
            } else {
                for (let i = 0; i < nodes.length; i++) {
                    nodes[i].x = Math.min(Math.max(nodes[i].x, 0), width);
                    nodes[i].y = Math.min(Math.max(nodes[i].y, 0), height);
                }
            }
        }

        // Render one complete frame (nodes + distance lines)
        function render(dt) {
            ctx.clearRect(0, 0, width, height);

            // Distance threshold: roughly 30% of the shorter container side
            const shorterSide = Math.min(width, height);
            const maxDist = shorterSide * 0.3;
            const maxDistSq = maxDist * maxDist;

            // Accent color based on current theme
            const isWhite = document.documentElement.getAttribute('data-theme') === 'white';
            const rgb = isWhite ? '9, 9, 11' : '255, 255, 255';
            const lineMaxAlpha = isWhite ? 0.3 : 0.4;
            const nodeFillAlpha = isWhite ? 0.55 : 0.7;

            // 1. Move nodes by velocity * dt and bounce at edges
            if (dt > 0) {
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    node.x += node.vx * dt;
                    node.y += node.vy * dt;

                    // Bounce off edges
                    if (node.x <= 0) {
                        node.x = 0;
                        node.vx = Math.abs(node.vx);
                    } else if (node.x >= width) {
                        node.x = width;
                        node.vx = -Math.abs(node.vx);
                    }

                    if (node.y <= 0) {
                        node.y = 0;
                        node.vy = Math.abs(node.vy);
                    } else if (node.y >= height) {
                        node.y = height;
                        node.vy = -Math.abs(node.vy);
                    }
                }
            }

            // 2. For every pair closer than maxDist draw a 1px line with alpha falloff
            ctx.lineWidth = 1;
            const totalNodes = nodes.length;

            for (let i = 0; i < totalNodes; i++) {
                const n1 = nodes[i];
                for (let j = i + 1; j < totalNodes; j++) {
                    const n2 = nodes[j];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < maxDistSq) {
                        const dist = Math.sqrt(distSq);
                        // Alpha falls off linearly with distance (max ~0.4)
                        const alpha = (1 - dist / maxDist) * lineMaxAlpha;
                        ctx.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    }
                }

                // 3. Treat pointer as extra node so lines reach toward cursor
                if (pointer.active) {
                    const dx = n1.x - pointer.x;
                    const dy = n1.y - pointer.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < maxDistSq) {
                        const dist = Math.sqrt(distSq);
                        const alpha = (1 - dist / maxDist) * lineMaxAlpha;
                        ctx.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(pointer.x, pointer.y);
                        ctx.stroke();
                    }
                }
            }

            // 4. Draw each node as a 2px filled circle
            ctx.fillStyle = `rgba(${rgb}, ${nodeFillAlpha})`;
            for (let i = 0; i < totalNodes; i++) {
                ctx.beginPath();
                ctx.arc(nodes[i].x, nodes[i].y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw cursor node dot if active
            if (pointer.active && pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height) {
                ctx.fillStyle = `rgba(${rgb}, 0.85)`;
                ctx.beginPath();
                ctx.arc(pointer.x, pointer.y, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Animation tick with capped delta time
        function tick(now) {
            // Delta time in seconds, capped to prevent jumping/teleporting after tab switch
            let dt = (now - lastTime) / 1000;
            if (dt > 0.05) dt = 0.05; // Cap delta at 50ms
            if (dt < 0) dt = 0;
            lastTime = now;

            render(dt);

            if (!motionQuery.matches) {
                animId = requestAnimationFrame(tick);
            }
        }

        function startOrStop() {
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }

            if (motionQuery.matches) {
                // Under prefers-reduced-motion: stop animation and show a still frame
                render(0);
            } else {
                lastTime = performance.now();
                animId = requestAnimationFrame(tick);
            }
        }

        // Pointer event listeners (pointer treated as extra node)
        window.addEventListener('pointermove', function (e) {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
            pointer.active = true;

            // If still frame due to reduced motion, redraw once with pointer lines
            if (motionQuery.matches) {
                render(0);
            }
        }, { passive: true });

        window.addEventListener('pointerleave', function () {
            pointer.active = false;
            if (motionQuery.matches) {
                render(0);
            }
        });

        // Resize listener with debounce
        let resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeCanvas();
                if (motionQuery.matches) {
                    render(0);
                }
            }, 100);
        });

        // Accessibility preference changes
        motionQuery.addEventListener('change', function () {
            startOrStop();
        });

        // Initial setup and start
        resizeCanvas();
        startOrStop();
    }

    /**
     * ==========================================================================
     * Scroll-Triggered Content Reveal Controller
     * Starts blocks at opacity: 0; transform: translateY(24px) scale(0.97)
     * Adds .is-in class via one IntersectionObserver (threshold 0.3, rootMargin: '0px 0px -10% 0px')
     * Supports one-shot reveals (unobserve on first hit) and scrubbing-back
     * sections (toggle both ways via [data-reveal-repeat]).
     * Under prefers-reduced-motion: reduce, reveals everything immediately.
     * ==========================================================================
     */
    function setupScrollReveals() {
        document.documentElement.classList.add('js');

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const revealElements = document.querySelectorAll('.reveal');
        if (!revealElements.length) return;

        // Under prefers-reduced-motion: show everything immediately without animation
        if (prefersReducedMotion.matches) {
            revealElements.forEach(function (el) {
                el.classList.add('is-in');
            });
            return;
        }

        // Single IntersectionObserver watching all content blocks
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                const target = entry.target;
                const isRepeat = target.hasAttribute('data-reveal-repeat') || target.dataset.revealRepeat === 'true';

                if (entry.isIntersecting) {
                    target.classList.add('is-in');
                    if (!isRepeat) {
                        // One-shot reveals: unobserve after first hit
                        observer.unobserve(target);
                    }
                } else if (isRepeat) {
                    // Scrubbing-back sections: toggle the class both ways
                    target.classList.remove('is-in');
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -10% 0px'
        });

        revealElements.forEach(function (el) {
            observer.observe(el);
        });

        // Dynamic preference listener
        prefersReducedMotion.addEventListener('change', function (e) {
            if (e.matches) {
                revealElements.forEach(function (el) {
                    el.classList.add('is-in');
                    observer.unobserve(el);
                });
            }
        });
    }

    /**
     * ==========================================================================
     * Scrollspy Navigation Controller
     * Dynamically updates active state on header navigation links
     * based on the currently visible section in the single-page layout.
     * ==========================================================================
     */
    function setupScrollspy() {
        const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
        if (!navLinks.length) return;

        const sections = ['home', 'about', 'projects', 'contact'];

        function onScroll() {
            const scrollPos = window.scrollY + 180;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i]);
                if (section && section.offsetTop <= scrollPos) {
                    navLinks.forEach(function (link) {
                        if (link.getAttribute('href') === '#' + sections[i]) {
                            link.setAttribute('aria-current', 'page');
                        } else {
                            link.removeAttribute('aria-current');
                        }
                    });
                    break;
                }
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /**
     * ==========================================================================
     * Reading Progress Bar Controller
     * Fixed 3px bar at viewport top with light gray-blue track and accent fill.
     * Uses transform: scaleX(progress) with transform-origin: 0 50% (never width)
     * so it stays on the compositor.
     * Batched via requestAnimationFrame inside a passive scroll listener.
     * Measures article: progress = clamp((scrollY - article.offsetTop) / (article.offsetHeight - innerHeight), 0, 1)
     * CSS-only version: animation: grow linear both; animation-timeline: scroll(root block).
     * Updates aria-valuenow sparingly.
     * Under prefers-reduced-motion: updates bar without any easing.
     * ==========================================================================
     */
    function setupReadingProgressBar() {
        const bar = document.getElementById('reading-progress');
        const fill = document.getElementById('reading-progress-fill');
        if (!bar || !fill) return;

        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }

        let isTicking = false;
        let lastReportedPercent = -1;

        function computeProgress() {
            const article = document.querySelector('article') || document.querySelector('main');
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            const innerHeight = window.innerHeight;

            if (article) {
                const articleTop = article.offsetTop;
                const articleHeight = article.offsetHeight;
                const denominator = articleHeight - innerHeight;
                if (denominator <= 0) return scrollY > 0 ? 1 : 0;
                return clamp((scrollY - articleTop) / denominator, 0, 1);
            } else {
                const docHeight = document.documentElement.scrollHeight;
                const clientHeight = document.documentElement.clientHeight;
                const denominator = docHeight - clientHeight;
                if (denominator <= 0) return 0;
                return clamp(scrollY / denominator, 0, 1);
            }
        }

        function update() {
            const progress = computeProgress();

            // Always update via JS — the CSS scroll-driven animation (where supported)
            // will override this via the animation property, so there is no double-update.
            // This guarantees the bar works in every browser.
            fill.style.transform = `scaleX(${progress})`;

            // Update aria-valuenow sparingly (only on significant integer delta or bounds)
            const percent = Math.round(progress * 100);
            if (Math.abs(percent - lastReportedPercent) >= 5 || percent === 0 || percent === 100) {
                bar.setAttribute('aria-valuenow', percent);
                lastReportedPercent = percent;
            }

            isTicking = false;
        }

        function onScroll() {
            if (!isTicking) {
                requestAnimationFrame(update);
                isTicking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // Initial compute
        update();
    }

    /**
     * ==========================================================================
     * SVG Scroll-Draw Journey Line
     * Draws an S-curve path as the reader scrolls. Moves a round tip along
     * the path via getPointAtLength, and lights up node circles + milestone
     * label cards when the drawn portion passes each node's fixed fraction.
     * Respects prefers-reduced-motion (shows full line immediately).
     * ==========================================================================
     */
    function setupJourneyLine() {
        const accentPath = document.getElementById('journey-accent');
        const trackPath  = document.getElementById('journey-track');
        const tip        = document.getElementById('journey-tip');
        const svgWrap    = document.getElementById('journey-svg-wrap');

        if (!accentPath || !svgWrap) return;

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Node data: SVG circle elements + their fractional positions + milestones
        const nodeData = [
            { nodeEl: document.getElementById('jn-0'), milestoneEl: document.getElementById('jm-0'), fraction: 0.18 },
            { nodeEl: document.getElementById('jn-1'), milestoneEl: document.getElementById('jm-1'), fraction: 0.40 },
            { nodeEl: document.getElementById('jn-2'), milestoneEl: document.getElementById('jm-2'), fraction: 0.65 },
            { nodeEl: document.getElementById('jn-3'), milestoneEl: document.getElementById('jm-3'), fraction: 0.88 },
        ];

        // Read path length once (layout must be complete)
        let pathLen = 0;

        function initPath() {
            try {
                pathLen = accentPath.getTotalLength();
            } catch (e) {
                pathLen = 1200; // safe fallback
            }
            if (!pathLen || pathLen <= 0) pathLen = 1200;

            // Set stroke-dasharray to full path length
            accentPath.style.strokeDasharray = pathLen;

            if (motionQuery.matches) {
                // prefers-reduced-motion: draw fully, light all nodes immediately
                accentPath.style.strokeDashoffset = 0;
                nodeData.forEach(function (nd) {
                    if (nd.nodeEl)      nd.nodeEl.classList.add('is-lit');
                    if (nd.milestoneEl) nd.milestoneEl.classList.add('is-lit');
                });
                if (tip) tip.style.display = 'none';
                return; // no scroll listener needed
            }

            // Start fully hidden — JS will drive dashoffset
            accentPath.style.strokeDashoffset = pathLen;
            // Hide tip at start position (already set to path start in HTML)
        }

        // Clamp helper
        function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

        let ticking = false;
        let lastProgress = -1;

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }

        function update() {
            ticking = false;
            if (!pathLen) return;

            const scrollY    = window.scrollY;
            const svgTop     = svgWrap.getBoundingClientRect().top + scrollY;
            const svgHeight  = svgWrap.offsetHeight;
            const vh         = window.innerHeight;

            // progress: 0 when SVG top hits 55% of viewport, 1 when SVG bottom leaves view
            const progress = clamp(
                (scrollY + vh * 0.55 - svgTop) / svgHeight,
                0, 1
            );

            if (Math.abs(progress - lastProgress) < 0.0005) return; // skip tiny deltas
            lastProgress = progress;

            const drawn = progress * pathLen;

            // Update stroke-dashoffset (JS path — CSS animation-timeline: view() overrides this on supported browsers)
            accentPath.style.strokeDashoffset = pathLen - drawn;

            // Move tip to current draw point
            if (tip) {
                try {
                    const pt = accentPath.getPointAtLength(drawn);
                    tip.setAttribute('cx', pt.x.toFixed(2));
                    tip.setAttribute('cy', pt.y.toFixed(2));
                } catch (e) { /* ignore */ }
            }

            // Light up nodes + milestones when drawn length passes their fraction
            nodeData.forEach(function (nd) {
                const threshold = nd.fraction * pathLen;
                const shouldLit = drawn >= threshold;
                if (nd.nodeEl) {
                    nd.nodeEl.classList.toggle('is-lit', shouldLit);
                }
                if (nd.milestoneEl) {
                    nd.milestoneEl.classList.toggle('is-lit', shouldLit);
                }
            });
        }

        // Wait for layout so getTotalLength() is accurate
        if (document.readyState === 'complete') {
            initPath();
        } else {
            window.addEventListener('load', initPath, { once: true });
        }

        // Passive scroll listener
        window.addEventListener('scroll', onScroll, { passive: true });

        // Re-init on resize (path length doesn't change for inline SVG with viewBox,
        // but svgWrap dimensions used for progress calculation may shift)
        let resizeJourney = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeJourney);
            resizeJourney = setTimeout(function () {
                lastProgress = -1; // force redraw
                onScroll();
            }, 120);
        });

        // Respond to accessibility preference changes
        motionQuery.addEventListener('change', function () {
            if (motionQuery.matches) {
                accentPath.style.strokeDashoffset = 0;
                nodeData.forEach(function (nd) {
                    if (nd.nodeEl)      nd.nodeEl.classList.add('is-lit');
                    if (nd.milestoneEl) nd.milestoneEl.classList.add('is-lit');
                });
                if (tip) tip.style.display = 'none';
            } else {
                if (tip) tip.style.display = '';
                lastProgress = -1;
                onScroll();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
