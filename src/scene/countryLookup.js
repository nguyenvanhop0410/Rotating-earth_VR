function getCountryNameFromFeature(feature) {
  const props = feature?.properties || {};
  return props.name || props.ADMIN || props.admin || props.NAME || props.sovereignt || props.SOVEREIGNT || 'Unknown';
}

function ringContainsLonLat(lon, lat, ring) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersects = ((yi > lat) !== (yj > lat))
      && (lon < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-12) + xi);

    if (intersects) inside = !inside;
  }

  return inside;
}

function polygonContainsLonLat(lon, lat, polygonCoords) {
  if (!polygonCoords?.length) return false;
  if (!ringContainsLonLat(lon, lat, polygonCoords[0])) return false;

  for (let i = 1; i < polygonCoords.length; i += 1) {
    if (ringContainsLonLat(lon, lat, polygonCoords[i])) return false;
  }

  return true;
}

function featureContainsLonLat(lon, lat, feature) {
  const geometry = feature?.geometry;
  if (!geometry) return false;
  if (lat < feature.minLat || lat > feature.maxLat) return false;

  if (!feature.crossesDateline) {
    if (lon < feature.minLon || lon > feature.maxLon) return false;
  } else if (!(lon >= feature.maxLon || lon <= feature.minLon)) {
    return false;
  }

  if (geometry.type === 'Polygon') {
    return polygonContainsLonLat(lon, lat, geometry.coordinates);
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) => polygonContainsLonLat(lon, lat, polygon));
  }

  return false;
}

let countryFeatures = [];

export async function loadCountryFeatures(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load country data: ${response.status}`);
  }

  const featureCollection = await response.json();
  const nextFeatures = [];

  for (const feature of featureCollection.features || []) {
    const geometry = feature?.geometry;
    if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
      continue;
    }

    const rings = geometry.type === 'Polygon'
      ? geometry.coordinates
      : geometry.coordinates.flat();

    let minLat = 90;
    let maxLat = -90;
    let minLon = 180;
    let maxLon = -180;

    for (const ring of rings) {
      for (const point of ring) {
        const lon = point[0];
        const lat = point[1];

        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }

    nextFeatures.push({
      ...feature,
      countryName: getCountryNameFromFeature(feature),
      minLon,
      maxLon,
      minLat,
      maxLat,
      crossesDateline: (maxLon - minLon) > 180
    });
  }

  countryFeatures = nextFeatures;
  return countryFeatures.length;
}

export function findCountryNameAtLonLat(lon, lat) {
  for (const feature of countryFeatures) {
    if (featureContainsLonLat(lon, lat, feature)) {
      return feature.countryName;
    }
  }

  return null;
}
