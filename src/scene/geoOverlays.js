import * as THREE from 'three';

const MAP_LONGITUDE_DIRECTION = -1;
const DEFAULT_LATLON_SAMPLES = 64;

export async function createGeoOverlayGroup({
  earthRadius,
  countriesUrl,
  graticulesUrl
}) {
  const overlayGroup = new THREE.Group();
  overlayGroup.name = 'geo-overlays';
  overlayGroup.visible = false;

  const [countries, graticules] = await Promise.all([
    fetchGeoJson(countriesUrl),
    fetchGeoJson(graticulesUrl)
  ]);

  const borderLines = buildCountryBorders(countries, earthRadius * 1.0022);
  const graticuleLines = buildGraticules(graticules, earthRadius * 1.0032);

  overlayGroup.add(graticuleLines);
  overlayGroup.add(borderLines);

  return overlayGroup;
}

async function fetchGeoJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load GeoJSON: ${response.status}`);
  }

  return response.json();
}

function buildCountryBorders(featureCollection, radius) {
  const group = new THREE.Group();
  group.name = 'country-borders';
  const borderMaterial = createBorderMaterial();

  for (const feature of featureCollection?.features || []) {
    const geometry = feature?.geometry;
    if (!geometry) continue;

    if (geometry.type === 'Polygon') {
      addPolygonRings(group, geometry.coordinates, radius, borderMaterial);
      continue;
    }

    if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        addPolygonRings(group, polygon, radius, borderMaterial);
      }
    }
  }

  return group;
}

function buildGraticules(featureCollection, radius) {
  const group = new THREE.Group();
  group.name = 'graticules';

  for (const feature of featureCollection?.features || []) {
    const geometry = feature?.geometry;
    if (!geometry) continue;
    const material = createGraticuleMaterial(feature?.properties);

    if (geometry.type === 'LineString') {
      addLineString(group, geometry.coordinates, radius, material);
      continue;
    }

    if (geometry.type === 'MultiLineString') {
      for (const line of geometry.coordinates) {
        addLineString(group, line, radius, material);
      }
    }
  }

  return group;
}

function addPolygonRings(group, polygonCoords, radius, material) {
  for (const ring of polygonCoords || []) {
    addLineString(group, ring, radius, material, true);
  }
}

function addLineString(group, coordinates, radius, material, closed = false) {
  const points = [];
  const safeCoords = coordinates || [];

  for (let i = 0; i < safeCoords.length - 1; i += 1) {
    const start = safeCoords[i];
    const end = safeCoords[i + 1];
    appendArcPoints(points, start, end, radius);
  }

  if (closed && safeCoords.length > 2) {
    appendArcPoints(points, safeCoords[safeCoords.length - 1], safeCoords[0], radius);
  }

  if (points.length < 2) return;

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 11;
  group.add(line);
}

function appendArcPoints(points, start, end, radius) {
  if (!start || !end) return;

  const lonDelta = shortestLonDelta(start[0], end[0]);
  const latDelta = end[1] - start[1];
  const segmentCount = Math.max(
    1,
    Math.ceil(
      Math.max(Math.abs(lonDelta), Math.abs(latDelta)) / (180 / DEFAULT_LATLON_SAMPLES)
    )
  );

  for (let step = 0; step <= segmentCount; step += 1) {
    if (points.length > 0 && step === 0) continue;

    const t = step / segmentCount;
    const lon = normalizeLongitude(start[0] + lonDelta * t);
    const lat = THREE.MathUtils.lerp(start[1], end[1], t);
    points.push(latLonToCartesian(lat, lon, radius));
  }
}

function latLonToCartesian(lat, lon, radius) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon * MAP_LONGITUDE_DIRECTION);
  const cosLat = Math.cos(latRad);

  return new THREE.Vector3(
    radius * cosLat * Math.cos(lonRad),
    radius * Math.sin(latRad),
    radius * cosLat * Math.sin(lonRad)
  );
}

function shortestLonDelta(fromLon, toLon) {
  let delta = toLon - fromLon;

  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;

  return delta;
}

function normalizeLongitude(lon) {
  let normalized = lon;

  while (normalized <= -180) normalized += 360;
  while (normalized > 180) normalized -= 360;

  return normalized;
}

function createBorderMaterial() {
  return new THREE.LineBasicMaterial({
    color: 0xf3ead6,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    depthTest: true
  });
}

function createGraticuleMaterial(properties = {}) {
  const degreeValue = Math.abs(Number(properties.dd ?? properties.degrees ?? 0));
  const isEquator = degreeValue === 0 && (properties.direction === 'N' || properties.direction === 'S');
  const isPrimeMeridian = degreeValue === 0 && (properties.direction === 'E' || properties.direction === 'W');
  const isMajor = degreeValue !== 0 && degreeValue % 30 === 0;

  let color = 0xb8d9ef;
  let opacity = 0.15;

  if (isMajor) {
    color = 0xe3f3ff;
    opacity = 0.24;
  }

  if (isEquator) {
    color = 0xffb3b3;
    opacity = 0.38;
  }

  if (isPrimeMeridian) {
    color = 0xa9e4ff;
    opacity = 0.34;
  }

  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: true
  });
}
