# Tuấn Anh Daily Dashboard 3.2

## Điểm mới
- Nút `‹` Back, `›` Forward và `⌂` Home.
- Điều hướng giữa tất cả các trang bằng hash/history, dùng được nút Back/Forward của trình duyệt.
- Mobile có thanh điều hướng dưới màn hình.
- Timeline theo thời gian nhà trường năm học 2026–2027.
- Tự nhận diện hoạt động đang diễn ra khi mở đúng ngày hiện tại.
- TKB 7A5 + lịch Trung tâm.
- Checklist, điểm, streak, phần thưởng, lịch tháng, Focus 25 phút.
- Export/Import JSON.
- PWA + Service Worker.

## Cài GitHub Pages
Đưa `index.html`, `manifest.json`, `sw.js` và thư mục `icons` vào thư mục gốc repository.
Trong Settings → Pages chọn Deploy from a branch → main → /(root).

## Lưu ý
Dữ liệu ứng dụng hiện lưu bằng LocalStorage trên từng thiết bị. Chưa đồng bộ giữa các thiết bị.
