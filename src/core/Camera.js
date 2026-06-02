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

/** Các bước far — giảm dần để thấy hành tinh xa biến mất (không đen cả màn hình ngay). */
const FAR_STEPS = [3000, 2000, 1200, 700, 400, 220, 120];
/** Các bước near — tăng dần để cắt vật quá gần camera (rõ khi focus gần hành tinh). */
const NEAR_STEPS = [0.1, 0.5, 2, 8, 20, 50];

/**
 * Orbit Camera — tự viết, không dùng OrbitControls.
 */
export function setupOrbitCamera(camera, domElement) {
  let theta = 0.0;
  let phi = 1.1;
  let distance = 90;

  let desiredTarget = new THREE.Vector3(0, 0, 0);
  let desiredDistance = 90;
  let desiredPhi = 1.1;

  const target = new THREE.Vector3(0, 0, 0);

  let near = NEAR_STEPS[0];
  let far = FAR_STEPS[0];
  let farStepIndex = 0;
  let nearStepIndex = 0;

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
      theta -= dx * 0.006;
      desiredPhi = Math.min(PHI_MAX, Math.max(PHI_MIN, desiredPhi + dy * 0.006));
    }

    if (panning) {
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

  function applyClip() {
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
    if (controls.onClipChange) controls.onClipChange(getClipState());
  }

  function getClipState() {
    let hint = '';
    if (farStepIndex > 0) {
      hint = `Far=${far}: vật xa hơn ${far} đơn vị bị cắt (mờ dần/biến mất)`;
    } else if (nearStepIndex > 0) {
      hint = `Near=${near}: vật gần camera hơn ${near} đơn vị bị cắt`;
    } else {
      hint = 'Mặc định — thấy toàn bộ hệ Mặt Trời';
    }
    return { near, far, farStepIndex, nearStepIndex, hint };
  }

  /**
   * [ — thu hẹp vùng nhìn (từng bước, dễ thấy).
   *   Không Shift: giảm far → hành tinh xa dần biến mất.
   *   Shift+[ : tăng near → cắt vật quá gần (thử khi focus phím 1–8).
   */
  function clipTighten(shiftKey = false) {
    if (shiftKey) {
      nearStepIndex = Math.min(NEAR_STEPS.length - 1, nearStepIndex + 1);
      near = NEAR_STEPS[nearStepIndex];
    } else {
      farStepIndex = Math.min(FAR_STEPS.length - 1, farStepIndex + 1);
      far = FAR_STEPS[farStepIndex];
    }
    applyClip();
    return getClipState();
  }

  /**
   * ] — mở rộng lại vùng nhìn (ngược với [).
   */
  function clipLoosen(shiftKey = false) {
    if (shiftKey) {
      nearStepIndex = Math.max(0, nearStepIndex - 1);
      near = NEAR_STEPS[nearStepIndex];
    } else {
      farStepIndex = Math.max(0, farStepIndex - 1);
      far = FAR_STEPS[farStepIndex];
    }
    applyClip();
    return getClipState();
  }

  function clipReset() {
    farStepIndex = 0;
    nearStepIndex = 0;
    near = NEAR_STEPS[0];
    far = FAR_STEPS[0];
    applyClip();
    return getClipState();
  }

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
    clipTighten,
    clipLoosen,
    clipReset,
    getClipState,

    update(getPosFunc) {
      if (controls.focusIndex >= 0 && getPosFunc) {
        const pos = getPosFunc(controls.focusIndex);
        desiredTarget.copy(pos);
      }

      target.lerp(desiredTarget, 0.08);
      distance += (desiredDistance - distance) * 0.06;
      phi += (desiredPhi - phi) * 0.04;

      const sinPhi = Math.sin(phi);
      const x = target.x + distance * sinPhi * Math.sin(theta);
      const y = target.y + distance * Math.cos(phi);
      const z = target.z + distance * sinPhi * Math.cos(theta);

      camera.position.set(x, y, z);
      camera.lookAt(target);
    },

    wasClick() {
      return !mouseMoved;
    },

    getTarget() { return target; },
  };

  applyClip();
  return controls;
}
