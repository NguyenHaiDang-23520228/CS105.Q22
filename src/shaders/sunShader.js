/**
 * Sun Shader — hiệu ứng ngọn lửa Mặt Trời (GLSL tự viết).
 *
 * Vertex: biến dạng bề mặt theo sin(y) tạo nhấp nhô.
 * Fragment: pha trộn 3 tông cam-vàng-đỏ theo sin(UV) + rim Fresnel.
 *
 * Three.js ShaderMaterial tự inject:
 *   projectionMatrix, modelViewMatrix, modelMatrix, normalMatrix,
 *   cameraPosition, position, normal, uv
 */

export const sunVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  uniform float uTime;

  void main() {
    vUv = uv;
    vNormalW = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;

    // Vertex displacement: bề mặt nhấp nhô theo thời gian
    vec3 displaced = position + normal * sin(position.y * 8.0 + uTime * 3.0) * 0.05;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const sunFragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  uniform float uTime;

  void main() {
    // Vân lửa = tích 2 hàm sin trên UV → tạo pattern cháy
    float flame = 0.5 + 0.5 * sin(vUv.y * 28.0 + uTime * 2.5)
                            * sin(vUv.x * 18.0 - uTime);

    vec3 coreColor  = vec3(1.0, 0.85, 0.20);
    vec3 flameColor = vec3(1.0, 0.35, 0.02);
    vec3 edgeColor  = vec3(1.0, 0.12, 0.02);

    vec3 color = mix(flameColor, coreColor, flame);

    // Rim glow: xấp xỉ Fresnel — sáng rìa cầu
    vec3 V = normalize(cameraPosition - vPositionW);
    float rim = pow(1.0 - max(dot(normalize(vNormalW), V), 0.0), 2.0);
    color += edgeColor * rim * 0.4;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Sun Glow — lớp halo bán trong suốt bọc ngoài Mặt Trời */
export const sunGlowVertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vNormalW = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const sunGlowFragmentShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  uniform float uTime;

  void main() {
    float pulse = 0.5 + 0.5 * sin(uTime * 1.5);

    // Fresnel mạnh → chỉ sáng ở rìa, trong suốt ở giữa
    vec3 V = normalize(cameraPosition - vPositionW);
    float fresnel = pow(1.0 - max(dot(normalize(vNormalW), V), 0.0), 3.0);

    vec3 color = mix(vec3(1.0, 0.4, 0.05), vec3(1.0, 0.7, 0.2), fresnel);
    float alpha = fresnel * (0.25 + pulse * 0.1);

    gl_FragColor = vec4(color, alpha);
  }
`;
