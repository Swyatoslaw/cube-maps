import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const FACE_URLS = [
  "textures/cube_planet_side_1.png", // +X right
  "textures/cube_planet_side_1.png", // -X left
  "textures/cube_planet_side_1.png", // +Y top
  "textures/cube_planet_side_1.png", // -Y bottom
  "textures/cube_planet_side_1.png", // +Z front
  "textures/cube_planet_side_1.png", // -Z back
];

const canvas = document.getElementById("scene");
const loadingEl = document.getElementById("loading");
const autoRotateBtn = document.getElementById("autoRotateBtn");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(3.2, 2, 4.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// --- Lighting ---
scene.add(new THREE.AmbientLight(0x8899ff, 0.6));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
keyLight.position.set(5, 4, 6);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x6688ff, 0.5);
rimLight.position.set(-6, -3, -4);
scene.add(rimLight);

// --- Starfield background ---
function createStarfield() {
  const starCounts = [2600, 1400, 700];
  const radii = [420, 300, 200];
  const sizes = [0.55, 0.9, 1.4];
  const opacities = [0.55, 0.75, 0.95];

  const group = new THREE.Group();

  for (let layer = 0; layer < starCounts.length; layer++) {
    const count = starCounts[layer];
    const radius = radii[layer];
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = radius * (0.6 + 0.4 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: sizes[layer],
      sizeAttenuation: true,
      transparent: true,
      opacity: opacities[layer],
      depthWrite: false,
      map: createStarSprite(),
      alphaTest: 0.01,
    });

    group.add(new THREE.Points(geometry, material));
  }

  return group;
}

function createStarSprite() {
  const size = 64;
  const canvas2d = document.createElement("canvas");
  canvas2d.width = size;
  canvas2d.height = size;
  const ctx = canvas2d.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas2d);
  texture.needsUpdate = true;
  return texture;
}

scene.add(createStarfield());

// --- Cube ---
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
  loadingEl.classList.add("is-hidden");
};

const textureLoader = new THREE.TextureLoader(loadingManager);

const materials = FACE_URLS.map((url) => {
  const texture = textureLoader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.55,
    metalness: 0.05,
  });
});

const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(cubeGeometry, materials);
scene.add(cube);

const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(cubeGeometry),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
);
cube.add(edges);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 12;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.4;
controls.rotateSpeed = 0.75;
controls.zoomSpeed = 0.8;
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_ROTATE,
};

autoRotateBtn.addEventListener("click", () => {
  controls.autoRotate = !controls.autoRotate;
  autoRotateBtn.textContent = `Auto-rotate: ${controls.autoRotate ? "On" : "Off"}`;
  autoRotateBtn.setAttribute("aria-pressed", String(controls.autoRotate));
});

// Pausing auto-rotate feels better once a user starts interacting manually.
controls.addEventListener("start", () => {
  if (controls.autoRotate) {
    controls.autoRotate = false;
    autoRotateBtn.textContent = "Auto-rotate: Off";
    autoRotateBtn.setAttribute("aria-pressed", "false");
  }
});

// --- Resize handling ---
function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener("resize", onResize);
window.addEventListener("orientationchange", onResize);

// --- Animation loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
