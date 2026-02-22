/**
 * AETHERIA CORE v5.0
 * Nuclear Hardened Interaction & Visuals
 */

const AETHERIA = {
    state: { mx: 0, my: 0, cx: 0, cy: 0, st: 0, sa: 0 },
    isGallery: !!document.getElementById('galleryWrapper'),
    isAscent: !!document.querySelector('.story-wrapper')
};

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SYSTEM REVEAL ---
    const loader = document.getElementById('loader');
    const transition = document.querySelector('.page-transition');

    const reveal = () => {
        console.log("AETHERIA: Reveal Triggered");
        if (loader) loader.classList.add('hidden');
        if (transition) {
            transition.style.transition = 'none';
            transition.style.transform = 'scaleY(1)';
            transition.style.visibility = 'visible';
            requestAnimationFrame(() => {
                transition.style.transition = 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)';
                transition.style.transform = 'scaleY(0)';
                setTimeout(() => { transition.style.visibility = 'hidden'; }, 800);
            });
        }
    };

    window.addEventListener('load', reveal);
    setTimeout(reveal, 1200); // Fail-safe reveal

    // --- 2. MOTION ENGINE ---
    const loop = () => {
        // Cursor
        AETHERIA.state.cx += (AETHERIA.state.mx - AETHERIA.state.cx) * 0.15;
        AETHERIA.state.cy += (AETHERIA.state.my - AETHERIA.state.cy) * 0.15;
        const dot = document.querySelector('.cursor-dot');
        const circle = document.querySelector('.cursor-circle');
        if (dot) dot.style.transform = `translate3d(${AETHERIA.state.mx}px, ${AETHERIA.state.my}px, 0)`;
        if (circle) circle.style.transform = `translate3d(${AETHERIA.state.cx - 20}px, ${AETHERIA.state.cy - 20}px, 0)`;

        // Horizontal Scroll
        const wrapper = document.getElementById('galleryWrapper');
        if (AETHERIA.isGallery && wrapper) {
            AETHERIA.state.sa += (AETHERIA.state.st - AETHERIA.state.sa) * 0.08;
            wrapper.style.transform = `translate3d(${-AETHERIA.state.sa}px, 0, 0)`;
            const max = wrapper.scrollWidth - window.innerWidth;
            AETHERIA.state.st = Math.max(0, Math.min(AETHERIA.state.st, max));
        }

        requestAnimationFrame(loop);
    };
    loop();

    // --- 3. LISTENERS ---
    document.addEventListener('mousemove', (e) => {
        AETHERIA.state.mx = e.clientX;
        AETHERIA.state.my = e.clientY;
    });

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;

        e.preventDefault();
        if (transition) {
            transition.style.visibility = 'visible';
            transition.style.transform = 'scaleY(1)';
            setTimeout(() => window.location.href = href, 750);
        } else {
            window.location.href = href;
        }
    });

    // Scroll Bridge
    window.addEventListener('wheel', (e) => {
        if (AETHERIA.isGallery) AETHERIA.state.st += e.deltaY;
    }, { passive: true });

    // Menu
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('menuOverlay');
    if (toggle && menu) toggle.addEventListener('click', () => menu.classList.toggle('active'));

    // --- 4. PAGE LOGIC ---
    if (AETHERIA.isAscent) {
        const story = document.querySelector('.story-wrapper');
        const scenes = document.querySelectorAll('.story-img');
        const texts = document.querySelectorAll('.story-text');
        const floorHUD = document.getElementById('floorDisplay');
        window.addEventListener('scroll', () => {
            const r = story.getBoundingClientRect();
            const p = Math.max(0, Math.min(1, (-r.top) / (story.offsetHeight - window.innerHeight)));
            const idx = Math.floor(p * 3.99);
            scenes.forEach((s, i) => s.classList.toggle('active', i === idx));
            texts.forEach((t, i) => t.classList.toggle('active', i === idx));
            if (floorHUD) floorHUD.textContent = String(Math.floor(p * 104)).padStart(3, '0');
        });
    }

    // Modal
    const modal = document.getElementById('residenceModal');
    const triggers = document.querySelectorAll('.residence-trigger');
    const toggleModal = (data = null) => {
        if (!modal) return;
        if (data) {
            document.getElementById('modalTitle').textContent = data.title;
            document.getElementById('modalFloorplan').src = data.floorplan;
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
        }
    };
    triggers.forEach(t => t.addEventListener('click', () => toggleModal(t.dataset)));
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) closeBtn.addEventListener('click', () => toggleModal());

    // HUD Clock
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        const updateTime = () => { timeDisplay.textContent = `HUD-TIME: ${new Date().toTimeString().split(' ')[0]}`; };
        setInterval(updateTime, 1000); updateTime();
    }

    // --- 5. 3D Engine ---
    const init3D = () => {
        const container = document.getElementById('canvas-container');
        if (!container || typeof THREE === 'undefined') return;
        const scene = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        cam.position.z = 5;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        const geo = new THREE.IcosahedronGeometry(2, 0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, flatShading: true });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh); scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const animate = () => {
            requestAnimationFrame(animate);
            mesh.rotation.x += 0.001; mesh.rotation.y += 0.002;
            renderer.render(scene, cam);
        };
        animate();
    };
    init3D();
});