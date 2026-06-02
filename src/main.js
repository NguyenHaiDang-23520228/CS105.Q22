import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
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

  // ── CSS2D Renderer — render label tên hành tinh song song với WebGL ──
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'fixed';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild(labelRenderer.domElement);

  // ── Orbit Camera ──
  const camControls = setupOrbitCamera(camera, renderer.domElement);

  const clipInfo = document.getElementById('clip-info');
  const clipHint = document.getElementById('clip-hint');
  const shadowStatusEl = document.getElementById('shadow-status');

  function refreshClipHUD(state) {
    if (clipInfo) clipInfo.textContent = `Near: ${state.near} | Far: ${state.far}`;
    if (clipHint) clipHint.textContent = state.hint;
  }

  camControls.onClipChange = refreshClipHUD;
  refreshClipHUD(camControls.getClipState());

  let shadowsEnabled = true;
  let pausedForAffine = false;

  function applyShadowMode(enabled) {
    shadowsEnabled = enabled;
    renderer.shadowMap.enabled = enabled;
    lights.ambientLight.intensity = enabled ? 0.35 : 1.1;
    lights.directionalLight.intensity = enabled ? 1.8 : 0.35;

    scene.traverse((obj) => {
      if (!obj.isMesh || obj.name?.startsWith('__')) return;
      if (obj.name === 'Mặt Trời') return;
      obj.castShadow = enabled;
      obj.receiveShadow = enabled;
      if (obj.material) obj.material.needsUpdate = true;
    });

    if (shadowStatusEl) shadowStatusEl.textContent = enabled ? 'Bật' : 'Tắt';
  }
  applyShadowMode(true);

  // ── Raycaster + Affine ──
  const interaction = setupInteraction(camera, scene, renderer, camControls, solarSystem, {
    onSelect: () => {
      if (!paused) {
        paused = true;
        pausedForAffine = true;
        updateInfoBox('<b>Affine:</b> Đã tạm dừng animation — dùng ↑↓←→');
      }
    },
    onDeselect: () => {
      if (pausedForAffine) {
        paused = false;
        pausedForAffine = false;
      }
    },
    onAffineChange: (obj, mode) => {
      updateInfoBox(`<b>Affine (${mode}):</b> ${obj.name}`);
    },
  });
  setupTextureUpload(interaction);

  // ── Light toggles ──
  setupLightToggles(lights, solarSystem);

  // ── Animation state ──
  let paused = false;
  let speed = 1.0;
  let showOrbits = true;
  let showLabels = true;
  const infoBox = document.getElementById('infoBox');
  const labelStatusEl = document.getElementById('label-status');

  // Đồng bộ label ngay khi khởi tạo (visible + layer CSS2D)
  solarSystem.toggleLabels(showLabels);
  labelRenderer.domElement.style.display = showLabels ? 'block' : 'none';
  if (labelStatusEl) labelStatusEl.textContent = showLabels ? 'Bật' : 'Tắt';

  function updateInfoBox(text) {
    if (infoBox) infoBox.innerHTML = text;
  }

  // ── Speed slider (đồng bộ với phím +/-) ──
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');

  function setSpeed(v) {
    speed = Math.min(4.0, Math.max(0.0, v));
    if (speedSlider) speedSlider.value = String(speed);
    if (speedValue) speedValue.textContent = `${speed.toFixed(2)}x`;
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', () => setSpeed(parseFloat(speedSlider.value)));
  }
  setSpeed(speed);

  // ── Keyboard controls ──
  // Dùng window để tránh trường hợp focus UI làm mất key events
  window.addEventListener('keydown', (e) => {
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
      if (!paused) pausedForAffine = false;
      updateInfoBox(`<b>Animation:</b> ${paused ? 'Tạm dừng' : 'Đang chạy'}`);
    }

    // Toggle quỹ đạo
    if (e.key === 'o' || e.key === 'O') {
      showOrbits = !showOrbits;
      solarSystem.toggleOrbits(showOrbits);
      updateInfoBox(`<b>Quỹ đạo:</b> ${showOrbits ? 'Bật' : 'Tắt'}`);
    }

    // Clipping: [ thu hẹp, ] mở rộng, Shift đổi near thay vì far
    if (e.key === '[') {
      const tag = e.target?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        refreshClipHUD(camControls.clipTighten(e.shiftKey));
      }
    }
    if (e.key === ']') {
      const tag = e.target?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        refreshClipHUD(camControls.clipLoosen(e.shiftKey));
      }
    }
    if (e.key === '\\') {
      e.preventDefault();
      refreshClipHUD(camControls.clipReset());
    }

    // Toggle shadow (S) — đổi cả ambient + cast shadow
    if (e.key === 's' || e.key === 'S') {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      applyShadowMode(!shadowsEnabled);
      updateInfoBox(`<b>Shadow:</b> ${shadowsEnabled ? 'Bật' : 'Tắt'}`);
    }

    // Tốc độ
    if (e.key === '+' || e.key === '=') {
      setSpeed(speed + 0.15);
      updateInfoBox(`<b>Tốc độ:</b> ${speed.toFixed(2)}x`);
    }
    if (e.key === '-' || e.key === '_') {
      setSpeed(speed - 0.15);
      updateInfoBox(`<b>Tốc độ:</b> ${speed.toFixed(2)}x`);
    }

    // Toggle label tên hành tinh (L)
    if (e.key === 'l' || e.key === 'L') {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      showLabels = !showLabels;
      solarSystem.toggleLabels(showLabels);
      labelRenderer.domElement.style.display = showLabels ? 'block' : 'none';
      if (labelStatusEl) labelStatusEl.textContent = showLabels ? 'Bật' : 'Tắt';
      updateInfoBox(`<b>Label:</b> ${showLabels ? 'Bật' : 'Tắt'}`);
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
    interaction.updateSelectionBox();

    // Cập nhật sky shader time
    if (skySphere.material.uniforms) {
      skySphere.material.uniforms.uTime.value = elapsed;
    }

    renderer.render(scene, camera);
    if (showLabels) {
      labelRenderer.render(scene, camera);
    }
  }

  requestAnimationFrame(animate);

  // ── Resize ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/**
 * Gắn checkbox bật/tắt đèn + PointLight mặt trời.
 */
function setupLightToggles(lights, solarSystem) {
  const map = {
    'toggle-ambient': lights.ambientLight,
    'toggle-directional': lights.directionalLight,
    'toggle-sunlight': solarSystem.sunLight,
  };

  Object.entries(map).forEach(([id, light]) => {
    const cb = document.getElementById(id);
    if (!cb) return;
    cb.checked = light.visible;
    cb.addEventListener('change', () => { light.visible = cb.checked; });
  });
}

init();
