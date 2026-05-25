import * as THREE from 'three';

/**
 * Tạo PerspectiveCamera — ma trận chiếu phối cảnh (Projection Matrix)
 * P = frustum(fov, aspect, near, far)
 * Chuyển tọa độ thế giới 3D → tọa độ clip → NDC → tọa độ màn hình 2D.
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75, // FOV (Field of View)
    window.innerWidth / window.innerHeight,
    0.1, // near clipping plane
    2000 // far clipping plane — tăng lên vì scene rộng hơn
  );
  camera.position.set(0, 5, 110);
  return camera;
}

/**
 * Điều khiển góc nhìn thứ nhất (FPS):
 *   WASD — Tịnh tiến (Translation) trên mặt phẳng XZ
 *   Chuột — Xoay (Rotation) yaw/pitch dùng Euler angles hệ YXZ
 *   [ / ] — Thay đổi near/far clipping planes
 *   1-9  — Teleport đến hành tinh
 *
 * controls.disabled = true → vô hiệu WASD khi đang thao tác Affine lên vật thể.
 */
export function setupFirstPersonControls(camera, domElement) {
  const moveSpeed = 25;
  const lookSpeed = 0.002;

  const keys = { w: false, a: false, s: false, d: false };
  let yaw = 0;
  let pitch = 0;

  let near = 0.1;
  let far = 2000;
  let clipMode = 'normal';

  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const direction = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  // Khóa con trỏ chuột khi click canvas
  domElement.addEventListener('click', () => {
    if (!controls.disabled) {
      domElement.requestPointerLock();
    }
  });

  document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement !== domElement) return;

    yaw -= event.movementX * lookSpeed;
    pitch -= event.movementY * lookSpeed;

    const limit = Math.PI / 2 - 0.01;
    pitch = Math.max(-limit, Math.min(limit, pitch));
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = true;

    if (event.key === '[') {
      clipMode = 'clipped';
      near = 5;
      far = 50;
      applyClipPlanes();
    }

    if (event.key === ']') {
      clipMode = 'normal';
      near = 0.1;
      far = 2000;
      applyClipPlanes();
    }

    // Teleport camera — phím 1-9 bay đến hành tinh
    const digit = parseInt(event.key, 10);
    if (digit >= 1 && digit <= 9 && controls.teleportFn) {
      controls.teleportFn(digit - 1);
    }
  });

  document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = false;
  });

  const controls = {
    disabled: false,
    onClipChange: null,
    teleportFn: null,

    update(delta) {
      // Luôn cập nhật hướng nhìn (xoay camera)
      euler.set(pitch, yaw, 0);
      camera.quaternion.setFromEuler(euler);

      // WASD chỉ hoạt động khi KHÔNG đang thao tác vật thể
      if (controls.disabled) return;

      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();

      right.crossVectors(direction, up).normalize();

      const v = moveSpeed * delta;
      if (keys.w) camera.position.addScaledVector(direction, v);
      if (keys.s) camera.position.addScaledVector(direction, -v);
      if (keys.a) camera.position.addScaledVector(right, -v);
      if (keys.d) camera.position.addScaledVector(right, v);
    },

    getClipMode: () => clipMode,
  };

  function applyClipPlanes() {
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();

    if (controls.onClipChange) {
      controls.onClipChange(near, far);
    }
  }

  return controls;
}
