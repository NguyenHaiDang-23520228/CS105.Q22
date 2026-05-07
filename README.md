<p align="center">
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin" style="border: none;">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="Trường Đại học Công nghệ Thông tin | University of Information Technology">
  </a>
</p>

<h1 align="center"><b>Computer Graphics</b></h1>
# 🌌 CS105.Q22 - Mô phỏng Hệ mặt trời & Du hành vũ trụ

---

## 📝 Giới thiệu đề tài
Đồ án tập trung vào việc mô phỏng một hệ thống **Hệ mặt trời 3D tương tác**. [cite_start]Người dùng có thể khám phá các hành tinh, quan sát chuyển động quỹ đạo và trải nghiệm không gian thông qua hệ thống camera linh hoạt[cite: 53, 65].

## 🛠 Các chức năng kỹ thuật (Đáp ứng yêu cầu đồ án)
[cite_start]Dự án hiện thực hóa các kiến thức cốt lõi được yêu cầu[cite: 23, 24]:

* [cite_start]**Mô hình hóa hình học (Geometry):** * Vẽ các khối hình cơ bản như hình cầu (hành tinh)[cite: 27].
    * [cite_start]Tự tìm hiểu và vẽ thêm các hình dạng khác như vành đai Sao Thổ (Ring/Torus)[cite: 32].
* [cite_start]**Phép biến đổi Affine cơ sở:** Cài đặt các ma trận **Tịnh tiến** (quỹ đạo), **Quay** (tự thân) và **Tỉ lệ** (kích thước)[cite: 35, 37, 38, 39, 40].
* [cite_start]**Chiếu sáng & Bóng đổ (Lighting & Shadows):** * Triển khai mô hình chiếu sáng môi trường và nguồn sáng điểm đặt tại trung tâm Mặt trời[cite: 43, 45].
    * [cite_start]Áp dụng kỹ thuật **Shadow Mapping** để tạo hiệu ứng bóng đổ chân thực[cite: 44, 46].
* [cite_start]**Texture Mapping:** Sử dụng ảnh bitmap để mô phỏng bề mặt đặc trưng của từng hành tinh[cite: 47, 48].
* [cite_start]**Camera & Tương tác:** * Thực hiện chiếu phối cảnh với các tọa độ x, y, z linh hoạt[cite: 34].
    * [cite_start]Điều khiển camera di chuyển trong không gian bằng chuột và bàn phím[cite: 36].
* [cite_start]**Animation:** Các đối tượng tự di chuyển và biến đổi theo quỹ đạo định nghĩa sẵn[cite: 50, 52].

## 🚀 Công nghệ sử dụng
* **Ngôn ngữ:** JavaScript
* **Thư viện:** WebGL / Three.js
* **Shader:** GLSL (Custom Shaders cho hiệu ứng bề mặt và ánh sáng)

## 👥 Thành viên thực hiện (Nhóm 3 người)
1. **Nguyễn Hải Đăng** - Shader Specialist & Core Engine
2. **[Tên Thành Viên 2]** - Camera & Affine Logic
3. **[Tên Thành Viên 3]** - Assets & Documentation

## 📂 Cấu trúc thư mục nộp bài
[cite_start]Theo quy định của môn học, đồ án được tổ chức như sau[cite: 16]:
* [cite_start]`Source/`: Chứa mã nguồn và thư viện sử dụng[cite: 17].
* [cite_start]`Release/`: Chứa file thực thi `.html` và `readme.txt` hướng dẫn chạy[cite: 18, 19].
* [cite_start]`Doc/`: Chứa file `.doc` báo cáo chi tiết đồ án[cite: 20].

---
[cite_start]*Dự án được thực hiện phục vụ cho kỳ thi cuối kỳ môn Đồ họa máy tính[cite: 13].*
