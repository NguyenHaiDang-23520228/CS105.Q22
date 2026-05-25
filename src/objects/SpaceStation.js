import * as THREE from 'three';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';

/**
 * Tạo Trạm Vũ Trụ — Group chứa các khối hình học cơ bản.
 * Đặt tại z = -200 (xa gốc, không lấn vào Mặt Trời).
 */
export function createSpaceStation() {
  const station = new THREE.Group();
  station.name = 'SpaceStation';
  station.position.set(0, 0, -200);

  const materialBox = new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.4, metalness: 0.3 });
  const materialCylinder = new THREE.MeshStandardMaterial({ color: 0xff8844, roughness: 0.5, metalness: 0.2 });
  const materialCone = new THREE.MeshStandardMaterial({ color: 0x44ff88, roughness: 0.5, metalness: 0.2 });
  const materialTorus = new THREE.MeshStandardMaterial({ color: 0xff44aa, roughness: 0.3, metalness: 0.4 });
  const materialTeapot = new THREE.MeshStandardMaterial({ color: 0xffdd44, roughness: 0.35, metalness: 0.5 });

  // Hình hộp (Box) — thân trạm chính
  const box = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), materialBox);
  box.name = 'Box';
  box.position.set(0, 2, 0);
  box.castShadow = true;
  box.receiveShadow = true;
  station.add(box);

  // Hình trụ (Cylinder) — ống nối / anten
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 8, 32), materialCylinder);
  cylinder.name = 'Cylinder';
  cylinder.position.set(5, 4, 0);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  station.add(cylinder);

  // Hình nón (Cone) — đỉnh anten
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 32), materialCone);
  cone.name = 'Cone';
  cone.position.set(5, 9.5, 0);
  cone.castShadow = true;
  cone.receiveShadow = true;
  station.add(cone);

  // Bánh xe (Torus) — cổng không gian
  const torus = new THREE.Mesh(new THREE.TorusGeometry(3, 0.4, 16, 48), materialTorus);
  torus.name = 'Torus';
  torus.position.set(-5, 3, 0);
  torus.rotation.y = Math.PI / 4; // Xoay 45° quanh trục Y
  torus.castShadow = true;
  torus.receiveShadow = true;
  station.add(torus);

  // Ấm trà (Teapot) — hình học kinh điển CG
  const teapot = new THREE.Mesh(new TeapotGeometry(1.2, 10), materialTeapot);
  teapot.name = 'Teapot';
  teapot.position.set(0, 1.2, 4);
  teapot.castShadow = true;
  teapot.receiveShadow = true;
  station.add(teapot);

  // Bệ đỡ dưới trạm
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8, 0.5, 48),
    new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.8, metalness: 0.1 })
  );
  platform.name = 'Platform';
  platform.position.set(0, -0.25, 0);
  platform.receiveShadow = true;
  platform.castShadow = true;
  station.add(platform);

  return station;
}
