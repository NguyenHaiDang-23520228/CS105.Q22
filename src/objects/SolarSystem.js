import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  sunVertexShader, sunFragmentShader,
  sunGlowVertexShader, sunGlowFragmentShader,
} from '../shaders/sunShader.js';
import {
  atmosphereVertexShader, atmosphereFragmentShader,
} from '../shaders/atmosphereShader.js';

// ====================================================================
// PROCEDURAL CANVAS TEXTURES — fallback khi không nạp được ảnh thật
// ====================================================================

function makeCanvasTexture(drawFn, w = 512, h = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function pseudo(x, y, seed) {
  const v = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return v - Math.floor(v);
}

function lerpColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function rgb01ToCss(c) {
  return `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
}

function hexToRgb01(hex) {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

function createProceduralTex(hexA, hexB, hexC, seed = 1) {
  const cA = hexToRgb01(hexA);
  const cB = hexToRgb01(hexB);
  const cC = hexToRgb01(hexC);

  return makeCanvasTexture((ctx, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        const band = 0.5 + 0.5 * Math.sin(v * 20 + pseudo(Math.floor(u * 12), Math.floor(v * 8), seed) * 6);
        const turb = pseudo(Math.floor(u * 40), Math.floor(v * 20), seed + 3) * 0.3;
        const spot = pseudo(Math.floor(u * 48), Math.floor(v * 24), seed + 7);
        const t = Math.min(1, Math.max(0, band + turb));
        let c = lerpColor(cA, cB, t);
        if (spot > 0.72) c = lerpColor(c, cC, 0.55);
        const gray = (c[0] + c[1] + c[2]) / 3;
        const sat = 1.4;
        c = [
          Math.min(1, gray + (c[0] - gray) * sat),
          Math.min(1, gray + (c[1] - gray) * sat),
          Math.min(1, gray + (c[2] - gray) * sat),
        ];
        ctx.fillStyle = rgb01ToCss(c);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

// ====================================================================
// REAL TEXTURE LOADER (2K/4K UV Mapping)
// ====================================================================

const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';

/**
 * Nạp texture thật từ URL bằng THREE.TextureLoader.
 * - Set colorSpace = SRGBColorSpace để màu không bị tối.
 * - Nếu URL lỗi (mất mạng / CORS), tự fallback sang procedural texture.
 *
 * Trả về material đã được gán map (cập nhật lại khi ảnh tải xong).
 */
function loadPlanetTexture(material, url, fallbackTex) {
  if (!url) {
    material.map = fallbackTex;
    material.needsUpdate = true;
    return;
  }

  textureLoader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      if (material.map && material.map !== fallbackTex) material.map.dispose();
      material.map = texture;
      material.needsUpdate = true;
    },
    undefined,
    () => {
      // onError → giữ procedural fallback
      material.map = fallbackTex;
      material.needsUpdate = true;
    }
  );
}

// ====================================================================
// DỮ LIỆU HÀNH TINH (+ textureUrl real + atmosphere)
// ====================================================================
//
// textureUrl: ảnh equirectangular (2:1). Earth & Moon dùng texture từ
// threejs.org (CORS ổn định). Các hành tinh khác dùng Solar System Scope.
// Nếu URL lỗi → fallback procedural (colA/colB/colC).

const PLANET_DATA = [
  { name: 'Sao Thủy', radius: 1.0, orbit: 12, speed: 1.35, selfSpin: 1.4, startAngle: 0.4,
    colA: 0x7d766d, colB: 0xc2b59b, colC: 0x3b3834, seed: 1,
    textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg' },
  { name: 'Sao Kim', radius: 1.65, orbit: 18, speed: 1.0, selfSpin: -0.45, startAngle: 1.2,
    colA: 0xa46a2a, colB: 0xf2c078, colC: 0xffe1aa, seed: 2,
    textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
    atmosphere: { color: 0xffcc88, power: 2.5, intensity: 1.2 } },
  { name: 'Trái Đất', radius: 2.0, orbit: 26, speed: 0.72, selfSpin: 1.7, startAngle: 2.0,
    colA: 0x0d5fb4, colB: 0x26a36c, colC: 0xe8f2ff, seed: 3,
    textureUrl: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    atmosphere: { color: 0x4488ff, power: 3.0, intensity: 1.0 } },
  { name: 'Sao Hỏa', radius: 1.45, orbit: 35, speed: 0.54, selfSpin: 1.25, startAngle: 2.8,
    colA: 0x9b321d, colB: 0xde8a4a, colC: 0x4c1d16, seed: 4,
    textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg' },
  { name: 'Sao Mộc', radius: 4.1, orbit: 49, speed: 0.32, selfSpin: 2.2, startAngle: 3.5,
    colA: 0x9a6b43, colB: 0xe8c49b, colC: 0x7d3d2a, seed: 5,
    textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg' },
  { name: 'Sao Thổ', radius: 3.5, orbit: 64, speed: 0.24, selfSpin: 1.9, startAngle: 4.1,
    colA: 0xb48b56, colB: 0xf0d6a7, colC: 0x7b623b, seed: 6,
    textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg' },
  { name: 'Thiên Vương', radius: 2.2, orbit: 78, speed: 0.16, selfSpin: 1.3, startAngle: 5.0,
    colA: 0x6baabb, colB: 0xaaddee, colC: 0x446688, seed: 8,
    textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg' },
  { name: 'Hải Vương', radius: 2.1, orbit: 90, speed: 0.11, selfSpin: 1.2, startAngle: 5.8,
    colA: 0x3355cc, colB: 0x4477dd, colC: 0x2244aa, seed: 9,
    textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg' },
];

const MOON_TEXTURE_URL = 'https://threejs.org/examples/textures/planets/moon_1024.jpg';

// ====================================================================
// HELPER: tạo CSS2D label cho hành tinh
// ====================================================================

function createLabel(text, yOffset) {
  const div = document.createElement('div');
  div.className = 'planet-label';
  div.textContent = text;
  const label = new CSS2DObject(div);
  label.position.set(0, yOffset, 0);
  label.name = '__label';
  return label;
}

// ====================================================================
// HELPER: tạo lớp khí quyển Fresnel
// ====================================================================

function createAtmosphere(radius, cfg) {
  const geo = new THREE.SphereGeometry(radius * 1.05, 48, 32);
  const mat = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(cfg.color) },
      uPower: { value: cfg.power },
      uIntensity: { value: cfg.intensity },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = '__atmosphere';
  return mesh;
}

// ====================================================================
// TẠO HỆ MẶT TRỜI
// ====================================================================

export function createSolarSystem() {
  const group = new THREE.Group();
  group.name = 'SolarSystem';

  const timeUniform = { value: 0 };

  // ── Mặt Trời: custom GLSL shader ──
  const sunGeo = new THREE.SphereGeometry(6.2, 64, 48);
  const sunMat = new THREE.ShaderMaterial({
    vertexShader: sunVertexShader,
    fragmentShader: sunFragmentShader,
    uniforms: { uTime: timeUniform },
  });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.name = 'Mặt Trời';
  group.add(sun);

  // ── Sun Glow ──
  const glowGeo = new THREE.SphereGeometry(7.5, 48, 32);
  const glowMat = new THREE.ShaderMaterial({
    vertexShader: sunGlowVertexShader,
    fragmentShader: sunGlowFragmentShader,
    uniforms: { uTime: timeUniform },
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const sunGlow = new THREE.Mesh(glowGeo, glowMat);
  sunGlow.name = '__sunGlow';
  group.add(sunGlow);

  // ── PointLight tại tâm Mặt Trời (có shadow bias khử acne) ──
  const sunLight = new THREE.PointLight(0xfff5dd, 350, 400);
  sunLight.name = 'SunLight';
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 400;
  sunLight.shadow.bias = -0.001;       // khử shadow acne (vân kẻ sọc)
  sunLight.shadow.normalBias = 0.05;   // đẩy theo normal để mượt hơn
  group.add(sunLight);

  const planets = [];
  const orbitGroups = [];
  const orbitLines = [];
  const planetLabels = []; // CSS2DObject — bật/tắt bằng visible (renderer không ghi đè)

  PLANET_DATA.forEach((d, index) => {
    const orbitGroup = new THREE.Group();
    orbitGroup.name = `orbit_${d.name}`;
    orbitGroup.rotation.y = d.startAngle;

    const planetGeo = new THREE.SphereGeometry(d.radius, 64, 48);
    const planetMat = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.0,
    });
    // Nạp texture thật (fallback procedural nếu lỗi)
    const fallback = createProceduralTex(d.colA, d.colB, d.colC, d.seed);
    loadPlanetTexture(planetMat, d.textureUrl, fallback);

    const mesh = new THREE.Mesh(planetGeo, planetMat);
    mesh.name = d.name;
    mesh.position.set(d.orbit, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    orbitGroup.add(mesh);

    // Label CSS2D
    const label = createLabel(d.name, d.radius + 1.2);
    planetLabels.push(label);
    mesh.add(label);

    // Khí quyển (Trái Đất + Sao Kim)
    if (d.atmosphere) {
      mesh.add(createAtmosphere(d.radius, d.atmosphere));
    }

    group.add(orbitGroup);
    orbitGroups.push(orbitGroup);
    planets.push({ mesh, data: d, orbitGroup, index });

    // Đường tròn quỹ đạo
    const curve = new THREE.BufferGeometry().setFromPoints(
      new THREE.Path().absarc(0, 0, d.orbit, 0, Math.PI * 2, false).getPoints(180)
    );
    const line = new THREE.Line(
      curve,
      new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.35 })
    );
    line.rotation.x = -Math.PI / 2;
    line.name = '__orbitLine';
    group.add(line);
    orbitLines.push(line);

    // ── Mặt Trăng ──
    if (d.name === 'Trái Đất') {
      const moonOrbit = new THREE.Group();
      moonOrbit.name = 'orbit_Mặt Trăng';
      const moonGeo = new THREE.SphereGeometry(0.3, 32, 24);
      const moonMat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0.0 });
      const moonFallback = createProceduralTex(0x8a8a8a, 0xcfcfcf, 0x4a4a4a, 7);
      loadPlanetTexture(moonMat, MOON_TEXTURE_URL, moonFallback);

      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.name = 'Mặt Trăng';
      moonMesh.position.set(2.5, 0, 0);
      moonMesh.castShadow = true;
      moonMesh.receiveShadow = true;
      moonOrbit.add(moonMesh);
      mesh.add(moonOrbit);
      planets.push({
        mesh: moonMesh, data: { speed: 2.4, selfSpin: 1.0 },
        orbitGroup: moonOrbit, index: -1,
      });
    }

    // ── Vành đai Sao Thổ ──
    if (d.name === 'Sao Thổ') {
      const ringGeo = new THREE.TorusGeometry(5.2, 0.25, 8, 120);
      const ringMat = new THREE.MeshStandardMaterial({
        map: createProceduralTex(0xd7c08d, 0x9b8156, 0xf5e4b0, 11),
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.name = 'Vành đai Sao Thổ';
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = Math.PI * 0.12;
      ring.castShadow = true;
      ring.receiveShadow = true;
      mesh.add(ring);
    }
  });

  // ── Vành thiên thạch ──
  const asteroidBelt = new THREE.Group();
  asteroidBelt.name = '__asteroidBelt';
  const asteroidGeo = new THREE.SphereGeometry(1, 6, 4);
  const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
  const asteroidMat = new THREE.MeshStandardMaterial({
    color: 0x7a6a55, roughness: 0.85, metalness: 0.05,
  });

  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 41 + Math.random() * 4;
    const size = 0.08 + Math.random() * 0.18;
    const geo = i % 3 === 0 ? cubeGeo : asteroidGeo;
    const rock = new THREE.Mesh(geo, asteroidMat);
    rock.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 1.4, Math.sin(angle) * r);
    rock.rotation.set(Math.random() * 4, Math.random() * 4, Math.random() * 4);
    rock.scale.setScalar(size);
    rock.scale.y *= 0.7 + Math.random();
    rock.castShadow = true;
    asteroidBelt.add(rock);
  }
  group.add(asteroidBelt);

  // ====================================================================
  // UPDATE
  // ====================================================================

  let selectedMesh = null;
  let frozenOrbitGroup = null; // dừng quỹ đạo khi user đang Affine

  function setSelectedMesh(mesh) { selectedMesh = mesh; }

  /** Dừng xoay quỹ đạo của hành tinh đang chỉnh Affine để thấy rõ tịnh tiến/quay/tỉ lệ */
  function setManualControl(mesh) {
    frozenOrbitGroup = null;
    if (!mesh) return;
    const entry = planets.find((p) => p.mesh === mesh);
    if (entry?.orbitGroup) frozenOrbitGroup = entry.orbitGroup;
  }

  function update(elapsed, speed) {
    timeUniform.value = elapsed;

    const gs = 7.5 * (1.0 + Math.sin(elapsed * 2.0) * 0.025);
    sunGlow.scale.setScalar(gs);

    PLANET_DATA.forEach((d, i) => {
      if (orbitGroups[i] === frozenOrbitGroup) return;
      orbitGroups[i].rotation.y = d.startAngle + elapsed * d.speed * 0.15;
    });

    planets.forEach((p) => {
      if (p.mesh === selectedMesh) return;
      if (p.mesh.name === 'Mặt Trăng') {
        p.orbitGroup.rotation.y = elapsed * 1.2;
      }
      p.mesh.rotation.y = elapsed * (p.data.selfSpin || 0.5) * 0.3;
    });

    asteroidBelt.rotation.y = elapsed * 0.08;
  }

  function getPlanetWorldPos(index) {
    const p = planets.find((pl) => pl.index === index);
    if (!p) return new THREE.Vector3();
    const pos = new THREE.Vector3();
    p.mesh.getWorldPosition(pos);
    return pos;
  }

  function toggleOrbits(visible) {
    orbitLines.forEach((l) => { l.visible = visible; });
  }

  let labelsVisible = true;

  /**
   * Bật/tắt label: dùng CSS2DObject.visible (CSS2DRenderer tôn trọng cờ này).
   * Chỉ set element.style.display là không đủ — renderer reset mỗi frame.
   */
  function toggleLabels(visible) {
    labelsVisible = visible;
    planetLabels.forEach((label) => {
      label.visible = visible;
      if (label.element) {
        label.element.style.display = visible ? '' : 'none';
        label.element.style.visibility = visible ? 'visible' : 'hidden';
        label.element.style.pointerEvents = 'none';
      }
    });
  }

  function getLabelsVisible() {
    return labelsVisible;
  }

  return {
    group, planets, orbitGroups, sun, sunGlow, sunLight, planetLabels,
    update, getPlanetWorldPos, toggleOrbits, toggleLabels, getLabelsVisible,
    setSelectedMesh, setManualControl,
    PLANET_DATA,
  };
}
