import * as THREE from 'three';

/**
 * Raycaster + 3 chế độ biến đổ Affine thủ công.
 *
 * Click chuột (không drag) → Raycaster chọn vật thể.
 * Phím mũi tên → biến đổi vật thể theo mode đang chọn.
 *
 * Tương thích Orbit Camera (không cần pointer lock).
 */

const MODES = ['translate', 'rotate', 'scale'];

export function setupInteraction(camera, scene, renderer, cameraControls, solarSystem) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let selectedObject = null;
  let previousEmissive = null;
  let currentMode = 0;

  // Tốc độ đủ lớn để thấy rõ khi bấm mũi tên
  const TRANSLATE_SPEED = 2.0;
  const ROTATE_SPEED = 0.15;
  const SCALE_SPEED = 0.1;

  function getPickableObjects() {
    const pickable = [];
    scene.traverse((obj) => {
      if (obj.isMesh && obj.name && !obj.name.startsWith('__') && obj.geometry) {
        pickable.push(obj);
      }
    });
    return pickable;
  }

  // Click = mouseup sau khi không drag
  renderer.domElement.addEventListener('mouseup', (event) => {
    if (event.button !== 0) return;
    if (!cameraControls.wasClick()) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(getPickableObjects(), false);

    if (intersects.length > 0) {
      selectObject(intersects[0].object);
    } else {
      deselectObject();
    }
  });

  function selectObject(obj) {
    if (selectedObject && selectedObject !== obj) restoreEmissive(selectedObject);

    selectedObject = obj;

    if (selectedObject.material && selectedObject.material.emissive) {
      previousEmissive = selectedObject.material.emissive.getHex();
      selectedObject.material.emissive.setHex(0x4488cc);
      selectedObject.material.emissiveIntensity = 0.8;
    }

    // Thông báo SolarSystem ngừng ghi đè rotation cho mesh này
    if (solarSystem) solarSystem.setSelectedMesh(selectedObject);

    updateSelectionHUD();
  }

  function deselectObject() {
    if (selectedObject) restoreEmissive(selectedObject);
    selectedObject = null;
    previousEmissive = null;
    if (solarSystem) solarSystem.setSelectedMesh(null);
    updateSelectionHUD();
  }

  function restoreEmissive(obj) {
    if (obj.material && obj.material.emissive) {
      obj.material.emissive.setHex(previousEmissive ?? 0x000000);
      obj.material.emissiveIntensity = 1.0;
    }
  }

  function setMode(index) {
    currentMode = index;
    updateModeButtons();
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
        ? `Đã chọn: ${selectedObject.name}`
        : 'Click vật thể để chọn';
    }
  }

  document.addEventListener('keydown', (event) => {
    if (!selectedObject) return;

    if (event.key === 'Escape') {
      deselectObject();
      return;
    }

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();

    const mode = MODES[currentMode];

    if (mode === 'translate') {
      const d = TRANSLATE_SPEED;
      if (event.key === 'ArrowUp') selectedObject.position.z -= d;
      if (event.key === 'ArrowDown') selectedObject.position.z += d;
      if (event.key === 'ArrowLeft') selectedObject.position.x -= d;
      if (event.key === 'ArrowRight') selectedObject.position.x += d;
    } else if (mode === 'rotate') {
      const r = ROTATE_SPEED;
      if (event.key === 'ArrowUp') selectedObject.rotation.x -= r;
      if (event.key === 'ArrowDown') selectedObject.rotation.x += r;
      if (event.key === 'ArrowLeft') selectedObject.rotation.y -= r;
      if (event.key === 'ArrowRight') selectedObject.rotation.y += r;
    } else if (mode === 'scale') {
      const s = SCALE_SPEED;
      if (event.key === 'ArrowUp') selectedObject.scale.multiplyScalar(1 + s);
      if (event.key === 'ArrowDown') selectedObject.scale.multiplyScalar(1 - s);
      if (event.key === 'ArrowLeft') selectedObject.scale.x *= (1 - s);
      if (event.key === 'ArrowRight') selectedObject.scale.x *= (1 + s);
    }
  });

  window.__interactionSetMode = setMode;
  setTimeout(() => { updateModeButtons(); updateSelectionHUD(); }, 0);

  return { getSelected: () => selectedObject, setMode, deselectObject };
}

/**
 * Upload texture runtime: đọc ảnh → gán lên vật thể đang chọn.
 */
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
