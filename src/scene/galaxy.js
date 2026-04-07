import * as THREE from 'three';

export function createGalaxyBackdrop({
  sunPosition,
  seed = 2026,
  textureWidth = 2048,
  textureHeight = 1024,
  widthSegments = 64,
  heightSegments = 48
} = {}) {
  const backdropEuler = new THREE.Euler(0, THREE.MathUtils.degToRad(-22), THREE.MathUtils.degToRad(18));
  const invBackdropQ = new THREE.Quaternion().setFromEuler(backdropEuler).invert();
  const sunDirLocal = sunPosition ? sunPosition.clone().normalize().applyQuaternion(invBackdropQ) : null;

  const tex = createGalaxyTexture({
    width: textureWidth,
    height: textureHeight,
    seed,
    sunDir: sunDirLocal,
    sunHoleDeg: 26
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;

  const geometry = new THREE.SphereGeometry(420, widthSegments, heightSegments);
  const material = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.BackSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  // Slight tilt so the band isn't perfectly horizontal
  mesh.rotation.copy(backdropEuler);
  return mesh;
}

function createGalaxyTexture({ width, height, seed, sunDir, sunHoleDeg = 18 }) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fract = (x) => x - Math.floor(x);
  const smoothstep = (t) => t * t * (3 - 2 * t);

  const sunHoleCos = Math.cos(THREE.MathUtils.degToRad(sunHoleDeg));

  // Deterministic RNG (LCG)
  let state = (seed >>> 0) || 1;
  const rand = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };

  function hash2(x, y) {
    const h = Math.sin(x * 127.1 + y * 311.7 + seed * 0.013) * 43758.5453123;
    return fract(h);
  }

  function valueNoise(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = x0 + 1;
    const y1 = y0 + 1;
    const sx = smoothstep(fract(x));
    const sy = smoothstep(fract(y));
    const n00 = hash2(x0, y0);
    const n10 = hash2(x1, y0);
    const n01 = hash2(x0, y1);
    const n11 = hash2(x1, y1);
    const ix0 = lerp(n00, n10, sx);
    const ix1 = lerp(n01, n11, sx);
    return lerp(ix0, ix1, sy);
  }

  function fbm(x, y) {
    let value = 0;
    let amplitude = 0.55;
    let frequency = 1;
    for (let i = 0; i < 5; i++) {
      value += amplitude * valueNoise(x * frequency, y * frequency);
      frequency *= 2;
      amplitude *= 0.5;
    }
    return value;
  }

  // Milky Way band parameters (diagonal across the sky)
  const bandAngle = -0.34; // radians
  const ca = Math.cos(bandAngle);
  const sa = Math.sin(bandAngle);
  const bandWidth = 0.12;
  const bandCenterV = 0.33;

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);

      // Base space color: deep navy with slight vertical gradient
      const base = 0.010 + 0.012 * (1 - v);
      let r = base * 0.65;
      let g = base * 0.85;
      let b = base * 1.35;

      // Band coordinate in [-0.5, 0.5]
      const px = u - 0.5;
      const py = v - bandCenterV;
      const bandCoord = px * ca + py * sa;
      const bandDist = Math.abs(bandCoord);

      // Carve a "no band / no stars" area around the Sun direction.
      // IMPORTANT: Must match THREE.SphereGeometry UV mapping.
      // SphereGeometry: phi = u * 2PI, theta = v * PI
      // x = -cos(phi)*sin(theta), y = cos(theta), z = sin(phi)*sin(theta)
      const phi = u * Math.PI * 2;
      const theta = v * Math.PI;
      const sinTheta = Math.sin(theta);
      const dx = -Math.cos(phi) * sinTheta;
      const dy = Math.cos(theta);
      const dz = Math.sin(phi) * sinTheta;
      const dotSun = sunDir ? (dx * sunDir.x + dy * sunDir.y + dz * sunDir.z) : -1;
      let sunHole = 0;
      if (dotSun > sunHoleCos) {
        sunHole = (dotSun - sunHoleCos) / (1 - sunHoleCos);
        sunHole = smoothstep(clamp01(sunHole));
      }

      // Soft gaussian-ish band intensity
      const t = clamp01(1 - bandDist / bandWidth);
      const band = (t * t * (2 - t)) * (1 - sunHole);

      if (band > 0) {
        const n = fbm(u * 6.0, v * 6.0);
        const dust = clamp01((n - 0.35) * 1.25);
        const bright = band * (0.22 + 0.55 * dust);

        // Slightly warmer core inside the band
        r += bright * 0.95;
        g += bright * 0.85;
        b += bright * 0.75;

        // Purple-blue wisps
        const w = clamp01((fbm(u * 10.0 + 11.3, v * 10.0 - 7.1) - 0.45) * 1.8);
        r += w * band * 0.06;
        g += w * band * 0.10;
        b += w * band * 0.18;
      }

      // Sprinkle tiny stars (background texture only)
      const s = rand();
      if (sunHole < 0.02 && s > 0.9982) {
        const mag = (s - 0.9982) / (1 - 0.9982);
        const intensity = 0.35 + 0.65 * mag;
        const tint = rand();
        const sr = intensity * (0.95 + 0.10 * tint);
        const sg = intensity * (0.95 + 0.05 * tint);
        const sb = intensity * (1.00 + 0.20 * tint);
        r += sr;
        g += sg;
        b += sb;
      }

      r = clamp01(r);
      g = clamp01(g);
      b = clamp01(b);

      const i = (y * width + x) * 4;
      data[i + 0] = Math.round(r * 255);
      data[i + 1] = Math.round(g * 255);
      data[i + 2] = Math.round(b * 255);
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}
