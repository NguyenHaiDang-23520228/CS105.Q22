<p align="center">
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin" style="border: none;">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="Trường Đại học Công nghệ Thông tin | University of Information Technology">
  </a>
</p>

<h1 align="center"><b>Computer Graphics</b></h1>

## COURSE INTRODUCTION

- **Course Title:** Computer Graphics
- **Course Code:** CS105
- **Class Code:** CS105.Q22
- **Academic Year:** Semester 3 (2026–2027)
- **Instructor:** Cáp Phạm Đình Thăng

## Team Members

- [Nguyễn Hải Đăng - 23520228]
- [Nguyễn Bi Anh - 23520055]
- [Trần Hoài Minh - 23520955]

## Solar System & Space Travel Simulation

Mô phỏng Hệ Mặt Trời 3D tương tác xây dựng bằng WebGL và Three.js, tập trung vào Scene Graph, custom GLSL shader, chiếu sáng và bóng đổ thời gian thực.

### ✨ Features

- 🪐 **Scene Graph & Orbital Mechanics**: Hệ phân cấp Sun → Planets → Moon; hành tinh quay quanh Mặt Trời và tự quay bằng các phép biến đổi Affine.
- ☀️ **Custom GLSL Shaders**: Mặt Trời (flame + Fresnel glow), nebula sky sphere, và hiệu ứng khí quyển (atmospheric glow) cho Trái Đất & Sao Kim.
- 💡 **Advanced Lighting**: PointLight tại tâm Mặt Trời + AmbientLight + DirectionalLight, bật/tắt độc lập qua UI checkbox.
- 🌑 **Shadow Mapping**: PCFSoftShadowMap với shadow bias khử shadow acne; bật/tắt nhanh bằng phím `S`.
- 🖼️ **Texture Mapping (UV)**: Texture hành tinh 2K thật (sRGB) kèm fallback procedural canvas texture; hỗ trợ **upload texture runtime** cho vật thể đang chọn.
- 🏷️ **CSS2D Labels**: Tên hành tinh hiển thị bám theo vật thể, bật/tắt bằng phím `L`.
- 🎮 **Interactive Affine Transforms**: Click chọn hành tinh (Raycaster) → Tịnh tiến / Quay / Tỉ lệ bằng D-pad trên panel hoặc phím mũi tên.
- 🎥 **Orbit Camera**: Camera quỹ đạo tự viết (tọa độ cầu, lerp mượt), focus theo dõi từng hành tinh bằng phím `1`–`8`, toàn cảnh phím `0`.
- ✂️ **Clipping Planes**: Điều chỉnh Near/Far từng bước bằng phím `[` `]` để minh họa view frustum.

### Tech Stack

**Graphics Engine:**
- WebGL 2.0
- Three.js (Core Library)
- GLSL (Custom Shader Language)

**Tools & Assets:**
- JavaScript (ES6+ Modules)
- Vite (dev server + build)
- High-resolution planetary textures (2K)

## Getting Started

Yêu cầu: **Node.js ≥ 18** và kết nối Internet (texture/font tải từ URL).

```bash
# 1. Cài dependency
npm install

# 2. Chạy chế độ phát triển (tự mở trình duyệt)
npm run dev

# 3. Build bản production (ra thư mục dist/)
npm run build

# 4. Xem thử bản build
npm run preview
```

## Controls

| Nhóm | Phím / Chuột | Chức năng |
|------|--------------|-----------|
| Camera | Chuột trái / Cuộn / Chuột phải | Xoay / Zoom / Pan |
| Camera | `1`–`8`, `0` | Focus hành tinh / Toàn cảnh |
| Hiển thị | `Space`, `O`, `S`, `L` | Dừng-chạy / Quỹ đạo / Shadow / Label |
| Tốc độ | `+` `-` hoặc slider | Tốc độ quỹ đạo (0–4x) |
| Clipping | `[` `]` `\` | Thu hẹp / Mở rộng / Reset Near-Far |
| Affine | Click hành tinh → mode → `↑↓←→` | Tịnh tiến / Quay / Tỉ lệ; `ESC` bỏ chọn |

## Project Structure

```
CS105.Q22/
├── index.html              # HUD, control panel, entry point
├── src/
│   ├── main.js             # Khởi tạo app, render loop, keyboard
│   ├── core/               # Scene, Camera (orbit + clipping), Renderer, Interaction
│   ├── objects/            # SolarSystem (scene graph), Environment (sky, stars)
│   ├── shaders/            # GLSL: sun, sky nebula, atmosphere
│   └── assets/textures/    # Texture cục bộ (tùy chọn, xem README bên trong)
├── Release/                # Bản build (dist) + readme.txt hướng dẫn chạy
└── Doc/                    # Báo cáo đồ án (.docx)
```

## License

This project is part of the CS105 course at University of Information Technology.

---

**Note**: Đây là đồ án thực hành cho môn CS105 - Đồ họa máy tính tại UIT.
