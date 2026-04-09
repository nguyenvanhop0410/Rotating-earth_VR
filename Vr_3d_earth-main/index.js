import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { VRButton } from 'jsm/webxr/VRButton.js';
import getStarfield from "./src/getStarfield.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.2, 5.6);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer, { optionalFeatures: ['local-floor'] }));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.9;
controls.maxDistance = 10;

const ambient = new THREE.AmbientLight(0x9fb9de, 0.12);
const sun = new THREE.DirectionalLight(0xffffff, 1.45);
sun.position.set(6, 3, 5);
const fill = new THREE.DirectionalLight(0x7ca8df, 0.18);
fill.position.set(-4, -2, -3);
scene.add(ambient, sun, fill);

const EARTH_RADIUS = 2;
const globe = new THREE.Group();
globe.rotation.z = THREE.MathUtils.degToRad(23.4); // nghiêng trục Trái Đất
scene.add(globe);

const textureLoader = new THREE.TextureLoader();
const earthMat = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  shininess: 26,
  specular: 0x5a7da8,
});
textureLoader.load(
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  (map) => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    earthMat.map = map;
    earthMat.needsUpdate = true;
  }
);
textureLoader.load(
  'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
  (normalMap) => {
    normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    earthMat.normalMap = normalMap;
    earthMat.normalScale = new THREE.Vector2(0.42, 0.42);
    earthMat.needsUpdate = true;
  }
);
textureLoader.load(
  'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  (specularMap) => {
    specularMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    earthMat.specularMap = specularMap;
    earthMat.needsUpdate = true;
  }
);
textureLoader.load(
  'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
  (emissiveMap) => {
    emissiveMap.colorSpace = THREE.SRGBColorSpace;
    emissiveMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    earthMat.emissiveMap = emissiveMap;
    earthMat.emissive = new THREE.Color(0xffbe6f);
    earthMat.emissiveIntensity = 0.08;
    earthMat.needsUpdate = true;
  }
);

const earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 64, 64), earthMat);
earth.rotation.y = THREE.MathUtils.degToRad(-70);
globe.add(earth);

const cloudMat = new THREE.MeshPhongMaterial({
  transparent: true,
  opacity: 0.17,
  depthWrite: false,
  blending: THREE.NormalBlending,
});
textureLoader.load(
  'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
  (cloudMap) => {
    cloudMap.colorSpace = THREE.SRGBColorSpace;
    cloudMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    cloudMat.map = cloudMap;
    cloudMat.needsUpdate = true;
  }
);
const clouds = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.011, 64, 64), cloudMat);
clouds.rotation.y = earth.rotation.y;
globe.add(clouds);

const stars = getStarfield({ numStars: 700, fog: false });
scene.add(stars);

const clock = new THREE.Clock();

function renderLoop() {
  const dt = clock.getDelta();

  earth.rotation.y += dt * 0.09;
  clouds.rotation.y += dt * 0.11;
  stars.rotation.y -= dt * 0.002;

  if (!renderer.xr.isPresenting) {
    controls.update();
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(renderLoop);

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);