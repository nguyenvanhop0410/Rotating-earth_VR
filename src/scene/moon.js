import * as THREE from 'three';

export function createMoon({ earthRadius = 1.2 } = {}) {
  const moonPivot = new THREE.Group();

  // Real-ish proportions
  const moonRadius = earthRadius * 0.273;
  const orbitRadius = earthRadius * 3.25;

  const geometry = new THREE.SphereGeometry(moonRadius, 96, 72);

  // Fallback material (in case texture fails to load)
  const material = new THREE.MeshStandardMaterial({
    color: 0xb8b8b8,
    roughness: 1.0,
    metalness: 0.0
  });

  const moonMesh = new THREE.Mesh(geometry, material);
  moonMesh.position.set(orbitRadius, 0.1, 0);
  moonPivot.add(moonMesh);

  // Subtle orbital inclination
  moonPivot.rotation.z = THREE.MathUtils.degToRad(5.1);

  // Start angle so it’s not perfectly aligned
  moonPivot.rotation.y = THREE.MathUtils.degToRad(35);

  // Texture (optional)
  loadTexture('https://threejs.org/examples/textures/planets/moon_1024.jpg')
    .then((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = 8;
      moonMesh.material.map = tex;
      moonMesh.material.needsUpdate = true;
    })
    .catch(() => {
      // keep fallback
    });

  // Animation
  const orbitSpeed = 0.00035;
  const spinSpeed = 0.00055;

  function updateMoon() {
    moonPivot.rotation.y += orbitSpeed;
    moonMesh.rotation.y += spinSpeed;
  }

  return { moonPivot, moonMesh, updateMoon };
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(url, resolve, undefined, reject);
  });
}
