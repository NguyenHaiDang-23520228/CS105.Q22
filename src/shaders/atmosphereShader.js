/**
 * Atmosphere Shader — hiệu ứng bầu khí quyển phát sáng (Fresnel rim glow).
 *
 * Ý tưởng: bọc hành tinh bằng một quả cầu lớn hơn ~1.05 lần.
 *   - Phần nhìn thẳng (tâm) → dot(N, V) ≈ 1 → Fresnel ≈ 0 → trong suốt
 *   - Phần nhìn xiên (viền) → dot(N, V) ≈ 0 → Fresnel ≈ 1 → sáng rực
 *
 * Fresnel = pow(1 - max(dot(N, V), 0), power)
 *
 * Dùng additive blending để ánh sáng cộng dồn, tạo quầng sáng mềm.
 */

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    // Normal và vị trí trong world space để tính góc nhìn ở fragment
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  uniform vec3 uColor;       // màu khí quyển (xanh cho Trái Đất, cam cho Sao Kim)
  uniform float uPower;      // độ "gắt" của viền sáng
  uniform float uIntensity;  // độ sáng tổng

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPositionW);

    // Fresnel: viền (grazing angle) sáng, tâm trong suốt
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), uPower);

    float alpha = clamp(fresnel * uIntensity, 0.0, 1.0);
    gl_FragColor = vec4(uColor * fresnel, alpha);
  }
`;
