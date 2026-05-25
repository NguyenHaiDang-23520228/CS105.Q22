import * as THREE from 'three';

/**
 * Tạo WebGLRenderer với Shadow Mapping bật sẵn.
 */
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Bật shadow map — PCFSoft cho cạnh bóng mềm hơn
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return renderer;
}
