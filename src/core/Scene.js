import * as THREE from 'three';
import { createSolarSystem } from '../objects/SolarSystem.js';
import { createStarfield, createSkySphere } from '../objects/Environment.js';

/**
 * Tạo Scene:
 *   - Sky Sphere (GLSL nebula shader)
 *   - Starfield (15 000 points)
 *   - Hệ Mặt Trời (sun shader + planets + moon + asteroids)
 *   - Ánh sáng (Ambient cực tối + Directional phụ)
 */
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000005);

  // ── Bối cảnh vũ trụ ──
  const skySphere = createSkySphere();
  scene.add(skySphere);
  scene.add(createStarfield());

  // ── Ánh sáng ──

  // Ambient — giảm khi bật shadow để bóng đổ tương phản hơn
  const ambientLight = new THREE.AmbientLight(0x334466, 0.35);
  ambientLight.name = 'AmbientLight';
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
  directionalLight.name = 'DirectionalLight';
  directionalLight.position.set(50, 40, 30);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 300;
  directionalLight.shadow.camera.left = -80;
  directionalLight.shadow.camera.right = 80;
  directionalLight.shadow.camera.top = 80;
  directionalLight.shadow.camera.bottom = -80;
  directionalLight.shadow.bias = -0.001;      // khử shadow acne (vân kẻ sọc)
  directionalLight.shadow.normalBias = 0.05;  // đẩy theo normal cho cạnh mượt
  scene.add(directionalLight);

  // ── Mặt phẳng hứng bóng (ecliptic) — giúp thấy shadow map khi bấm S ──
  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(130, 96),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a18,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.45,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.5;
  shadowPlane.receiveShadow = true;
  shadowPlane.name = '__shadowPlane';
  scene.add(shadowPlane);

  // ── Hệ Mặt Trời ──
  const solarSystem = createSolarSystem();
  scene.add(solarSystem.group);

  return {
    scene,
    skySphere,
    shadowPlane,
    lights: { ambientLight, directionalLight },
    solarSystem,
  };
}
