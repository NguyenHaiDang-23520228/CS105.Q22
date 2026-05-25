import * as THREE from 'three';

/**
 * Module tương tác: Raycaster + 3 chế độ biến đổi Affine thủ công.
 *
 * Raycaster chiếu tia từ vị trí chuột qua ma trận chiếu ngược (Inverse Projection)
 * để xác định vật thể bị click trong không gian 3D.
 *
 * 3 mode Affine:
 *   - Tịnh tiến (Translation): dịch position theo phím mũi tên
 *   - Quay (Rotation): xoay quanh trục Y/X theo phím mũi tên
 *   - Tỉ lệ (Scaling): phóng to/thu nhỏ theo phím mũi tên
 */

const MODES = ['translate', 'rotate', 'scale'];
const MODE_LABELS = {
  translate: 'Tịnh tiến',
  rotate: 'Quay',
  scale: 'Tỉ lệ',
};

export function setupInteraction(camera, scene, renderer, controls) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let selectedObject = null;
  let previousEmissive = null;
  let currentMode = 0; // index trong MODES

  // Tốc độ biến đổi Affine theo mode
  const TRANSLATE_SPEED = 0.5;
  const ROTATE_SPEED = 0.05;
  const SCALE_SPEED = 0.05;

  // Hàm lọc: chỉ pick các Mesh có tên hoặc có geometry (bỏ qua grid, floor, orbit lines)
  function getPickableObjects() {
    const pickable = [];
    scene.traverse((obj) => {
      if (obj.isMesh && obj.name && obj.name !== '' && obj.geometry) {
        pickable.push(obj);
      }
    });
    return pickable;
  }

  // Click chuột → Raycaster chọn vật thể
  renderer.domElement.addEventListener('click', (event) => {
    // Chỉ xử lý khi KHÔNG ở Pointer Lock (khi ESC đã thoát lock)
    if (document.pointerLockElement === renderer.domElement) return;

    // Chuyển tọa độ pixel sang NDC (Normalized Device Coordinates) [-1, 1]
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
    // Bỏ chọn cũ
    if (selectedObject && selectedObject !== obj) {
      restoreEmissive(selectedObject);
    }

    selectedObject = obj;

    // Đánh dấu bằng emissive color (viền sáng)
    if (selectedObject.material && selectedObject.material.emissive) {
      previousEmissive = selectedObject.material.emissive.getHex();
      selectedObject.material.emissive.setHex(0x335599);
      selectedObject.material.emissiveIntensity = 0.6;
    }

    // Vô hiệu hóa WASD camera khi đang thao tác vật thể
    controls.disabled = true;

    updateSelectionHUD();
  }

  function deselectObject() {
    if (selectedObject) {
      restoreEmissive(selectedObject);
    }
    selectedObject = null;
    previousEmissive = null;
    controls.disabled = false;
    updateSelectionHUD();
  }

  function restoreEmissive(obj) {
    if (obj.material && obj.material.emissive) {
      obj.material.emissive.setHex(previousEmissive ?? 0x000000);
      obj.material.emissiveIntensity = 1.0;
    }
  }

  // Chuyển mode khi bấm nút
  function setMode(index) {
    currentMode = index;
    updateModeButtons();
  }

  function cycleMode() {
    currentMode = (currentMode + 1) % MODES.length;
    updateModeButtons();
  }

  // Cập nhật UI nút mode
  function updateModeButtons() {
    MODES.forEach((m, i) => {
      const btn = document.getElementById(`btn-mode-${m}`);
      if (btn) {
        btn.classList.toggle('active', i === currentMode);
      }
    });
  }

  function updateSelectionHUD() {
    const el = document.getElementById('selection-info');
    if (el) {
      el.textContent = selectedObject
        ? `Đã chọn: ${selectedObject.name || 'Mesh'}`
        : 'Chưa chọn vật thể (ESC → click để chọn)';
    }
  }

  // Phím mũi tên → biến đổi Affine lên vật thể đang chọn
  document.addEventListener('keydown', (event) => {
    if (!selectedObject) return;

    const mode = MODES[currentMode];

    // Phím ESC → bỏ chọn
    if (event.key === 'Escape') {
      deselectObject();
      return;
    }

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();

    if (mode === 'translate') {
      // Ma trận Tịnh tiến T(dx, dy, dz): position += delta
      const d = TRANSLATE_SPEED;
      if (event.key === 'ArrowUp') selectedObject.position.z -= d;
      if (event.key === 'ArrowDown') selectedObject.position.z += d;
      if (event.key === 'ArrowLeft') selectedObject.position.x -= d;
      if (event.key === 'ArrowRight') selectedObject.position.x += d;
    }

    if (mode === 'rotate') {
      // Ma trận Quay R(θ): rotation quanh trục Y hoặc X
      const r = ROTATE_SPEED;
      if (event.key === 'ArrowUp') selectedObject.rotation.x -= r;
      if (event.key === 'ArrowDown') selectedObject.rotation.x += r;
      if (event.key === 'ArrowLeft') selectedObject.rotation.y -= r;
      if (event.key === 'ArrowRight') selectedObject.rotation.y += r;
    }

    if (mode === 'scale') {
      // Ma trận Tỉ lệ S(sx, sy, sz): scale đồng nhất
      const s = SCALE_SPEED;
      if (event.key === 'ArrowUp') selectedObject.scale.multiplyScalar(1 + s);
      if (event.key === 'ArrowDown') selectedObject.scale.multiplyScalar(1 - s);
      if (event.key === 'ArrowLeft') selectedObject.scale.x *= (1 - s);
      if (event.key === 'ArrowRight') selectedObject.scale.x *= (1 + s);
    }
  });

  // Expose cho nút HTML
  window.__interactionSetMode = setMode;
  window.__interactionCycleMode = cycleMode;

  // Khởi tạo UI ban đầu
  setTimeout(() => {
    updateModeButtons();
    updateSelectionHUD();
  }, 0);

  return {
    getSelected: () => selectedObject,
    setMode,
    deselectObject,
  };
}

/**
 * Upload texture runtime: đọc file ảnh từ <input>, gán lên vật thể đang chọn.
 * Dùng FileReader → DataURL → TextureLoader → overwrite material.map
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
        // Overwrite texture lên material của vật thể đang chọn
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
