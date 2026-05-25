import * as THREE from 'three';
import { createSpaceStation } from '../objects/SpaceStation.js';
import { createSolarSystem } from '../objects/SolarSystem.js';
import { createStarfield, createSkySphere } from '../objects/Environment.js';

/**
 * Tạo Scene chính:
 *   - Bối cảnh vũ trụ (Starfield + Sky Sphere)
 *   - Hệ Mặt Trời (Scene Graph) tại gốc tọa độ
 *   - Trạm Vũ Trụ tại z = -200
 *   - Hệ thống ánh sáng (Ambient cực tối → không gian chân thực)
 */
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000005);

  // ===== Bối cảnh vũ trụ =====

  // Hình cầu nền ngân hà — nhìn vào BackSide tạo bầu trời bao quanh
  const skySphere = createSkySphere();
  scene.add(skySphere);

  // Bụi ngôi sao — 15 000 điểm phân bố trong hình cầu khổng lồ
  const starfield = createStarfield();
  scene.add(starfield);

  // ===== Ánh sáng =====

  // AmbientLight cực tối — vùng khuất không bị sáng bệt như ngoài vũ trụ thực
  const ambientLight = new THREE.AmbientLight(0x080812, 0.35);
  ambientLight.name = 'AmbientLight';
  scene.add(ambientLight);

  // PointLight gần Trạm Vũ Trụ (z = -200)
  const pointLight = new THREE.PointLight(0xffffff, 80, 300);
  pointLight.name = 'PointLight';
  pointLight.position.set(0, 15, -200);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.set(1024, 1024);
  pointLight.shadow.camera.near = 0.5;
  pointLight.shadow.camera.far = 200;
  scene.add(pointLight);

  // DirectionalLight — mô phỏng ánh sáng mặt trời từ xa
  const directionalLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
  directionalLight.name = 'DirectionalLight';
  directionalLight.position.set(30, 50, -180);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 300;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  directionalLight.shadow.bias = -0.0005;
  scene.add(directionalLight);

  // ===== Hệ Mặt Trời =====
  const solarSystem = createSolarSystem();
  scene.add(solarSystem.group);

  // ===== Trạm Vũ Trụ =====
  const spaceStation = createSpaceStation();
  scene.add(spaceStation);

  spaceStation.traverse((child) => {
    if (child.isMesh && !child.name) {
      child.name = 'StationPart';
    }
  });

  return {
    scene,
    lights: { ambientLight, pointLight, directionalLight },
    solarSystem,
    spaceStation,
  };
}
