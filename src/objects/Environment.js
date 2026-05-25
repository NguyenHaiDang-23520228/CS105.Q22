import * as THREE from 'three';

/**
 * Bụi ngôi sao (Starfield) — 15 000 điểm sáng phân bố đều
 * trong hình cầu bán kính ~1500.
 *
 * Toán: mỗi điểm dùng tọa độ cầu (r, θ, φ) rồi chuyển sang Descartes:
 *   x = r·sin(θ)·cos(φ)
 *   y = r·sin(θ)·sin(φ)
 *   z = r·cos(θ)
 * với r random trong [200, 1500] để sao không tụ hết ở 1 lớp vỏ.
 */
export function createStarfield() {
  const COUNT = 15000;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;

    // Phân bố đều trong khối cầu: r^(1/3) giúp mật độ đồng nhất theo thể tích
    const r = 200 + Math.pow(Math.random(), 1 / 3) * 1300;
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;

    positions[i3] = r * Math.sin(theta) * Math.cos(phi);
    positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i3 + 2] = r * Math.cos(theta);

    // Màu hơi ngẫu nhiên: trắng xanh nhạt → trắng ấm (mô phỏng quang phổ sao)
    const temp = 0.7 + Math.random() * 0.3;
    colors[i3] = temp;
    colors[i3 + 1] = temp;
    colors[i3 + 2] = temp + Math.random() * 0.15;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const stars = new THREE.Points(geometry, material);
  stars.name = '__starfield';
  return stars;
}

/**
 * Hình cầu bầu trời (Sky Sphere) — bán kính 1500, nhìn BackSide.
 * Dùng gradient Canvas tạo nền tinh vân xanh-tím tối sẫm.
 * (Sau này thay bằng ảnh HDRI/Nebula thật qua TextureLoader.)
 */
export function createSkySphere() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Gradient dọc: đen → xanh đen → tím đen → đen
  const gVert = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gVert.addColorStop(0, '#000008');
  gVert.addColorStop(0.25, '#0a0520');
  gVert.addColorStop(0.5, '#0d0a30');
  gVert.addColorStop(0.75, '#08051a');
  gVert.addColorStop(1, '#000005');
  ctx.fillStyle = gVert;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vùng sáng mờ mô phỏng dải ngân hà ngang giữa
  ctx.globalAlpha = 0.12;
  const gBand = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height * 0.65);
  gBand.addColorStop(0, 'transparent');
  gBand.addColorStop(0.3, '#221155');
  gBand.addColorStop(0.5, '#332266');
  gBand.addColorStop(0.7, '#221155');
  gBand.addColorStop(1, 'transparent');
  ctx.fillStyle = gBand;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;

  // Rắc sao nhỏ trực tiếp lên canvas skybox cho thêm chiều sâu
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 1.2;
    ctx.globalAlpha = 0.3 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Vùng tinh vân phát sáng nhẹ (radial gradient)
  drawNebulaPatch(ctx, canvas.width * 0.2, canvas.height * 0.45, 180, '#1a0044', 0.08);
  drawNebulaPatch(ctx, canvas.width * 0.75, canvas.height * 0.5, 220, '#001133', 0.06);
  drawNebulaPatch(ctx, canvas.width * 0.5, canvas.height * 0.4, 300, '#110022', 0.05);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geo = new THREE.SphereGeometry(1500, 64, 32);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const sphere = new THREE.Mesh(geo, mat);
  sphere.name = '__skySphere';
  return sphere;
}

function drawNebulaPatch(ctx, cx, cy, radius, color, alpha) {
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}
