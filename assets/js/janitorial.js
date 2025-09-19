// janitorial.js — Three.js hero (no GSAP)
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* Stable mobile 100vh var */
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVH, { passive: true });
setVH();

/* Three.js setup */
const container = document.getElementById('hero-3d-model-container');

if (container) {
  const scene = new THREE.Scene();

  const FOV = 75, NEAR = 0.1, FAR = 1000;
  const camera = new THREE.PerspectiveCamera(
    FOV,
    (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
    NEAR, FAR
  );

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(3, 5, 7);
  scene.add(dir);

  const MODEL_URL = container.getAttribute('data-model') || '../assets/models/janitorial/scene.gltf';
  const loader = new GLTFLoader();
  let root = new THREE.Group();

  loader.load(
    MODEL_URL,
    (gltf) => {
      root = gltf.scene || gltf.scenes[0];
      scene.add(root);
      root.rotation.set(0, 0, 0);
      root.scale.set(1, 1, 1);
      fitCameraToObject(camera, root, 1.25);
      renderer.render(scene, camera);
    },
    undefined,
    (err) => console.warn('[janitorial.js] GLTF load failed:', err)
  );

  function fitCameraToObject(cam, object3D, offset = 1.3) {
    const box = new THREE.Box3().setFromObject(object3D);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (cam.fov * Math.PI) / 180;
    let cameraZ = (maxDim / 2) / Math.tan(fov / 2);
    cameraZ *= offset;
    cam.position.set(center.x, center.y, cameraZ + center.z);
    cam.lookAt(center);
    cam.updateProjectionMatrix();
  }

  function handleResize() {
    if (!container) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  function animate() {
    requestAnimationFrame(animate);
    if (root && root.rotation) root.rotation.y += 0.005;
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', handleResize, { passive: true });
  handleResize();
  animate();
}
