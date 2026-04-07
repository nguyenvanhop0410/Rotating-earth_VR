import * as THREE from 'three';

// Geographic regions calibrated for the current Earth texture orientation.
export const REGIONS = [
  // North America
  { name: 'Bắc Mỹ', lat: 44, lon: -102, color: 0x5dade2, labelScale: 0.34 },
  { name: 'New York', lat: 40.71, lon: -74.0, color: 0x7fb3d5, labelScale: 0.24 },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24, color: 0x7fb3d5, labelScale: 0.23 },
  { name: 'Mexico City', lat: 19.43, lon: -99.13, color: 0x7fb3d5, labelScale: 0.22 },

  // South America
  { name: 'Nam Mỹ', lat: -15, lon: -60, color: 0xf8b739, labelScale: 0.34 },
  { name: 'Rio', lat: -22.91, lon: -43.17, color: 0xf9ca7a, labelScale: 0.22 },
  { name: 'Buenos Aires', lat: -34.6, lon: -58.38, color: 0xf9ca7a, labelScale: 0.22 },

  // Southeast / East Asia
  { name: 'Đông Nam Á', lat: 12, lon: 106, color: 0xff6b6b, labelScale: 0.31 },
  { name: 'Việt Nam', lat: 16.2, lon: 106.3, color: 0xff3b30, labelScale: 0.30 },
  { name: 'Bangkok', lat: 13.75, lon: 100.5, color: 0xff8a80, labelScale: 0.21 },
  { name: 'Singapore', lat: 1.35, lon: 103.82, color: 0xff8a80, labelScale: 0.21 },
  { name: 'Đông Á', lat: 35, lon: 110, color: 0xaa96da, labelScale: 0.30 },
  { name: 'Tokyo', lat: 35.67, lon: 139.65, color: 0xc4b4ea, labelScale: 0.21 },
  { name: 'Seoul', lat: 37.57, lon: 126.98, color: 0xc4b4ea, labelScale: 0.21 },
  { name: 'Bắc Kinh', lat: 39.9, lon: 116.4, color: 0xc4b4ea, labelScale: 0.21 },

  // Europe
  { name: 'Châu Âu', lat: 50, lon: 15, color: 0xaf7ac5, labelScale: 0.30 },
  { name: 'London', lat: 51.51, lon: -0.13, color: 0xc39bd3, labelScale: 0.21 },
  { name: 'Paris', lat: 48.86, lon: 2.35, color: 0xc39bd3, labelScale: 0.21 },
  { name: 'Rome', lat: 41.9, lon: 12.49, color: 0xc39bd3, labelScale: 0.21 },

  // Africa
  { name: 'Châu Phi', lat: 5, lon: 20, color: 0x76d7c4, labelScale: 0.31 },
  { name: 'Cairo', lat: 30.04, lon: 31.24, color: 0xa3e4d7, labelScale: 0.21 },
  { name: 'Lagos', lat: 6.52, lon: 3.37, color: 0xa3e4d7, labelScale: 0.21 },
  { name: 'Cape Town', lat: -33.92, lon: 18.42, color: 0xa3e4d7, labelScale: 0.21 },

  // Oceania
  { name: 'Úc', lat: -25, lon: 134, color: 0xfed8b1, labelScale: 0.31 },
  { name: 'Sydney', lat: -33.86, lon: 151.21, color: 0xffe1c6, labelScale: 0.21 },
  { name: 'Auckland', lat: -36.85, lon: 174.76, color: 0xffe1c6, labelScale: 0.21 }
];

const MAP_LONGITUDE_OFFSET_DEG = 0;
const MAP_LONGITUDE_DIRECTION = -1;

export function createRegionLabels({ earthRadius = 1.2 } = {}) {
  const regionsGroup = new THREE.Group();
  regionsGroup.name = 'regions';

  // Keep markers/labels close to surface so they look pinned to land.
  const markerRadius = earthRadius * 1.001;
  const labelOffsetRatio = 1.045;
  const labelRadius = earthRadius * labelOffsetRatio;

  REGIONS.forEach((region) => {
    const surfacePos = latLonToCartesian(region.lat, region.lon, markerRadius);
    const labelPos = latLonToCartesian(region.lat, region.lon, labelRadius);

    const markerGeometry = new THREE.SphereGeometry(0.012, 10, 10);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: region.color,
      fog: false
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(surfacePos);
    marker.name = 'marker';
    regionsGroup.add(marker);

    const labelSprite = createSimpleTextLabel(region.name, region.color);
    labelSprite.position.copy(labelPos);
    labelSprite.scale.set(region.labelScale, region.labelScale * 0.24, 1);
    labelSprite.userData = { ...region, position: labelPos, type: 'label' };
    regionsGroup.add(labelSprite);

    marker.userData = { ...region, position: surfacePos, type: 'marker' };
  });

  return regionsGroup;
}

function latLonToCartesian(lat, lon, radius) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const adjustedLon = (lon + MAP_LONGITUDE_OFFSET_DEG) * MAP_LONGITUDE_DIRECTION;
  const lonRad = THREE.MathUtils.degToRad(adjustedLon);

  const cosLat = Math.cos(latRad);

  const x = radius * cosLat * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * cosLat * Math.sin(lonRad);

  return new THREE.Vector3(x, y, z);
}

function createSimpleTextLabel(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallbackMaterial = new THREE.SpriteMaterial({ color });
    return new THREE.Sprite(fallbackMaterial);
  }

  const textColor = `#${color.toString(16).padStart(6, '0')}`;
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.lineWidth = 10;
  ctx.strokeText(text, 256, 64);
  ctx.fillStyle = textColor;
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    fog: false
  });

  return new THREE.Sprite(material);
}

// Sprites auto-face camera, so no per-frame rotation is needed.
export function updateRegionLabels(regionsGroup, camera) {
  void regionsGroup;
  void camera;
}

// Get region info when clicking/raycasting
export function getRegionAtRay(raycaster, regionsGroup) {
  if (!regionsGroup) return null;

  const intersects = raycaster.intersectObject(regionsGroup, true);
  
  if (intersects.length > 0) {
    // Find first intersection that's a marker (has userData)
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.userData?.name) {
        return intersects[i].object.userData;
      }
    }
  }

  return null;
}
