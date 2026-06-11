===========================================================
ĐỒ ÁN MÔN HỌC: ĐỒ HỌA MÁY TÍNH (CS105)
Đề tài: Mô phỏng Hệ Mặt Trời & Du hành vũ trụ
Lớp: CS105.Q22
===========================================================

1. THÀNH VIÊN NHÓM:
+ Nguyễn Bi Anh   - 23520055
+ Nguyễn Hải Đăng - 23520228
+ Trần Hoài Minh  - 23520955

2. YÊU CẦU MÔI TRƯỜNG:
- Node.js phiên bản 18 trở lên (khuyến nghị 20+).
  Kiểm tra bằng lệnh:  node -v  và  npm -v
- Trình duyệt: Google Chrome, Microsoft Edge hoặc Firefox (bản mới).
- Kết nối Internet (texture hành tinh và font được tải từ URL).

3. HƯỚNG DẪN BUILD & CHẠY TỪ MÃ NGUỒN:
- Bước 1: Mở Terminal (macOS/Linux) hoặc CMD/PowerShell (Windows)
          tại THƯ MỤC GỐC của đồ án (nơi có file package.json).
- Bước 2: Cài thư viện:
          npm install
- Bước 3: Chạy chương trình (chế độ phát triển):
          npm run dev
- Bước 4: Trình duyệt sẽ tự mở. Nếu không, truy cập địa chỉ
          hiển thị trên terminal (thường là http://localhost:5173).

* Build bản production (tùy chọn):
          npm run build      -> kết quả nằm trong thư mục dist/
          npm run preview    -> chạy thử bản đã build

* LƯU Ý: KHÔNG mở file index.html bằng cách double-click
  (giao thức file:// không chạy được ES Modules).
  Luôn chạy qua npm run dev hoặc npm run preview.

4. HƯỚNG DẪN ĐIỀU KHIỂN:

a) Camera (Orbit Camera):
- Giữ CHUỘT TRÁI và kéo: xoay góc nhìn quanh mục tiêu.
- CON LĂN chuột: phóng to / thu nhỏ.
- Giữ CHUỘT PHẢI và kéo: dịch chuyển (pan).
- Phím 1 đến 8: focus và bay theo từng hành tinh
  (1-Sao Thủy, 2-Sao Kim, 3-Trái Đất, 4-Sao Hỏa,
   5-Sao Mộc, 6-Sao Thổ, 7-Thiên Vương, 8-Hải Vương).
- Phím 0: trở về góc nhìn toàn cảnh.

b) Hiển thị:
- Space: tạm dừng / tiếp tục animation.
- O: bật / tắt đường quỹ đạo.
- S: bật / tắt bóng đổ (Shadow Mapping).
- L: bật / tắt nhãn tên hành tinh.
- Phím + / - hoặc thanh trượt "Speed Control": tốc độ quỹ đạo.

c) Clipping Planes (Near / Far):
- Phím [ : thu hẹp tầm nhìn (giảm Far từng bước,
           hành tinh ở xa dần biến mất).
- Phím ] : mở rộng tầm nhìn trở lại.
- Phím \ : reset về mặc định.
- Shift + [ / Shift + ] : điều chỉnh Near
  (thấy rõ nhất khi đang focus gần một hành tinh).

d) Biến đổi Affine (panel bên phải màn hình):
- Bước 1: Click chuột trái vào một hành tinh (click, không kéo).
          Hành tinh được chọn sẽ sáng lên và có khung bao quanh.
- Bước 2: Chọn chế độ: Tịnh tiến (Translate), Quay (Rotate)
          hoặc Tỉ lệ (Scale).
- Bước 3: Bấm các nút mũi tên trên panel hoặc dùng phím
          mũi tên trên bàn phím để biến đổi.
- ESC hoặc click vào nền trống: bỏ chọn.

e) Ánh sáng & Texture:
- 3 checkbox "Ánh sáng": bật / tắt Sun Light (Point),
  Ambient Light, Directional Light độc lập.
- "Upload Texture": chọn một hành tinh trước, sau đó chọn
  file ảnh từ máy để thay texture của hành tinh đó.

5. CẤU TRÚC THƯ MỤC NỘP BÀI:
- Thư mục gốc : mã nguồn (src/, index.html, package.json, ...).
- Release     : file hướng dẫn này (và bản build dist nếu có).
- Doc         : file báo cáo đồ án chi tiết (.docx).

===========================================================
