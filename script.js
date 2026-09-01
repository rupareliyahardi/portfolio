// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Configure ScrollTrigger for maximum performance
ScrollTrigger.config({
    limitCallbacks: true,
    syncInterval: 50
});

// ================= 1. PAGE SCROLL PROGRESS & ACTIVE INDICATOR =================
const pageNumDisplay = document.getElementById('current-page-num');
const progressFill = document.getElementById('progressFill');

// Fast, throttled scroll progress tracking using requestAnimationFrame
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0 && progressFill) {
                progressFill.style.width = ((scrollTop / docHeight) * 100) + '%';
            }
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Track current active page (01 / 10)
const spreads = gsap.utils.toArray('.pdf-spread');
spreads.forEach(spread => {
    ScrollTrigger.create({
        trigger: spread,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => updatePageNum(spread.dataset.page),
        onEnterBack: () => updatePageNum(spread.dataset.page)
    });
});

function updatePageNum(num) {
    if (pageNumDisplay && num) {
        pageNumDisplay.textContent = String(num).padStart(2, '0');
    }
}


// ================= 2. LIGHTWEIGHT SECTION REVEALS & PARALLAX =================
// Animate elements per spread smoothly without creating heavy per-element scrubbers
spreads.forEach(spread => {
    const movers = spread.querySelectorAll('.mover');
    if (movers.length > 0 && !spread.classList.contains('page-cover')) {
        gsap.fromTo(movers,
            { 
                y: 35, 
                opacity: 0.15 
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: spread,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }
});


// ================= 3. COVER PAGE INITIAL ENTRY =================
const coverTl = gsap.timeline({ delay: 0.1 });

coverTl.from(".line-anim", {
    scaleX: 0,
    transformOrigin: "left center",
    duration: 1.0,
    ease: "power3.inOut",
    stagger: 0.2
})
.from(".cover-main-title", {
    opacity: 0,
    y: 40,
    duration: 0.9,
    ease: "power2.out"
}, "-=0.6")
.from(".cover-author-tag", {
    opacity: 0,
    x: 20,
    duration: 0.7,
    ease: "power2.out"
}, "-=0.4")
.from(".page-cover .split-right", {
    opacity: 0,
    duration: 1.0,
    ease: "power2.out"
}, 0);


// ================= 4. DYNAMIC AMBIENT BACKGROUND SWITCHER =================
const bgLayers = {
    collage: document.getElementById('bg-layer-collage'),
    rivayat: document.getElementById('bg-layer-rivayat'),
    kasuriya: document.getElementById('bg-layer-kasuriya'),
    coffeetable: document.getElementById('bg-layer-coffeetable')
};

let currentBg = 'collage';

function activateBg(activeKey) {
    if (currentBg === activeKey) return;
    currentBg = activeKey;
    
    Object.keys(bgLayers).forEach(key => {
        const layer = bgLayers[key];
        if (layer) {
            if (key === activeKey) {
                layer.classList.add('active');
                if (key === 'rivayat') {
                    const video = layer.querySelector('video');
                    if (video) {
                        video.play().catch(() => {});
                    }
                }
            } else {
                layer.classList.remove('active');
            }
        }
    });
}

// 1. Pages 1, 2, 3 (Cover, About, Contents) -> Collage of All Works
ScrollTrigger.create({
    trigger: "#page-1",
    endTrigger: "#page-3",
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => activateBg('collage'),
    onEnterBack: () => activateBg('collage')
});

// 2. Pages 4, 5, 6 (Rivayat) -> Rivayat Architecture Atmosphere
ScrollTrigger.create({
    trigger: "#page-4",
    endTrigger: "#page-6",
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => activateBg('rivayat'),
    onEnterBack: () => activateBg('rivayat')
});

// 3. Pages 7, 8 (Kasuriya) -> Kasuriya Lamp & Craft Atmosphere
ScrollTrigger.create({
    trigger: "#page-7",
    endTrigger: "#page-8",
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => activateBg('kasuriya'),
    onEnterBack: () => activateBg('kasuriya')
});

// 4. Pages 9, 10 (Coffee Table) -> Modular Table & Woodworking Atmosphere
ScrollTrigger.create({
    trigger: "#page-9",
    endTrigger: "#page-10",
    start: "top 60%",
    end: "bottom bottom",
    onEnter: () => activateBg('coffeetable'),
    onEnterBack: () => activateBg('coffeetable')
});


// ================= 5. LIGHTWEIGHT CARD HOVER TILT =================
const cards = document.querySelectorAll('.shadow-hover');
let rafId = null;

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.03;
            const y = -(e.clientY - rect.top - rect.height / 2) * 0.03;
            card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg)`;
        });
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    });
});


// ================= 6. FULLSCREEN IMAGE LIGHTBOX =================
const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.querySelector('.lightbox-close');

document.querySelectorAll('.shadow-hover img, .zoom-target').forEach(img => {
    img.addEventListener('click', () => {
        if (lightbox && lightboxImg) {
            lightbox.style.display = "flex";
            lightboxImg.src = img.src;
            if (lightboxCaption) {
                lightboxCaption.textContent = img.alt || "Portfolio Image Inspection";
            }
        }
    });
});

if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        lightbox.style.display = "none";
    });
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
        }
    });
}
