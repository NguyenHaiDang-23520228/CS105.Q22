import * as THREE from 'three';

// ===== PROCEDURAL CANVAS TEXTURES (UV Mapping) =====

/**
 * Tạo texture procedural bằng Canvas2D — chứng minh kỹ thuật UV Mapping.
 * Mỗi hành tinh có pattern riêng, sẽ được ánh xạ lên SphereGeometry
 * thông qua tọa độ UV mặc định (u = kinh độ, v = vĩ độ).
 */
function makeCanvasTexture(drawFn, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texSun(ctx, s) {
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, '#ffffaa');
  g.addColorStop(0.5, '#ffaa00');
  g.addColorStop(1, '#cc4400');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function texMercury(ctx, s) {
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#666666';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * s, y = Math.random() * s, r = 2 + Math.random() * 8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function texVenus(ctx, s) {
  ctx.fillStyle = '#e8c080';
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = '#d4a050';
  ctx.lineWidth = 3;
  for (let y = 10; y < s; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < s; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.08) * 6);
    ctx.stroke();
  }
}

function texEarth(ctx, s) {
  ctx.fillStyle = '#1155cc';
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#33aa55';
  ctx.beginPath();
  ctx.ellipse(s * 0.3, s * 0.35, s * 0.18, s * 0.12, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(s * 0.7, s * 0.5, s * 0.15, s * 0.1, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 0.15, s * 0.2, s * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
}

function texMoon(ctx, s) {
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#999999';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * s, y = Math.random() * s, r = 2 + Math.random() * 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function texMars(ctx, s) {
  ctx.fillStyle = '#cc5533';
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#992211';
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * s, y = Math.random() * s, r = 3 + Math.random() * 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Chấm đỏ lớn giống Great Red Spot trên Sao Hỏa
  ctx.fillStyle = '#ff3300';
  ctx.beginPath();
  ctx.ellipse(s * 0.6, s * 0.55, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

function texJupiter(ctx, s) {
  // Dải ngang đặc trưng + hình lục giác (hexagon pattern)
  const colors = ['#d4a56a', '#c8965a', '#b88550', '#d4a56a', '#a07040'];
  const bandH = s / colors.length;
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * bandH, s, bandH);
  });
  // Vẽ hexagon pattern nhỏ chứng minh UV mapping
  ctx.strokeStyle = '#88550033';
  ctx.lineWidth = 1;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cx = col * 32 + (row % 2) * 16;
      const cy = row * 32;
      drawHexagon(ctx, cx, cy, 14);
    }
  }
}

function drawHexagon(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function texSaturn(ctx, s) {
  ctx.fillStyle = '#e8cc77';
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = '#ccaa44';
  ctx.lineWidth = 2;
  for (let y = 8; y < s; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(s, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }
}

function texUranus(ctx, s) {
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#aaddee');
  g.addColorStop(1, '#66aacc');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function texNeptune(ctx, s) {
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#3355cc');
  g.addColorStop(0.5, '#4477dd');
  g.addColorStop(1, '#2244aa');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#5599ff44';
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 0.4, 20, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ===== DỮ LIỆU HÀNH TINH =====

const PLANET_DATA = [
  { name: 'Mercury', radius: 0.6, distance: 12, speed: 1.6, texFn: texMercury },
  { name: 'Venus', radius: 0.9, distance: 18, speed: 1.2, texFn: texVenus },
  { name: 'Earth', radius: 1.0, distance: 25, speed: 1.0, texFn: texEarth },
  { name: 'Mars', radius: 0.7, distance: 32, speed: 0.8, texFn: texMars },
  { name: 'Jupiter', radius: 2.5, distance: 45, speed: 0.4, texFn: texJupiter },
  { name: 'Saturn', radius: 2.0, distance: 58, speed: 0.32, texFn: texSaturn },
  { name: 'Uranus', radius: 1.5, distance: 70, speed: 0.22, texFn: texUranus },
  { name: 'Neptune', radius: 1.4, distance: 82, speed: 0.18, texFn: texNeptune },
  { name: 'Pluto', radius: 0.35, distance: 92, speed: 0.12, texFn: texMercury },
];

/**
 * Tạo Hệ Mặt Trời hoàn chỉnh theo mô hình Scene Graph:
 *   SolarSystem (Group)
 *     └─ Sun (Mesh)
 *     └─ orbitGroup_i (Group) — xoay group = hành tinh quay quanh Mặt Trời
 *         └─ planet (Mesh) — đặt tại (distance, 0, 0) trong tọa độ cục bộ
 *         └─ [earthOrbit] moonOrbitGroup → Moon
 *
 * Phép biến đổi Affine cốt lõi:
 *   - Rotation trên orbitGroup quanh trục Y → tạo quỹ đạo tròn (Translation theo đường tròn)
 *   - Scale riêng từng hành tinh theo radius
 *   - Tự quay (self-rotation) quanh trục Y của mỗi mesh
 *
 * Trả về { group, planets[], orbitGroups[], update(delta) }
 */
export function createSolarSystem() {
  const group = new THREE.Group();

  // --- Mặt Trời ---
  const sunGeo = new THREE.SphereGeometry(5, 48, 32);
  const sunMat = new THREE.MeshBasicMaterial({ map: makeCanvasTexture(texSun, 512) });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.name = 'Sun';
  group.add(sun);

  // PointLight tại tâm Mặt Trời — chiếu sáng hành tinh xung quanh
  const sunLight = new THREE.PointLight(0xfff5dd, 300, 300);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  group.add(sunLight);

  const planets = [];
  const orbitGroups = [];

  PLANET_DATA.forEach((data, index) => {
    // Nhóm quỹ đạo — xoay group này quanh Y = hành tinh bay quanh Mặt Trời
    const orbitGroup = new THREE.Group();
    orbitGroup.name = `orbit_${data.name}`;

    const planetGeo = new THREE.SphereGeometry(data.radius, 32, 24);
    const planetMat = new THREE.MeshStandardMaterial({
      map: makeCanvasTexture(data.texFn),
      roughness: 0.7,
      metalness: 0.1,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.name = data.name;

    // Tịnh tiến hành tinh ra xa tâm theo trục X (trong tọa độ cục bộ của orbitGroup)
    planetMesh.position.set(data.distance, 0, 0);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;

    orbitGroup.add(planetMesh);

    // Vẽ đường tròn quỹ đạo để dễ nhìn
    const orbitCurve = new THREE.BufferGeometry().setFromPoints(
      new THREE.Path().absarc(0, 0, data.distance, 0, Math.PI * 2, false).getPoints(128)
    );
    const orbitLine = new THREE.Line(
      orbitCurve,
      new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.3 })
    );
    orbitLine.rotation.x = -Math.PI / 2; // Đặt nằm trên mặt phẳng XZ
    group.add(orbitLine);

    // --- Scene Graph con: Mặt Trăng quay quanh Trái Đất ---
    if (data.name === 'Earth') {
      const moonOrbitGroup = new THREE.Group();
      moonOrbitGroup.name = 'orbit_Moon';

      const moonGeo = new THREE.SphereGeometry(0.3, 24, 16);
      const moonMat = new THREE.MeshStandardMaterial({
        map: makeCanvasTexture(texMoon),
        roughness: 0.8,
      });
      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.name = 'Moon';
      moonMesh.position.set(2.5, 0, 0);
      moonMesh.castShadow = true;
      moonMesh.receiveShadow = true;
      moonOrbitGroup.add(moonMesh);

      // Gắn moonOrbitGroup vào planetMesh → Scene Graph: Sun > orbitEarth > Earth > moonOrbit > Moon
      planetMesh.add(moonOrbitGroup);

      planets.push({ mesh: moonMesh, data: { speed: 3.0 }, orbitGroup: moonOrbitGroup });
    }

    // Vành đai Saturn
    if (data.name === 'Saturn') {
      const ringGeo = new THREE.RingGeometry(2.6, 3.8, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xddcc88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2.5; // Nghiêng vành đai
      planetMesh.add(ring);
    }

    group.add(orbitGroup);
    planets.push({ mesh: planetMesh, data, orbitGroup, index });
    orbitGroups.push(orbitGroup);
  });

  /**
   * Cập nhật mỗi frame:
   * - Xoay orbitGroup quanh Y → hành tinh chạy trên quỹ đạo
   * - Tự quay hành tinh quanh trục Y (self-rotation)
   */
  function update(elapsed) {
    orbitGroups.forEach((og, i) => {
      const spd = PLANET_DATA[i].speed;
      og.rotation.y = elapsed * spd * 0.15;
    });

    planets.forEach((p) => {
      p.mesh.rotation.y = elapsed * 0.5;
      if (p.orbitGroup && p.data.name === undefined && p.orbitGroup.name === 'orbit_Moon') {
        p.orbitGroup.rotation.y = elapsed * p.data.speed * 0.4;
      }
    });

    // Mặt Trăng — tìm riêng để quay
    const moonEntry = planets.find((p) => p.mesh.name === 'Moon');
    if (moonEntry) {
      moonEntry.orbitGroup.rotation.y = elapsed * 1.2;
    }
  }

  /**
   * Lấy vị trí thế giới thực tế của hành tinh thứ i (dùng cho Teleport).
   */
  function getPlanetWorldPos(index) {
    const p = planets.find((pl) => pl.index === index);
    if (!p) return new THREE.Vector3();
    const pos = new THREE.Vector3();
    p.mesh.getWorldPosition(pos);
    return pos;
  }

  return { group, planets, orbitGroups, sun, update, getPlanetWorldPos, PLANET_DATA };
}
