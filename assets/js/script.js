// Wait for DOM ready
document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initThemeToggle();
    initNetBackground();
    initProjects();
    initImageLightbox();
    initScrollReveal();
    initSmoothScroll();
    setCurrentYear();
});

// ===== NAVBAR =====
function initNavbar() {
    var menuToggle = document.getElementById('mobile-menu');
    var navMenu = document.getElementById('primary-menu') || document.querySelector('.nav-menu');
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var navbar = document.querySelector('.navbar');

    function setMenuState(isOpen) {
        if (!menuToggle || !navMenu) return;
        menuToggle.classList.toggle('active', isOpen);
        navMenu.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        navMenu.setAttribute('aria-hidden', String(!isOpen));
        document.body.classList.toggle('mobile-menu-open', isOpen);
    }

    if (menuToggle && navMenu) {
        setMenuState(false);

        menuToggle.addEventListener('click', function () {
            var isOpen = menuToggle.classList.contains('active');
            setMenuState(!isOpen);
        });

        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuState(false);
            });
        });

        document.addEventListener('click', function (event) {
            if (!menuToggle.classList.contains('active')) return;
            var target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('.nav-right')) return;
            setMenuState(false);
        });

        window.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                setMenuState(false);
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                setMenuState(false);
            }
        });
    }

    if (navbar) {
        var updateNavbarState = function () {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        };
        updateNavbarState();
        window.addEventListener('scroll', updateNavbarState, { passive: true });
    }

    initActiveSectionHighlighting(navLinks);
}

function initActiveSectionHighlighting(navLinks) {
    var hashLinks = navLinks.filter(function (link) {
        var href = link.getAttribute('href') || '';
        return href.charAt(0) === '#' && href.length > 1;
    });

    if (!hashLinks.length) return;

    var sectionIds = hashLinks.map(function (link) {
        return (link.getAttribute('href') || '').slice(1);
    });

    var sections = sectionIds
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean);

    if (!sections.length) return;

    function setActiveById(id) {
        hashLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
    }

    if ('IntersectionObserver' in window) {
        var visible = new Set();
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    visible.add(entry.target.id);
                } else {
                    visible.delete(entry.target.id);
                }
            });

            for (var i = 0; i < sections.length; i += 1) {
                if (visible.has(sections[i].id)) {
                    setActiveById(sections[i].id);
                    break;
                }
            }
        }, {
            root: null,
            rootMargin: '-42% 0px -42% 0px',
            threshold: 0
        });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    var icon = toggle.querySelector('i');
    var saved = localStorage.getItem('theme');
    var darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        var isDark = theme === 'dark';

        if (icon) {
            icon.classList.toggle('fa-sun', isDark);
            icon.classList.toggle('fa-moon', !isDark);
        }

        toggle.setAttribute('aria-pressed', String(isDark));
        toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
    } else {
        applyTheme(darkMediaQuery.matches ? 'dark' : 'light');
    }

    toggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    darkMediaQuery.addEventListener('change', function (event) {
        if (!localStorage.getItem('theme')) {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });
}

// ===== PROJECTS =====
function initProjects() {
    var grid = document.querySelector('.projects-grid');
    if (!grid) return;

    var projects = [
        {
            title: 'Kennectify - Real-Time Streaming Pipeline platform',
            problem: 'Built a production streaming pipeline to process high-volume events reliably with low operational overhead.',
            constraint: 'Needed to process approximately 200K records per day with strict latency and throughput expectations.',
            approach: 'Designed event-time processing and windowing with resilient ingestion, schema-aware transformations, and quality checks for stable downstream consumption.',
            numbers: 'Approximately 200K records/day · event-time windowing · low latency · high throughput',
            impact: [
                { number: '200K', label: 'Records/Day' },
                { number: 'Low', label: 'Latency' },
                { number: 'High', label: 'Throughput' }
            ],
            image: 'assets/images/Kennectify.png',
            tags: ['Event Hubs', 'Streaming', 'Event-Time Processing', 'Data Quality', 'Distributed Systems'],
            paper: null,
            code: 'https://github.com/sa-kishor',
            demo: null,
            featured: true,
            badge: 'Data Engineering'
        },
        {
            title: 'Global Real-Time Seismic Data Platform',
            problem: 'Designed and built an end-to-end real-time data platform for processing and analyzing global seismic events at scale.',
            constraint: 'Ingested 500K+ earthquake events from the USGS API across 150+ countries while maintaining production-grade reliability.',
            approach: 'Engineered Kafka and Spark Streaming pipelines with sub-5 second latency, processed magnitude/frequency/depth time-series metrics, and implemented dual storage with HDFS for 30+ years historical data and TimescaleDB for real-time analytics. Built a Grafana dashboard with 8 panels for monitoring and operational insights.',
            numbers: '500K+ events ingested · 150+ countries · sub-5 second latency · HDFS + TimescaleDB · 8 Grafana panels',
            impact: [
                { number: '500K+', label: 'Events Ingested' },
                { number: '<5s', label: 'Streaming Latency' },
                { number: '150+', label: 'Countries Covered' }
            ],
            image: 'assets/images/Seimsmic.png',
            tags: ['Kafka', 'Spark Streaming', 'HDFS', 'TimescaleDB', 'Grafana', 'Python'],
            paper: null,
            demo: null,
            code: 'https://github.com/sa-kishor',
            featured: true,
            badge: 'Featured Project'
        },
        {
            title: 'Uber Demand Prediction Data Platform',
            problem: 'Created a scalable analytics and ML-ready data platform for city-level demand forecasting using large historical trip datasets.',
            constraint: 'Required processing for 4.5M+ records with clean transformations for BI and model training while preserving performance.',
            approach: 'Implemented a Medallion architecture (Bronze-Silver-Gold), optimized transformation layers, and integrated an XGBoost modeling pipeline with BI reporting.',
            numbers: '4.5M+ records · Medallion architecture · 40% efficiency improvement · 87% model accuracy',
            impact: [
                { number: '4.5M+', label: 'Records Processed' },
                { number: '40%', label: 'Efficiency Gain' },
                { number: '87%', label: 'XGBoost Accuracy' }
            ],
            image: 'assets/images/Uber.png',
            tags: ['Data Engineering', 'Medallion Architecture', 'XGBoost', 'Feature Engineering', 'Power BI'],
            paper: null,
            demo: null,
            code: 'https://github.com/sa-kishor',
            featured: true,
            badge: 'Data Engineering + ML Pipeline'
        }
    ];

    grid.innerHTML = '';

    var fragment = document.createDocumentFragment();

    projects.forEach(function (project) {
        var card = document.createElement('article');
        card.className = 'project-card reveal' + (project.featured ? ' project-featured' : '');

        // Build impact metrics HTML
        var impactHtml = '';
        if (project.impact && project.impact.length) {
            impactHtml = '<div class="project-impact-metric">';
            project.impact.forEach(function(stat) {
                impactHtml += '<div class="impact-stat"><span class="impact-number">' + stat.number + '</span><span class="impact-label">' + stat.label + '</span></div>';
            });
            impactHtml += '</div>';
        }

        // Build constraint story HTML
        var storyHtml =
            '<div class="project-constraint-story">' +
                '<div class="constraint-row"><span class="constraint-label">Problem</span><span class="constraint-value">' + project.problem + '</span></div>' +
                '<div class="constraint-row"><span class="constraint-label">Constraint</span><span class="constraint-value">' + project.constraint + '</span></div>' +
                '<div class="constraint-row"><span class="constraint-label">Approach</span><span class="constraint-value">' + project.approach + '</span></div>' +
                '<div class="constraint-row constraint-numbers"><span class="constraint-label">Numbers</span><span class="constraint-value">' + project.numbers + '</span></div>' +
            '</div>';

        // Build links HTML
        var linksHtml = '';
        if (project.paper) {
            linksHtml += '<a href="' + project.paper + '" class="project-card-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-file-alt"></i> Paper</a>';
        }
        if (project.demo) {
            linksHtml += '<a href="' + project.demo + '" class="project-card-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Live Demo</a>';
        }
        linksHtml += '<a href="' + project.code + '" class="project-card-link" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> Code</a>';

        var badgeHtml = project.badge
            ? '<span class="project-card-badge">' + project.badge + '</span>'
            : '';

        card.innerHTML =
            '<div class="project-card-image-wrap">' +
                '<img src="' + project.image + '" alt="' + project.title + ' — ' + project.problem.split('.')[0] + '" class="project-card-image" loading="lazy" decoding="async">' +
                badgeHtml +
            '</div>' +
            '<div class="project-card-body">' +
                '<h3 class="project-card-title">' + project.title + '</h3>' +
                impactHtml +
                storyHtml +
                '<div class="project-card-tags">' +
                    project.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join('') +
                '</div>' +
                '<div class="project-card-links">' + linksHtml + '</div>' +
            '</div>';

        var image = card.querySelector('.project-card-image');
        if (image) {
            image.addEventListener('error', function () {
                image.src = 'assets/images/new_logo.png';
                image.style.objectFit = 'cover';
            });
        }

        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    var elements = Array.prototype.slice.call(document.querySelectorAll('.reveal, .exp-item, .skill-group, .cert-item, .philosophy-content'));
    if (!elements.length) return;

    elements.forEach(function (element) {
        if (!element.classList.contains('reveal')) {
            element.classList.add('reveal');
        }
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach(function (element) {
            element.classList.add('visible');
        });
        return;
    }

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, {
            root: null,
            threshold: 0.12,
            rootMargin: '0px 0px -30px 0px'
        });

        elements.forEach(function (element) {
            revealObserver.observe(element);
        });
        return;
    }

    function revealByScroll() {
        elements.forEach(function (element) {
            var rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight - 60) {
                element.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', revealByScroll, { passive: true });
    revealByScroll();
}

// ===== YEAR =====
function setCurrentYear() {
    var element = document.getElementById('current-year');
    if (element) {
        element.textContent = new Date().getFullYear();
    }
}

// ===== IMAGE LIGHTBOX =====
function initImageLightbox() {
    var selector = '.hero-photo, .project-card-image';
    if (document.querySelector('.image-lightbox')) return;

    var overlay = document.createElement('div');
    overlay.className = 'image-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Close expanded image">&times;</button>' +
        '<img class="lightbox-image" alt="Expanded image">';

    document.body.appendChild(overlay);

    var lightboxImage = overlay.querySelector('.lightbox-image');
    var closeButton = overlay.querySelector('.lightbox-close');
    var lastFocusedElement = null;

    function openLightbox(sourceImage) {
        lastFocusedElement = document.activeElement;
        lightboxImage.src = sourceImage.getAttribute('src') || '';
        lightboxImage.alt = sourceImage.getAttribute('alt') || 'Expanded image';
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeButton.focus();
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    }

    document.addEventListener('click', function (event) {
        var target = event.target;
        if (!(target instanceof Element)) return;
        if (target.matches(selector)) {
            openLightbox(target);
        }
    });

    document.querySelectorAll(selector).forEach(function (image) {
        image.setAttribute('tabindex', '0');
        image.setAttribute('role', 'button');
        image.setAttribute('aria-label', 'Open image in full screen');
        image.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(image);
            }
        });
    });

    closeButton.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && overlay.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
            var hash = anchor.getAttribute('href') || '';
            if (hash.length < 2) return;

            var target = document.getElementById(hash.slice(1));
            if (!target) return;

            event.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - 80,
                behavior: 'smooth'
            });
            history.replaceState(null, '', hash);
        });
    });
}

// ===== VANTA-STYLE NET BACKGROUND =====
function initNetBackground() {
    if (document.querySelector('.net-bg-canvas')) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'net-bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var width = 0;
    var height = 0;
    var particles = [];
    var rafId = 0;
    var targetCount = 0;

    function isDarkTheme() {
        var explicitTheme = document.documentElement.getAttribute('data-theme');
        if (explicitTheme === 'dark') return true;
        if (explicitTheme === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function getPalette() {
        if (isDarkTheme()) {
            return {
                line: { r: 110, g: 194, b: 255, a: 0.18 },
                dot: { r: 150, g: 222, b: 255, a: 0.82 },
                glow: 'rgba(39, 174, 245, 0.07)'
            };
        }

        return {
            line: { r: 4, g: 120, b: 87, a: 0.17 },
            dot: { r: 6, g: 95, b: 70, a: 0.66 },
            glow: 'rgba(16, 185, 129, 0.06)'
        };
    }

    function rgba(color, alphaMultiplier) {
        var a = Math.max(0, Math.min(1, color.a * alphaMultiplier));
        return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + a.toFixed(3) + ')';
    }

    function setupCanvas() {
        width = Math.max(window.innerWidth, 320);
        height = Math.max(window.innerHeight, 320);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        targetCount = Math.max(32, Math.min(95, Math.round((width * height) / 21000)));
        particles = Array.from({ length: targetCount }, function () {
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28,
                z: Math.random(),
                vz: (Math.random() - 0.5) * 0.01
            };
        });
    }

    function drawFrame(isStatic) {
        var palette = getPalette();
        ctx.clearRect(0, 0, width, height);

        var glow = ctx.createRadialGradient(width * 0.2, height * 0.12, 0, width * 0.2, height * 0.12, width * 0.9);
        glow.addColorStop(0, palette.glow);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        var projections = particles.map(function (p) {
            var depth = 0.65 + p.z * 0.6;
            return {
                x: (p.x - width / 2) * depth + width / 2,
                y: (p.y - height / 2) * depth + height / 2,
                r: 0.9 + p.z * 1.3
            };
        });

        var maxDist = Math.min(140, Math.max(105, width * 0.1));
        for (var i = 0; i < projections.length; i += 1) {
            for (var j = i + 1; j < projections.length; j += 1) {
                var dx = projections[i].x - projections[j].x;
                var dy = projections[i].y - projections[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > maxDist) continue;

                var fade = 1 - dist / maxDist;
                ctx.strokeStyle = rgba(palette.line, fade);
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.moveTo(projections[i].x, projections[i].y);
                ctx.lineTo(projections[j].x, projections[j].y);
                ctx.stroke();
            }
        }

        projections.forEach(function (point) {
            ctx.fillStyle = rgba(palette.dot, 0.9);
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
            ctx.fill();
        });

        if (isStatic) return;

        particles.forEach(function (p) {
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;

            if (p.x < -25 || p.x > width + 25) p.vx *= -1;
            if (p.y < -25 || p.y > height + 25) p.vy *= -1;
            if (p.z < 0 || p.z > 1) p.vz *= -1;
        });
    }

    function animate() {
        drawFrame(false);
        rafId = window.requestAnimationFrame(animate);
    }

    function refreshMode() {
        if (mediaReduced.matches) {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
            drawFrame(true);
            return;
        }

        if (!rafId) {
            animate();
        }
    }

    function handleResize() {
        setupCanvas();
        drawFrame(true);
    }

    setupCanvas();
    refreshMode();

    window.addEventListener('resize', handleResize, { passive: true });
    mediaReduced.addEventListener('change', refreshMode);

    var themeObserver = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i += 1) {
            if (mutations[i].attributeName === 'data-theme') {
                drawFrame(true);
                break;
            }
        }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
