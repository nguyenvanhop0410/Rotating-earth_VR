import * as THREE from 'three';

export const sunPosition = new THREE.Vector3(30, 0.5, -6);

export const SETTINGS = {
  earthRadius: 1.3,
  axialTiltDeg: 23.4,
  earthSpin: 0.0012,
  cloudsSpin: 0.0015,
  enableStars: true,
  showAxis: false,
  // Render style
  style: 'realistic', // 'stylized' | 'realistic' | 'procedural' | 'flat'
  flatColor: 0xb8bcc2,
  // Extra layers
  showClouds: true,
  showAtmosphere: false,
  // Put textures in ./assets/ and keep these names, or set enableRealTextures=false
  enableRealTextures: true,
  textures: {
    day: './assets/daymap_16k.jpg',
    normal: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    roughness: './assets/8081_earthspec10k.jpg',
    specular: './assets/8081_earthspec10k.jpg',
    bump: './assets/elev_bump_16k.jpg',
    seaIce: './assets/sea_ice_16k.png',
    night: './assets/nightmap_16k.jpg',
    clouds: './assets/clouds_8k.jpg'
  }
};
