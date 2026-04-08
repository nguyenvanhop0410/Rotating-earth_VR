import * as THREE from 'three';

export function createSatellite({ earthRadius = 1.2 } = {}) {
  const satelliteGroup = new THREE.Group();
  satelliteGroup.name = 'satellite';
  const sizeScale = 0.55;

  const orbitRadius = earthRadius * 4.4;
  const orbitInclination = THREE.MathUtils.degToRad(28);

  const pivot = new THREE.Group();
  pivot.rotation.z = orbitInclination;
  satelliteGroup.add(pivot);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xbfc7d2,
    metalness: 0.55,
    roughness: 0.35
  });

  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f3f7a,
    metalness: 0.1,
    roughness: 0.45
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.22, 0.28),
    bodyMaterial
  );
  body.position.set(orbitRadius, 0, 0);
  body.scale.setScalar(sizeScale);
  pivot.add(body);

  const bus = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.24, 12),
    new THREE.MeshStandardMaterial({
      color: 0xe3b23c,
      metalness: 0.35,
      roughness: 0.4
    })
  );
  bus.rotation.z = Math.PI / 2;
  body.add(bus);

  const panelGeometry = new THREE.BoxGeometry(0.9, 0.04, 0.55);
  const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  leftPanel.position.set(-0.55, 0, 0);
  body.add(leftPanel);

  const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  rightPanel.position.set(0.55, 0, 0);
  body.add(rightPanel);

  const panelFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0xcfd6df,
    metalness: 0.35,
    roughness: 0.5
  });

  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 0.59), panelFrameMaterial);
  frameL.position.set(-0.55, 0, 0);
  leftPanel.add(frameL);

  const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 0.59), panelFrameMaterial);
  frameR.position.set(0.55, 0, 0);
  rightPanel.add(frameR);

  const antenna = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.18, 10),
    new THREE.MeshStandardMaterial({
      color: 0xd9dde4,
      metalness: 0.5,
      roughness: 0.35
    })
  );
  antenna.rotation.z = -Math.PI / 2;
  antenna.position.set(0.18, 0.1, 0);
  body.add(antenna);

  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0xf5f7fa,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    })
  );
  dish.rotation.z = -Math.PI / 2;
  dish.position.set(0.26, -0.02, 0);
  body.add(dish);

  const orbitLine = createOrbitLine(orbitRadius);
  satelliteGroup.add(orbitLine);

  const orbitSpeed = 0.00022;
  const bodySpinSpeed = 0.00075;

  function updateSatellite() {
    pivot.rotation.y += orbitSpeed;
    body.rotation.z = Math.sin(performance.now() * 0.0012) * 0.08;
    body.rotation.y += bodySpinSpeed;
    body.lookAt(0, 0, 0);
    body.rotateY(Math.PI / 2);
  }

  return { satelliteGroup, updateSatellite };
}

function createOrbitLine(radius) {
  const points = [];
  const segments = 128;

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x5f7fa8,
    transparent: true,
    opacity: 0.25
  });

  const line = new THREE.Line(geometry, material);
  line.rotation.z = THREE.MathUtils.degToRad(28);
  return line;
}