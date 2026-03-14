# Kế hoạch: Đồng bộ Header và Quản lý Bài viết

## Mục tiêu
1. Đảm bảo thanh điều hướng (Header Menu) hiển thị đồng nhất trên tất cả các trang (Trang chủ, Chi tiết Dự án, Chi tiết Bài viết).
2. Phát triển / Tối ưu hóa tính năng chỉnh sửa và tạo bài viết mới theo đúng kỳ vọng của người dùng.

## Phân tích hiện trạng
1. **Menu Header**: 
   - Hiện tại, file `src/components/Header.tsx` chỉ đang được gọi render tại trang chủ `src/app/page.tsx`. Do đó, khi sang các trang con như Project hay Blog Detail, header bị mất.
   - **Giải pháp**: Đưa `Header` component vào thẳng `src/app/layout.tsx` để bảo đảm nó phủ khắp mọi nơi trong app. Sẽ cần test khoảng cách (margin/padding) tại các trang con đảm bảo layout không bị lỗi hụt khi có Header.

2. **Tạo / Chỉnh sửa bài viết mới**:
   - Hiện hệ thống `/admin` của chúng ta **đã có tính năng tạo và sửa bài viết**. Tuy nhiên, tôi cho rằng luồng (flow) hiện tại có thể chưa đủ tiện lợi đối với bạn.
   - **Thay đổi dự kiến**: 
     - **Tính năng 1**: Tại trang danh sách Blog ngoài trang chủ, nếu nhận diện được bạn đang mở hệ thống ở môi trường cục bộ/admin, sẽ có một nút bấm nhanh để "Thêm bài viết mới".
     - **Tính năng 2**: Bên trong mỗi bài viết cá nhân `/blog/[id]`, ta sẽ bổ sung một nút nổi "Sửa bài viết này" để bạn có thể truy cập ngay vào Form chỉnh sửa mà không cần mò mẫm trong `/admin`. Nút này sẽ dẫn trực tiếp vào trang form `admin?edit=[blog_id]`.

## Các bước triển khai (Task Breakdown)

### Giai đoạn 1: Đồng bộ hóa Header
- Refactor cấu trúc Layout:
  - Loại bỏ `Header` khỏi `src/app/page.tsx`.
  - Khởi tạo `Header` trong `src/app/layout.tsx` (RootLayout) và bọc cùng với thẻ `<main>`.
- Kiểm tra lại các route:
  - `/` (Trang chủ)
  - `/project/[id]` (Dự án)
  - `/blog/[id]` (Bài viết)
  - Đảm bảo hiển thị z-index chuẩn, nút Let's Connect và Logo không bị rối khi scroll.

### Giai đoạn 2: Tối ưu tính năng Thêm / Sửa bài viết (UX)
- Chỉnh sửa `src/components/BlogDetail.tsx` để thêm floating button "Chỉnh sửa bài viết" giúp điều hướng nhanh về Admin kèm thông số ID để load tự động Form.
- Bổ sung luồng "Tạo bài viết" dưới chân trang Blog List.

---

## 🛑 Socratic Gate (Câu hỏi xác nhận)

Trước khi tôi bắt đầu viết code (gọi lệnh `/create`), sếp vui lòng xác nhận giúp em:

1. **Về Header**: Khi Header xuất hiện ở trang chi tiết Bài viết/Dự án, sếp muốn nó có thiết kế nền đen cố định hay vẫn trong suốt và blur effect giống màn hình trang chủ ạ?
2. **Về Bài viết**: Hiện tại hệ thống Admin `/admin` đã làm xong tính năng Tạo/Sửa. Việc sếp muốn thêm mới là làm luồng cho nó *tiện lợi hơn* từ ngoài màn hình trang chủ như em đề cập ở trên, hay sếp đang gặp lỗi ở chức năng Tạo/Sửa có sẵn vậy ạ?
