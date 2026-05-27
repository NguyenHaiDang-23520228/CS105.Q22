/**
 * Sky / Nebula Shader — bầu trời tinh vân procedural (GLSL tự viết).
 *
 * Kỹ thuật: Fractional Brownian Motion (fBm) trên 3D noise
 *   → tạo mây tinh vân + sao lấp lánh hoàn toàn bằng toán.
 * Không cần texture ảnh.
 *
 * Tham khảo: Inigo Quilez noise functions.
 */

export const skyVertexShader = /* glsl */ `
  varying vec3 vDir;

  void main() {
    // Hướng nhìn trong world space — dùng làm tọa độ sample noise
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vDir = normalize(worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const skyFragmentShader = /* glsl */ `
  varying vec3 vDir;
  uniform float uTime;

  // Hash function: ánh xạ vec3 → số giả ngẫu nhiên [0,1]
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  // Value noise 3D: nội suy trilinear giữa 8 đỉnh lưới
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    // Smoothstep Hermite: f = 3f² - 2f³ (mượt hơn linear)
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x),
        f.y
      ),
      mix(
        mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x),
        f.y
      ),
      f.z
    );
  }

  // Fractional Brownian Motion: cộng 6 tầng noise với tần số tăng dần,
  // biên độ giảm dần → tạo chi tiết fractal đa tầng.
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(p);
      p *= 2.0;          // tăng tần số (octave)
      amplitude *= 0.55;  // giảm biên độ
    }
    return value;
  }

  void main() {
    vec3 dir = normalize(vDir);

    // Noise chậm trôi theo thời gian → tinh vân chuyển động
    float n = fbm(dir * 3.0 + vec3(uTime * 0.01, 0.0, -uTime * 0.008));

    // Sao lấp lánh: noise tần số cao, chỉ giữ đỉnh > 0.985
    float stars = step(0.985, noise(dir * 250.0));

    // Tinh vân: gradient xanh đen → tím đen, sáng dần theo noise
    vec3 nebula = mix(
      vec3(0.02, 0.03, 0.10),
      vec3(0.14, 0.08, 0.32),
      smoothstep(0.35, 0.85, n)
    );
    // Vùng sáng xanh dương ở đỉnh noise
    nebula += vec3(0.1, 0.35, 0.6) * smoothstep(0.65, 1.0, n) * 0.45;

    // Cộng sao trắng
    nebula += vec3(1.0) * stars;

    gl_FragColor = vec4(nebula, 1.0);
  }
`;
