import * as THREE from 'three';
import { createScene } from './core/Scene.js';
import { createCamera, setupFirstPersonControls } from './core/Camera.js';
import { createRenderer } from './core/Renderer.js';
import { setupInteraction, setupTextureUpload } from './core/Interaction.js';

/**
 * Entry point — khởi tạo toàn bộ ứng dụng 3D:
 *   Scene (Hệ Mặt Trời + Trạm Vũ Trụ) → Camera FPS → Renderer
 *   → Interaction (Raycaster + Affine) → Light Toggles → Teleport
 */
function init() {
  const { scene, lights, solarSystem } = createScene();
  const camera = createCamera();
  const renderer = createRenderer();
  document.body.appendChild(renderer.domElement);

  // --- FPS Controls ---
  const controls = setupFirstPersonControls(camera, renderer.domElement);

  const clipInfo = document.getElementById('clip-info');
  controls.onClipChange = (near, far) => {
    clipInfo.textContent = `Near: ${near} | Far: ${far}`;
  };

  // --- Teleport Camera đến hành tinh (phím 1-9) ---
  controls.teleportFn = (planetIndex) => {
    const pos = solarSystem.getPlanetWorldPos(planetIndex);
    if (pos.lengthSq() === 0) return;
    // Đặt camera cách hành tinh 1 khoảng để nhìn rõ
    const offset = new THREE.Vector3(0, 3, 8);
    camera.position.copy(pos).add(offset);
  };

  // --- Raycaster + Interaction (chọn vật thể + biến đổi Affine) ---
  const interaction = setupInteraction(camera, scene, renderer, controls);

  // --- Upload Texture runtime ---
  setupTextureUpload(interaction);

  // --- Toggle 3 loại ánh sáng ---
  setupLightToggles(lights);

  // --- Vòng lặp render ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    controls.update(delta);
    solarSystem.update(elapsed);

    renderer.render(scene, camera);
  }

  animate();

  // --- Resize viewport ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/**
 * Gắn sự kiện cho 3 checkbox bật/tắt đèn.
 * Khi tắt đèn, set visible = false → đèn ngừng ảnh hưởng scene.
 */
function setupLightToggles(lights) {
  const map = {
    'toggle-ambient': lights.ambientLight,
    'toggle-point': lights.pointLight,
    'toggle-directional': lights.directionalLight,
  };

  Object.entries(map).forEach(([id, light]) => {
    const checkbox = document.getElementById(id);
    if (!checkbox) return;

    checkbox.checked = light.visible;
    checkbox.addEventListener('change', () => {
      light.visible = checkbox.checked;
    });
  });
}

init();
