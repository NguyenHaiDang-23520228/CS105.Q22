import * as THREE from 'three';

/**
 * Tạo PerspectiveCamera — ma trận chiếu phối cảnh:
 *   P = perspective(fov, aspect, near, far)
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camera.position.set(0, 40, 90);
  return camera;
}

/**
 * Orbit Camera — tự viết, không dùng OrbitControls.
 *
 * Dùng hệ tọa độ cầu (spherical coordinates):
 *   x = target.x + r·sinφ·sinθ
 *   y = target.y + r·cosφ
 *   z = target.z + r·sinφ·cosθ
 *
 * Trong đó:
 *   θ (theta) = góc xoay ngang (azimuthal)
 *   φ (phi)   = góc đứng từ cực trên (polar)
 *   r = khoảng cách camera đến target
 *
 * Chuyển mượt bằng nội suy tuyến tính (lerp) mỗi frame.
 */
export function setupOrbitCamera(camera, domElement) {
  let theta = 0.0;
  let phi = 1.1;
  let distance = 90;

  let desiredTarget = new THREE.Vector3(0, 0, 0);
  let desiredDistance = 90;
  let desiredPhi = 1.1;

  const target = new THREE.Vector3(0, 0, 0);

  let near = 0.1;
  let far = 3000;

  let dragging = false;
  let panning = false;
  let lastMouse = [0, 0];
  let mouseMoved = false;

  const PHI_MIN = 0.08;
  const PHI_MAX = Math.PI - 0.08;

  domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  domElement.addEventListener('mousedown', (e) => {
    dragging = e.button === 0;
    panning = e.button === 2 || e.button === 1;
    lastMouse = [e.clientX, e.clientY];
    mouseMoved = false;
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    panning = false;
  });

  window.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastMouse[0];
    const dy = e.clientY - lastMouse[1];
    lastMouse = [e.clientX, e.clientY];

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) mouseMoved = true;

    if (dragging) {
      // Xoay camera: thay đổi θ (ngang) và φ (đứng)
      theta -= dx * 0.006;
      desiredPhi = Math.min(PHI_MAX, Math.max(PHI_MIN, desiredPhi + dy * 0.006));
    }

    if (panning) {
      // Pan: dịch target theo hướng phải và lên
      const right = new THREE.Vector3(Math.cos(theta), 0, -Math.sin(theta));
      const up = new THREE.Vector3(0, 1, 0);
      const panScale = distance * 0.0016;
      desiredTarget.addScaledVector(right, -dx * panScale);
      desiredTarget.addScaledVector(up, dy * panScale);
      controls.focusIndex = -1;
    }
  });

  domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    desiredDistance *= Math.exp(e.deltaY * 0.001);
    desiredDistance = Math.max(3.0, Math.min(300.0, desiredDistance));
  }, { passive: false });

  // Phím [ / ]: thay đổi near/far clipping planes
  document.addEventListener('keydown', (e) => {
    if (e.key === '[') {
      near = 5;
      far = 50;
      applyClip();
    }
    if (e.key === ']') {
      near = 0.1;
      far = 3000;
      applyClip();
    }
  });

  function applyClip() {
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
    if (controls.onClipChange) controls.onClipChange(near, far);
  }

  /**
   * Focus vào hành tinh: đặt desiredTarget & desiredDistance.
   * Nếu index < 0 → quay về toàn cảnh.
   */
  function focusPlanet(index, getPosFunc, getRadiusFunc) {
    controls.focusIndex = index;
    if (index < 0) {
      desiredTarget.set(0, 0, 0);
      desiredDistance = 90;
      desiredPhi = 1.1;
      return;
    }
    const pos = getPosFunc(index);
    desiredTarget.copy(pos);
    const r = getRadiusFunc ? getRadiusFunc(index) : 2;
    desiredDistance = r * 5 + 8;
    desiredPhi = 1.05;
  }

  const controls = {
    focusIndex: -1,
    onClipChange: null,
    focusPlanet,

    /** Cập nhật mỗi frame — lerp tọa độ cầu rồi chuyển sang Descartes */
    update(getPosFunc) {
      // Nếu đang focus, liên tục cập nhật target theo vị trí hành tinh
      if (controls.focusIndex >= 0 && getPosFunc) {
        const pos = getPosFunc(controls.focusIndex);
        desiredTarget.copy(pos);
      }

      target.lerp(desiredTarget, 0.08);
      distance += (desiredDistance - distance) * 0.06;
      phi += (desiredPhi - phi) * 0.04;

      // Tọa độ cầu → Descartes
      const sinPhi = Math.sin(phi);
      const x = target.x + distance * sinPhi * Math.sin(theta);
      const y = target.y + distance * Math.cos(phi);
      const z = target.z + distance * sinPhi * Math.cos(theta);

      camera.position.set(x, y, z);
      camera.lookAt(target);
    },

    /** Click không drag = raycast (trả về true nếu là click thuần) */
    wasClick() {
      return !mouseMoved;
    },

    getTarget() { return target; },
  };

  return controls;
}
