import * as THREE from 'three';

export function createSun() {
  const group = new THREE.Group();

  // Single, smooth, vivid disc + halo (no stacked rings)
  const tex = createSunDiscTexture({ size: 512 });
  tex.colorSpace = THREE.SRGBColorSpace;

  const spriteMat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(16, 16, 1);
  group.add(sprite);

  return group;
}

function createSunDiscTexture({ size }) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;

  // Deep orange outer, hot yellow core, with a very bright center.
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  g.addColorStop(0.0, 'rgba(255, 255, 255, 1.00)');
  g.addColorStop(0.1, 'rgba(255, 245, 190, 1.00)');
  g.addColorStop(0.25, 'rgba(255, 205, 90, 0.96)');
  g.addColorStop(0.45, 'rgba(255, 160, 45, 0.72)');
  g.addColorStop(0.7, 'rgba(255, 120, 20, 0.38)');
  g.addColorStop(1.0, 'rgba(255, 120, 20, 0.00)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}
