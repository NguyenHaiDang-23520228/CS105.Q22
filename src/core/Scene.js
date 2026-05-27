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

  // AmbientLight cực tối — vùng khuất tối như vũ trụ thực
  const ambientLight = new THREE.AmbientLight(0x080812, 0.4);
  ambientLight.name = 'AmbientLight';
  scene.add(ambientLight);

  // DirectionalLight phụ — chiếu sáng bổ sung từ phía xa
  const directionalLight = new THREE.DirectionalLight(0xfff5e6, 0.6);
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
  directionalLight.shadow.bias = -0.0005;
  scene.add(directionalLight);

  // ── Hệ Mặt Trời ──
  const solarSystem = createSolarSystem();
  scene.add(solarSystem.group);

  return {
    scene,
    skySphere,
    lights: { ambientLight, directionalLight },
    solarSystem,
  };
}
