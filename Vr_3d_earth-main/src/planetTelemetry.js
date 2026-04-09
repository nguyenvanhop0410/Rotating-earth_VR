const TELEMETRY_BY_BODY = {
  'Trái Đất': {
    radius: '6,371 km',
    mass: '5.97×10²⁴ kg',
    tilt: '23.4°',
    spin: '1,670 km/h',
    orbit: '29.8 km/s',
  },
  'Vỏ Trái Đất': {
    radius: 'Độ dày 5–70 km',
    mass: '~0.5% khối lượng Trái Đất',
    tilt: 'Lớp ngoài cùng',
    spin: 'Đồng bộ theo tự quay hành tinh',
    orbit: 'Kiến tạo mảng + hoạt động địa chấn',
  },
  'Lớp Manti': {
    radius: 'Độ dày ~2,900 km',
    mass: '~67% khối lượng Trái Đất',
    tilt: 'Bên dưới vỏ',
    spin: 'Dòng đối lưu rất chậm',
    orbit: 'Động lực cho kiến tạo mảng',
  },
  'Nhân Ngoài': {
    radius: 'Độ dày ~2,260 km',
    mass: '~30% khối lượng Trái Đất',
    tilt: 'Lõi kim loại lỏng',
    spin: 'Đối lưu Fe-Ni dẫn điện',
    orbit: 'Nguồn gốc từ trường Trái Đất',
  },
  'Nhân Trong': {
    radius: 'Bán kính ~1,220 km',
    mass: '~1.7% khối lượng Trái Đất',
    tilt: 'Lõi kim loại rắn',
    spin: 'Có thể quay lệch nhẹ so với vỏ',
    orbit: 'Nhiệt độ ước tính 5,200–6,000°C',
  },
  'Sao Thủy': {
    radius: '2,440 km',
    mass: '3.30×10²³ kg',
    tilt: '0.03°',
    spin: '10.9 km/h',
    orbit: '47.4 km/s',
  },
  'Sao Kim': {
    radius: '6,052 km',
    mass: '4.87×10²⁴ kg',
    tilt: '177.4°',
    spin: '6.5 km/h (nghịch)',
    orbit: '35.0 km/s',
  },
  'Sao Hỏa': {
    radius: '3,390 km',
    mass: '6.42×10²³ kg',
    tilt: '25.2°',
    spin: '868 km/h',
    orbit: '24.1 km/s',
  },
  'Sao Mộc': {
    radius: '69,911 km',
    mass: '1.90×10²⁷ kg',
    tilt: '3.1°',
    spin: '45,300 km/h',
    orbit: '13.1 km/s',
  },
  'Sao Thổ': {
    radius: '58,232 km',
    mass: '5.68×10²⁶ kg',
    tilt: '26.7°',
    spin: '35,500 km/h',
    orbit: '9.7 km/s',
  },
  'Sao Thiên Vương': {
    radius: '25,362 km',
    mass: '8.68×10²⁵ kg',
    tilt: '97.8°',
    spin: '9,320 km/h (nghịch)',
    orbit: '6.8 km/s',
  },
  'Sao Hải Vương': {
    radius: '24,622 km',
    mass: '1.02×10²⁶ kg',
    tilt: '28.3°',
    spin: '9,660 km/h',
    orbit: '5.4 km/s',
  },
  'Mặt Trăng': {
    radius: '1,737 km',
    mass: '7.35×10²² kg',
    tilt: '6.7°',
    spin: '16.7 km/h',
    orbit: '1.02 km/s (quanh Trái Đất)',
  },
  'Mặt Trời': {
    radius: '695,700 km',
    mass: '1.99×10³⁰ kg',
    tilt: '7.25°',
    spin: '7,280 km/h',
    orbit: '220 km/s (quanh tâm Ngân Hà)',
  },
};

export function createTelemetryUpdater(doc = document) {
  let currentBody = '';

  const kRadius = doc.getElementById('k-radius');
  const kMass = doc.getElementById('k-mass');
  const kTilt = doc.getElementById('k-tilt');
  const kSpin = doc.getElementById('k-spin');
  const kOrbit = doc.getElementById('k-orbit');

  const vRadius = doc.getElementById('v-radius');
  const vMass = doc.getElementById('v-mass');
  const vTilt = doc.getElementById('v-tilt');
  const vSpin = doc.getElementById('v-spin');
  const vOrbit = doc.getElementById('v-orbit');

  return {
    update(bodyName) {
      if (currentBody === bodyName) return;
      currentBody = bodyName;

      const data = TELEMETRY_BY_BODY[bodyName] || TELEMETRY_BY_BODY['Trái Đất'];
      const title = bodyName === 'Trái Đất' ? 'Trái Đất' : bodyName;

      if (kRadius) kRadius.textContent = `Bán kính ${title}`;
      if (kMass) kMass.textContent = `Khối lượng ${title}`;
      if (kTilt) kTilt.textContent = 'Nghiêng trục';
      if (kSpin) kSpin.textContent = 'Vận tốc tự quay';
      if (kOrbit) kOrbit.textContent = 'Vận tốc quỹ đạo';

      if (vRadius) vRadius.textContent = data.radius;
      if (vMass) vMass.textContent = data.mass;
      if (vTilt) vTilt.textContent = data.tilt;
      if (vSpin) vSpin.textContent = data.spin;
      if (vOrbit) vOrbit.textContent = data.orbit;
    },
  };
}
