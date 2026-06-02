import * as THREE from 'three';

/**
 * Raycaster + 3 chế đổi Affine thủ công (Tịnh tiến / Quay / Tỉ lệ).
 */
const MODES = ['translate', 'rotate', 'scale'];
const MODE_LABELS = [
  'Tịnh tiến · ↑↓ = trục Z · ←→ = trục X',
  'Quay · ↑↓ = quanh trục X · ←→ = quanh trục Y',
  'Tỉ lệ · ↑ to ra · ↓ nhỏ lại · ←→ kéo trục X',
];

export function setupInteraction(camera, scene, renderer, cameraControls, solarSystem, hooks = {}) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let selectedObject = null;
  let currentMode = 0;
  let selectionBox = null;

  const emissiveState = new WeakMap();

  const TRANSLATE_SPEED = 5.0;
  const ROTATE_SPEED = 0.35;
  const SCALE_SPEED = 0.22;

  function getPickableObjects() {
    const pickable = [];
    scene.traverse((obj) => {
      if (obj.isMesh && obj.name && !obj.name.startsWith('__') && obj.geometry) {
        pickable.push(obj);
      }
    });
    return pickable;
  }

  renderer.domElement.addEventListener('mouseup', (event) => {
    if (event.button !== 0) return;
    if (!cameraControls.wasClick()) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(getPickableObjects(), false);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (selectedObject === obj) {
        deselectObject();
      } else {
        selectObject(obj);
      }
    } else {
      deselectObject();
    }
  });

  function attachSelectionBox(obj) {
    if (selectionBox) {
      scene.remove(selectionBox);
      selectionBox.dispose();
      selectionBox = null;
    }
    selectionBox = new THREE.BoxHelper(obj, 0x44ffaa);
    scene.add(selectionBox);
  }

  function selectObject(obj) {
    if (selectedObject && selectedObject !== obj) restoreEmissive(selectedObject);

    selectedObject = obj;
    attachSelectionBox(obj);

    if (selectedObject.material?.emissive) {
      if (!emissiveState.has(selectedObject)) {
        emissiveState.set(selectedObject, {
          hex: selectedObject.material.emissive.getHex(),
          intensity: selectedObject.material.emissiveIntensity ?? 1.0,
        });
      }
      selectedObject.material.emissive.setHex(0x4488cc);
      selectedObject.material.emissiveIntensity = 0.85;
    }

    if (solarSystem) {
      solarSystem.setSelectedMesh(selectedObject);
      solarSystem.setManualControl(selectedObject);
    }

    if (hooks.onSelect) hooks.onSelect(selectedObject);
    updateSelectionHUD();
    updateAffinePanel();
  }

  function deselectObject() {
    if (selectedObject) restoreEmissive(selectedObject);
    selectedObject = null;

    if (selectionBox) {
      scene.remove(selectionBox);
      selectionBox.dispose();
      selectionBox = null;
    }

    if (solarSystem) {
      solarSystem.setSelectedMesh(null);
      solarSystem.setManualControl(null);
    }

    if (hooks.onDeselect) hooks.onDeselect();
    updateSelectionHUD();
    updateAffinePanel();
  }

  function restoreEmissive(obj) {
    if (obj.material?.emissive) {
      const st = emissiveState.get(obj);
      obj.material.emissive.setHex(st?.hex ?? 0x000000);
      obj.material.emissiveIntensity = st?.intensity ?? 1.0;
    }
  }

  function setMode(index) {
    currentMode = index;
    updateModeButtons();
    updateAffinePanel();
  }

  function updateModeButtons() {
    MODES.forEach((m, i) => {
      const btn = document.getElementById(`btn-mode-${m}`);
      if (btn) btn.classList.toggle('active', i === currentMode);
    });
  }

  function updateSelectionHUD() {
    const el = document.getElementById('selection-info');
    if (el) {
      el.textContent = selectedObject
        ? `Đang chọn: ${selectedObject.name}`
        : 'Chưa chọn hành tinh nào';
    }
  }

  // Cập nhật panel Affine bên phải: tên hành tinh, mode hint, khoá/mở control
  function updateAffinePanel() {
    const panel = document.getElementById('affine-panel');
    const selEl = document.getElementById('affine-selected');
    const hintEl = document.getElementById('affine-mode-hint');

    if (panel) panel.classList.toggle('affine-locked', !selectedObject);

    if (selEl) {
      if (selectedObject) {
        selEl.textContent = `▶ ${selectedObject.name}`;
        selEl.classList.add('has-target');
      } else {
        selEl.textContent = 'Chưa chọn hành tinh';
        selEl.classList.remove('has-target');
      }
    }

    if (hintEl) {
      hintEl.textContent = selectedObject
        ? MODE_LABELS[currentMode]
        : 'Click 1 hành tinh để bật điều khiển';
    }
  }

  /**
   * Áp dụng 1 bước biến đổi Affine theo hướng + mode hiện tại.
   * Dùng chung cho cả phím mũi tên và nút D-pad.
   */
  function applyAffine(direction, shift = false) {
    if (!selectedObject) return;
    const mode = MODES[currentMode];

    if (mode === 'translate') {
      const d = TRANSLATE_SPEED;
      if (direction === 'up' && shift) selectedObject.position.y += d;
      else if (direction === 'down' && shift) selectedObject.position.y -= d;
      else if (direction === 'up') selectedObject.position.z -= d;
      else if (direction === 'down') selectedObject.position.z += d;
      else if (direction === 'left') selectedObject.position.x -= d;
      else if (direction === 'right') selectedObject.position.x += d;
    } else if (mode === 'rotate') {
      const r = ROTATE_SPEED;
      if (direction === 'up') selectedObject.rotation.x -= r;
      else if (direction === 'down') selectedObject.rotation.x += r;
      else if (direction === 'left') selectedObject.rotation.y -= r;
      else if (direction === 'right') selectedObject.rotation.y += r;
    } else if (mode === 'scale') {
      const s = SCALE_SPEED;
      if (direction === 'up') selectedObject.scale.multiplyScalar(1 + s);
      else if (direction === 'down') selectedObject.scale.multiplyScalar(Math.max(0.05, 1 - s));
      else if (direction === 'left') selectedObject.scale.x = Math.max(0.05, selectedObject.scale.x * (1 - s));
      else if (direction === 'right') selectedObject.scale.x *= (1 + s);
    }

    if (selectionBox) selectionBox.update();
    if (hooks.onAffineChange) hooks.onAffineChange(selectedObject, mode);
  }

  const ARROW_MAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  };

  window.addEventListener('keydown', (event) => {
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!selectedObject) return;

    if (event.key === 'Escape') {
      deselectObject();
      return;
    }

    const dir = ARROW_MAP[event.key];
    if (!dir) return;
    event.preventDefault();
    applyAffine(dir, event.shiftKey);
  });

  // Nút D-pad bấm chuột → di chuyển hành tinh theo mode đang chọn
  document.querySelectorAll('.dpad button[data-affine]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      applyAffine(btn.getAttribute('data-affine'), e.shiftKey);
    });
  });

  window.__interactionSetMode = setMode;
  setTimeout(() => {
    updateModeButtons();
    updateSelectionHUD();
    updateAffinePanel();
  }, 0);

  return {
    getSelected: () => selectedObject,
    setMode,
    deselectObject,
    updateSelectionBox: () => { if (selectionBox) selectionBox.update(); },
  };
}

export function setupTextureUpload(interactionCtx) {
  const input = document.getElementById('uploadTexture');
  if (!input) return;

  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const selected = interactionCtx.getSelected();
    if (!selected) {
      alert('Hãy chọn một vật thể trước khi upload texture!');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const loader = new THREE.TextureLoader();
      loader.load(e.target.result, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        if (selected.material) {
          if (selected.material.map) selected.material.map.dispose();
          selected.material.map = texture;
          selected.material.needsUpdate = true;
        }
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  });
}
