// assets/js/va-page.js — VA page (navbar toggle + page-wipe + scroll FX + HERO 3D fit)

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

document.addEventListener('DOMContentLoaded', () => {
  // ===== Mobile nav toggle =====
  const burger = document.querySelector('.dcp-burger');
  const nav = document.querySelector('.dcp-nav');
  burger?.addEventListener('click', () => nav?.classList.toggle('dcp-open'));

  // Close menu after navigating to anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => nav?.classList.remove('dcp-open'));
  });

  // ===== Page-wipe: support wipe-left (default) & wipe-right (for "Main Page") =====
  const overlay = document.querySelector('.page-wipe');
  document.querySelectorAll('a[data-wipe], a[data-wipe="right"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      const dir = a.getAttribute('data-wipe'); // "right" or null
      if (!href || href.startsWith('#')) return;
      e.preventDefault();

      if (overlay){
        // apply direction
        if (dir === 'right'){
          overlay.classList.remove('is-active');      // ensure not left
          overlay.classList.add('is-active-right');
        }else{
          overlay.classList.remove('is-active-right');
          overlay.classList.add('is-active');
        }
        setTimeout(() => { window.location.href = href; }, 600);
      }else{
        window.location.href = href;
      }
    });
  });

  // ===== Scroll animations (play on enter / reverse on leave) =====
  const selectors = [
    '.hero-text',
    '#va-about .about-container',
    '#va-intro .pro-provider-container',
    '#va-services-list .service-card',
    '#va-contact .contact-form',
    '.footer .footer-columns'
  ];

  const targets = [];
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    return (r.bottom >= 0 && r.right >= 0 && r.top <= vh && r.left <= vw);
    };

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('scroll-fx');
      if (inView(el)) el.classList.add('in'); else el.classList.add('out');
      targets.push(el);
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) { el.classList.add('in'); el.classList.remove('out'); }
      else { el.classList.add('out'); el.classList.remove('in'); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => io.observe(el));

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(el => { el.classList.add('in'); el.classList.remove('out'); });
  }
});

/* =========================
   HERO 3D — fit inside hero, slightly lower & larger
   ========================= */
const hero = document.getElementById('va-hero');
const canvas = document.getElementById('hero-3d-canvas');

if (hero && canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const dir = new THREE.DirectionalLight(0xffffff, 0.65);
  dir.position.set(5, 7, 6);
  scene.add(dir);

  let model = null;
  let radius = 1;
  let distanceFit = 1200;

  const FILL_FACTOR = 0.92;
  const VERTICAL_OFFSET_FACTOR = 0.08;

  const fitCameraToObject = () => {
    const w = hero.clientWidth || 1;
    const h = hero.clientHeight || 1;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    if (!model) return;

    const box = new THREE.Box3().setFromObject(model);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    radius = sphere.radius || 1;

    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * camera.aspect);

    const distV = radius / Math.sin(vFOV / 2);
    const distH = radius / Math.sin(hFOV / 2);

    distanceFit = Math.max(distV, distH) * FILL_FACTOR;

    camera.position.set(0, 0, distanceFit);
    camera.lookAt(0, 0, 0);
  };

  const loader = new GLTFLoader();
  loader.load(
    '../assets/models/headsets/scene.gltf',
    (gltf) => {
      model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 520;
      const s = targetSize / maxDim;
      model.scale.setScalar(s);

      model.position.y -= targetSize * VERTICAL_OFFSET_FACTOR;

      scene.add(model);
      fitCameraToObject();
      animate();
    },
    undefined,
    (err) => console.error('Model load error:', err)
  );

  const resizeObserver = new ResizeObserver(() => fitCameraToObject());
  resizeObserver.observe(hero);
  window.addEventListener('resize', fitCameraToObject);

  function animate() {
    requestAnimationFrame(animate);
    if (model) model.rotation.y += 0.008;
    renderer.render(scene, camera);
  }
}
