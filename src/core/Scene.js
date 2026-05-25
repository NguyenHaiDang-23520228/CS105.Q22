import * as THREE from 'three';
import { createSpaceStation } from '../objects/SpaceStation.js';
import { createSolarSystem } from '../objects/SolarSystem.js';

/**
 * Tạo Scene chính:
 *   - Hệ Mặt Trời (Scene Graph) tại gốc tọa độ
 *   - Trạm Vũ Trụ dời ra z = -200
 *   - Lưới tham chiếu, sàn nhận bóng, hệ thống ánh sáng
 *
 * Trả về object chứa scene + tham chiếu đến các đèn và SolarSystem
 * để module khác điều khiển (toggle, teleport, animate).
 */
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);
  scene.fog = new THREE.Fog(0x050510, 150, 600);

  // GridHelper: mặt phẳng lưới khổng lồ để quan sát phép Tịnh tiến
  const grid = new THREE.GridHelper(800, 160, 0x00aaff, 0x112233);
  grid.position.y = -2;
  scene.add(grid);

  // Sàn nhận bóng đổ
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshStandardMaterial({ color: 0x0a1525, roughness: 0.9, metalness: 0.1 })
  );
  floor.rotation.x = -Math.PI / 2; // Xoay 90° quanh trục X
  floor.position.y = -2.01;
  floor.receiveShadow = true;
  scene.add(floor);

  // ===== Ánh sáng =====

  // AmbientLight: ánh sáng nền đồng nhất, intensity thấp
  const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
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

  // DirectionalLight: mô phỏng ánh sáng mặt trời từ xa
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

  // ===== Trạm Vũ Trụ — dời ra z = -200 =====
  const spaceStation = createSpaceStation();
  scene.add(spaceStation);

  // Đặt tên cho mesh trong station để Raycaster pick được
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
