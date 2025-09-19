import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.getElementById('hero-3d-canvas');

// Siguraduhin na may canvas element bago simulan ang Three.js
if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Idagdag ang ilaw sa scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

// ===== ADD: globals =====
let model = null;
let fittedCamZ = null;
// ========================

// I-load ang 3D model
const loader = new GLTFLoader();
loader.load(
  '../assets/models/headsets/scene.gltf',
  function (gltf) {
    // I-adjust ang scale ng model
    model = gltf.scene;                        // <-- CHANGED: itabi sa global
    model.scale.set(50, 50, 50);
    model.position.set(-450, 0, 0);

    // ---- ADD: i-center at i-fit ang camera sa model ----
    // Kunin ang bounding box pagkatapos ma-scale/position
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // I-center ang model sa origin para pantay ang ikot/fit
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);

    // Recompute box pagkatapos i-center
    const box2 = new THREE.Box3().setFromObject(model);
    const size2 = box2.getSize(new THREE.Vector3());
    const maxDim = Math.max(size2.x, size2.y, size2.z);

    const fov = (camera.fov * Math.PI) / 180;
    const dist = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.3; // may konting offset
    fittedCamZ = THREE.MathUtils.clamp(dist, 100, 50000);

    // Tapatin ang camera sa gitna at tingnan ang origin
    camera.position.set(0, 0, fittedCamZ);
    camera.lookAt(0, 0, 0);
    // -----------------------------------------------------

    scene.add(model);
    animate();
  },
  undefined,
  function (error) {
    console.error('May error sa pag-load ng model:', error);
  }
);

// Function para i-adjust ang camera based sa screen size
function adjustCameraForScreenSize() {
  const isMobile = window.innerWidth < 768; // Halimbawa lang ng breakpoint
  if (fittedCamZ !== null) {
    // Ilapit o ilayo batay sa na-compute na tamang distansya
    camera.position.z = isMobile ? fittedCamZ * 1.5 : fittedCamZ; // mas malayo ng bahagya sa mobile
  } else {
    // fallback (bago pa ma-load ang model)
    camera.position.z = 1500;
  }
  camera.aspect = window.innerWidth / window.innerHeight; // ADD: siguraduhing tama ang aspect
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Unang pag-set ng camera position
adjustCameraForScreenSize();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // Gawing dahan-dahan ang pag-ikot ng model (HINDI scene)
  if (model) model.rotation.y += 0.008;        // <-- CHANGED
  // scene.rotation.y += 0.008;                 // <-- REMOVE ito
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  adjustCameraForScreenSize();
});
}