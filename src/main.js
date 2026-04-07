import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { SETTINGS, sunPosition } from './config.js';
import { initControlPanel } from './ui/controlPanel.js';
import { createSun } from './scene/sun.js';
import { createStarfield } from './scene/starfield.js';
import { createGalaxyBackdrop } from './scene/galaxy.js';
import { createEarth } from './scene/earth.js';
import { createMoon } from './scene/moon.js';
import { createRegionLabels, updateRegionLabels } from './scene/regions.js';

let camera, scene, renderer;
let controls;
let earthGroup, earthMesh, cloudsMesh;
let updateMoon;
let regionsGroup;
let sunGroup;
let keySunLight;
let controller1, controller2;
let worldRoot;
let vrInput = { right: null };
let vrWorldScale = 1;
const isMobileLike = /Mobi|Android|iPhone|iPad|Quest/i.test(navigator.userAgent);
let performanceMode = isMobileLike ? 'vrSmooth' : 'balanced';
let starfield;
const vrZoomConfig = {
  minScale: 0.88,
  maxScale: 1.45,
  speed: 0.9
};
const vrRotateConfig = {
  speed: 1.2,
  deadZone: 0.14
};
const PERFORMANCE_PRESETS = {
  quality: {
    pixelRatioCap: 1.8,
    starCount: 5200,
    starSize: 0.3,
    starOpacity: 0.95,
    galaxyTextureWidth: 2048,
    galaxyTextureHeight: 1024,
    galaxySegmentsW: 64,
    galaxySegmentsH: 48
  },
  balanced: {
    pixelRatioCap: 1.35,
    starCount: 3600,
    starSize: 0.27,
    starOpacity: 0.93,
    galaxyTextureWidth: 1536,
    galaxyTextureHeight: 768,
    galaxySegmentsW: 52,
    galaxySegmentsH: 36
  },
  vrSmooth: {
    pixelRatioCap: 1.0,
    starCount: 2200,
    starSize: 0.24,
    starOpacity: 0.9,
    galaxyTextureWidth: 1024,
    galaxyTextureHeight: 512,
    galaxySegmentsW: 40,
    galaxySegmentsH: 28
  }
};
const vrDefaultScale = 1.08;
const clock = new THREE.Clock();
let galaxyBackdrop;

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = null;
  worldRoot = new THREE.Group();
  scene.add(worldRoot);

  const infoEl = document.getElementById('info');
  if (infoEl) {
    infoEl.innerHTML = [
      'Realistic Earth (Space Scene)',
      'VR: Right thumbstick Y = zoom, Right thumbstick X = rotate 360 deg',
      'Trigger grab is disabled to keep Earth fixed in place'
    ].join('<br>');
  }

  // Camera
  camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1200);
  camera.position.set(0, 0.38, 4.8);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.012);
  scene.add(ambientLight);

  keySunLight = new THREE.DirectionalLight(0xfff1d2, 4.7);
  keySunLight.position.copy(sunPosition);
  scene.add(keySunLight);

  const sunBloomLight = new THREE.PointLight(0xff9b2f, 2.9, 0, 2);
  sunBloomLight.position.copy(sunPosition);
  scene.add(sunBloomLight);

  const fillLight = new THREE.DirectionalLight(0x89a8d6, 0.04);
  fillLight.position.set(-16, -9, -12);
  scene.add(fillLight);

  const hemisphere = new THREE.HemisphereLight(0x1a2d4a, 0x03060d, 0.03);
  scene.add(hemisphere);

  sunGroup = createSun();
  sunGroup.position.copy(sunPosition);
  worldRoot.add(sunGroup);

  // Earth
  const earth = createEarth({ settings: SETTINGS, sunDirection: sunPosition });
  earthGroup = earth.earthGroup;
  earthMesh = earth.earthMesh;
  cloudsMesh = earth.cloudsMesh;
  worldRoot.add(earthGroup);

  // Region labels (attach to earthMesh so they rotate with Earth spin)
  regionsGroup = createRegionLabels({ earthRadius: SETTINGS.earthRadius });
  earthMesh.add(regionsGroup);

  // Moon (child of earthGroup so it follows grabs in VR)
  const moon = createMoon({ earthRadius: SETTINGS.earthRadius });
  earthGroup.add(moon.moonPivot);
  updateMoon = moon.updateMoon;

  // Subtle rim light (keep off for stylized/flat by default)
  if (SETTINGS.style === 'realistic' || SETTINGS.style === 'procedural') {
    const rim = new THREE.DirectionalLight(0xf5f8ff, 0.08);
    rim.position.set(-12, 2, -8);
    worldRoot.add(rim);
  }

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, PERFORMANCE_PRESETS[performanceMode].pixelRatioCap));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  renderer.setClearColor(0x02030a, 1);

  // Controls (non-VR)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0, 0);
  controls.minDistance = 2.1;
  controls.maxDistance = 8.5;

  // VR Controllers
  controller1 = renderer.xr.getController(0);
  controller2 = renderer.xr.getController(1);
  scene.add(controller1);
  scene.add(controller2);

  controller1.addEventListener('connected', onControllerConnected);
  controller1.addEventListener('disconnected', onControllerDisconnected);
  controller2.addEventListener('connected', onControllerConnected);
  controller2.addEventListener('disconnected', onControllerDisconnected);

  const controllerLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
  );
  controllerLine.name = 'ray';
  controllerLine.scale.z = 6;
  controller1.add(controllerLine.clone());
  controller2.add(controllerLine.clone());

  applyPerformanceMode(performanceMode);

  // Start with a slightly reduced world scale for a more panoramic first impression in VR.
  vrWorldScale = vrDefaultScale;
  worldRoot.scale.setScalar(vrWorldScale);

  // VR Button
  document.body.appendChild(VRButton.createButton(renderer));

  // Handle window resize
  window.addEventListener('resize', onWindowResize);

  initControlPanel({
    settings: SETTINGS,
    renderer,
    keySunLight,
    getPerformanceMode: () => performanceMode,
    setPerformanceMode: (nextMode) => applyPerformanceMode(nextMode),
    getStarsEnabled: () => SETTINGS.enableStars,
    setStarsEnabled: (enabled) => {
      SETTINGS.enableStars = enabled;
      rebuildSpaceEnvironment();
    },
    getLabelsEnabled: () => (regionsGroup ? regionsGroup.visible : true),
    setLabelsEnabled: (enabled) => {
      if (regionsGroup) regionsGroup.visible = enabled;
    },
    onResetView: () => {
      worldRoot.rotation.set(0, 0, 0);
      worldRoot.position.set(0, 0, 0);
      vrWorldScale = vrDefaultScale;
      worldRoot.scale.setScalar(vrWorldScale);
      if (controls) {
        camera.position.set(0, 0.38, 4.8);
        controls.target.set(0, 0, 0);
        controls.update();
      }
    }
  });
}

function disposeObject3D(object) {
  if (!object) return;
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      } else {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }
  });
}

function rebuildSpaceEnvironment() {
  const preset = PERFORMANCE_PRESETS[performanceMode] || PERFORMANCE_PRESETS.balanced;

  if (galaxyBackdrop) {
    worldRoot.remove(galaxyBackdrop);
    disposeObject3D(galaxyBackdrop);
  }

  galaxyBackdrop = createGalaxyBackdrop({
    sunPosition,
    seed: 2026,
    textureWidth: preset.galaxyTextureWidth,
    textureHeight: preset.galaxyTextureHeight,
    widthSegments: preset.galaxySegmentsW,
    heightSegments: preset.galaxySegmentsH
  });
  worldRoot.add(galaxyBackdrop);

  if (starfield) {
    worldRoot.remove(starfield);
    disposeObject3D(starfield);
    starfield = null;
  }

  if (SETTINGS.enableStars) {
    starfield = createStarfield({
      starCount: preset.starCount,
      size: preset.starSize,
      opacity: preset.starOpacity
    });
    worldRoot.add(starfield);
  }
}

function applyPerformanceMode(nextMode) {
  if (!PERFORMANCE_PRESETS[nextMode]) return;
  performanceMode = nextMode;
  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, PERFORMANCE_PRESETS[performanceMode].pixelRatioCap));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  rebuildSpaceEnvironment();
}

function onControllerConnected(event) {
  event.target.userData.inputSource = event.data;
  event.target.userData.handedness = event.data?.handedness || '';
}

function onControllerDisconnected(event) {
  const controller = event.target;
  controller.userData.inputSource = null;
  controller.userData.handedness = '';
  if (controller === controller2) vrInput.right = null;
}

function getRightController() {
  const rightController =
    controller1?.userData?.handedness === 'right'
      ? controller1
      : controller2?.userData?.handedness === 'right'
      ? controller2
      : controller2;

  return rightController;
}

function extractPrimaryAxes(inputSource) {
  const gamepad = inputSource?.gamepad;
  if (!gamepad || !gamepad.axes || gamepad.axes.length === 0) {
    return null;
  }

  if (gamepad.axes.length >= 4) {
    const pair0 = Math.abs(gamepad.axes[0]) + Math.abs(gamepad.axes[1]);
    const pair1 = Math.abs(gamepad.axes[2]) + Math.abs(gamepad.axes[3]);
    if (pair1 > pair0) {
      return { x: gamepad.axes[2], y: gamepad.axes[3] };
    }
  }

  return { x: gamepad.axes[0] || 0, y: gamepad.axes[1] || 0 };
}

function applyDeadZone(value, deadZone) {
  if (Math.abs(value) < deadZone) return 0;
  const sign = Math.sign(value);
  const normalized = (Math.abs(value) - deadZone) / (1 - deadZone);
  return sign * normalized;
}

function updateVRInputSources() {
  const rightController = getRightController();
  vrInput.right = extractPrimaryAxes(rightController?.userData?.inputSource);
}

function updateVRMovement(deltaSeconds) {
  if (!renderer.xr.isPresenting || !worldRoot) return;

  updateVRInputSources();
  const zoomAxes = vrInput.right;

  if (zoomAxes) {
    const zoomY = applyDeadZone(zoomAxes.y, vrRotateConfig.deadZone);
    const rotateX = applyDeadZone(zoomAxes.x, vrRotateConfig.deadZone);

    if (zoomY !== 0) {
      vrWorldScale -= zoomY * vrZoomConfig.speed * deltaSeconds;
      vrWorldScale = THREE.MathUtils.clamp(vrWorldScale, vrZoomConfig.minScale, vrZoomConfig.maxScale);
      worldRoot.scale.setScalar(vrWorldScale);
    }

    if (rotateX !== 0) {
      worldRoot.rotation.y -= rotateX * vrRotateConfig.speed * deltaSeconds;
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  const deltaSeconds = clock.getDelta();

  // Spin Earth around its axis
  earthMesh.rotation.y += SETTINGS.earthSpin;
  if (cloudsMesh && cloudsMesh.visible) cloudsMesh.rotation.y += SETTINGS.cloudsSpin;
  if (updateMoon) updateMoon();

  // Enable/disable OrbitControls depending on XR
  const presenting = renderer.xr.isPresenting;
  if (controls) {
    controls.enabled = !presenting;
    if (!presenting) controls.update();
  }

  if (presenting) {
    updateVRMovement(deltaSeconds);
  }

  // Update region labels to face camera
  if (regionsGroup && renderer.xr.isPresenting) {
    updateRegionLabels(regionsGroup, renderer.xr.getCamera(camera));
  }

  renderer.render(scene, camera);
}
