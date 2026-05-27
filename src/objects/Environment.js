import * as THREE from 'three';
import { skyVertexShader, skyFragmentShader } from '../shaders/skyShader.js';

/**
 * Bầu trời tinh vân — SphereGeometry cực lớn, nhìn BackSide,
 * render bằng custom GLSL shader (fbm noise procedural).
 *
 * Uniform uTime được cập nhật mỗi frame từ main.js.
 */
export function createSkySphere() {
  const geo = new THREE.SphereGeometry(1500, 64, 32);
  const mat = new THREE.ShaderMaterial({
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = '__skySphere';
  return mesh;
}

/**
 * Bụi sao (Starfield) — 15 000 điểm phân bố trong hình cầu.
 *
 * Toán: tọa độ cầu (r, θ, φ) → Descartes (x, y, z)
 *   x = r·sinθ·cosφ,  y = r·sinθ·sinφ,  z = r·cosθ
 * r^(1/3) để phân bố đều theo thể tích (volume-uniform sampling).
 */
export function createStarfield() {
  const COUNT = 15000;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const r = 200 + Math.pow(Math.random(), 1 / 3) * 1300;
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;

    positions[i3] = r * Math.sin(theta) * Math.cos(phi);
    positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i3 + 2] = r * Math.cos(theta);

    const temp = 0.7 + Math.random() * 0.3;
    colors[i3] = temp;
    colors[i3 + 1] = temp;
    colors[i3 + 2] = temp + Math.random() * 0.15;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.name = '__starfield';
  return points;
}
