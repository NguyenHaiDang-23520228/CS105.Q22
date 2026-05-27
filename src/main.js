import * as THREE from 'three';
import { createScene } from './core/Scene.js';
import { createCamera, setupOrbitCamera } from './core/Camera.js';
import { createRenderer } from './core/Renderer.js';
import { setupInteraction, setupTextureUpload } from './core/Interaction.js';

/**
 * Entry point — khởi tạo toàn bộ ứng dụng:
 *   Scene → Camera → Renderer → Interaction → Controls
 *
 * Phím tắt:
 *   1-8: focus hành tinh, 0: toàn cảnh
 *   Space: tạm dừng/chạy animation
 *   O: bật/tắt đường quỹ đạo
 *   S: bật/tắt shadow mapping
 *   +/-: tăng/giảm tốc độ
 *   [ / ]: thay đổi near/far clipping planes
 *   Arrow Keys: biến đổi Affine vật thể đang chọn
 *   ESC: bỏ chọn vật thể
 */
function init() {
  const { scene, skySphere, lights, solarSystem } = createScene();
  const camera = createCamera();
  const renderer = createRenderer();
  document.body.appendChild(renderer.domElement);

  // ── Orbit Camera ──
  const camControls = setupOrbitCamera(camera, renderer.domElement);

  const clipInfo = document.getElementById('clip-info');
  camControls.onClipChange = (near, far) => {
    if (clipInfo) clipInfo.textContent = `Near: ${near} | Far: ${far}`;
  };

  // ── Raycaster + Affine ──
  const interaction = setupInteraction(camera, scene, renderer, camControls);
  setupTextureUpload(interaction);

  // ── Light toggles ──
  setupLightToggles(lights, solarSystem);

  // ── Animation state ──
  let paused = false;
  let speed = 1.0;
  let showOrbits = true;
  const infoBox = document.getElementById('infoBox');

  function updateInfoBox(text) {
    if (infoBox) infoBox.innerHTML = text;
  }

  // ── Keyboard controls ──
  document.addEventListener('keydown', (e) => {
    // Focus hành tinh
    const digit = parseInt(e.key, 10);
    if (digit >= 1 && digit <= 8) {
      camControls.focusPlanet(
        digit - 1,
        (i) => solarSystem.getPlanetWorldPos(i),
        (i) => solarSystem.PLANET_DATA[i]?.radius || 2
      );
      const name = solarSystem.PLANET_DATA[digit - 1]?.name || '';
      updateInfoBox(`<b>Đang xem:</b> ${name}`);
    }
    if (e.key === '0') {
      camControls.focusPlanet(-1, null, null);
      updateInfoBox('<b>Đang xem:</b> Toàn cảnh');
    }

    // Pause / Resume
    if (e.code === 'Space') {
      e.preventDefault();
      paused = !paused;
      updateInfoBox(`<b>Animation:</b> ${paused ? 'Tạm dừng' : 'Đang chạy'}`);
    }

    // Toggle quỹ đạo
    if (e.key === 'o' || e.key === 'O') {
      showOrbits = !showOrbits;
      solarSystem.toggleOrbits(showOrbits);
      updateInfoBox(`<b>Quỹ đạo:</b> ${showOrbits ? 'Bật' : 'Tắt'}`);
    }

    // Toggle shadow
    if (e.key === 's' || e.key === 'S') {
      // Chỉ toggle khi không có vật thể đang chọn (tránh xung đột)
      if (!interaction.getSelected()) {
        renderer.shadowMap.enabled = !renderer.shadowMap.enabled;
        scene.traverse((obj) => {
          if (obj.material) obj.material.needsUpdate = true;
        });
        updateInfoBox(`<b>Shadow Map:</b> ${renderer.shadowMap.enabled ? 'Bật' : 'Tắt'}`);
      }
    }

    // Tốc độ
    if (e.key === '+' || e.key === '=') {
      speed = Math.min(4.0, speed + 0.15);
      updateInfoBox(`<b>Tốc độ:</b> ${speed.toFixed(2)}x`);
    }
    if (e.key === '-' || e.key === '_') {
      speed = Math.max(0.1, speed - 0.15);
      updateInfoBox(`<b>Tốc độ:</b> ${speed.toFixed(2)}x`);
    }
  });

  // ── Render loop ──
  let lastTime = performance.now();
  let elapsed = 0;

  function animate(now) {
    requestAnimationFrame(animate);

    const dt = Math.min(0.04, (now - lastTime) / 1000);
    lastTime = now;

    if (!paused) elapsed += dt * speed;

    // Camera follow hành tinh liên tục
    camControls.update((i) => solarSystem.getPlanetWorldPos(i));

    // Cập nhật hệ mặt trời (quỹ đạo, tự quay, sun glow)
    solarSystem.update(elapsed, speed);

    // Cập nhật sky shader time
    if (skySphere.material.uniforms) {
      skySphere.material.uniforms.uTime.value = elapsed;
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  // ── Resize ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/**
 * Gắn checkbox bật/tắt đèn + PointLight mặt trời.
 */
function setupLightToggles(lights, solarSystem) {
  const map = {
    'toggle-ambient': lights.ambientLight,
    'toggle-directional': lights.directionalLight,
  };

  Object.entries(map).forEach(([id, light]) => {
    const cb = document.getElementById(id);
    if (!cb) return;
    cb.checked = light.visible;
    cb.addEventListener('change', () => { light.visible = cb.checked; });
  });
}

init();
