# Textures hành tinh (Real 2K/4K UV Mapping)

Thư mục này chứa ảnh texture thật cho từng hành tinh.

## Cách dùng

`SolarSystem.js` dùng `THREE.TextureLoader` để nạp texture theo URL khai báo
trong `PLANET_DATA` (trường `textureUrl`). Nếu URL lỗi (không có mạng hoặc CORS),
code sẽ **tự động fallback** sang procedural canvas texture nên scene không bao giờ vỡ.

## Muốn dùng ảnh tải về (offline)

1. Tải ảnh equirectangular (tỉ lệ 2:1) cho từng hành tinh, ví dụ từ
   [Solar System Scope](https://www.solarsystemscope.com/textures/) (miễn phí, CC).
2. Đặt vào thư mục này với tên gợi ý:

```
mercury.jpg
venus.jpg
earth.jpg
mars.jpg
jupiter.jpg
saturn.jpg
saturn_ring.png
uranus.jpg
neptune.jpg
moon.jpg
```

3. Mở `src/objects/SolarSystem.js`, đổi `textureUrl` của hành tinh tương ứng sang
   đường dẫn cục bộ, ví dụ:

```js
textureUrl: new URL('../assets/textures/earth.jpg', import.meta.url).href
```

Vite sẽ tự bundle ảnh khi build.
