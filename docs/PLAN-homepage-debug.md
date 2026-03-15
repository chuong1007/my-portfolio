# Kế hoạch thực thi (Plan)

**Context:** User báo cáo lỗi "Dữ liệu cấu hình trang chủ (Hero, About) trong Admin đã được bật (is_visible = true) và có lưu đầy đủ nội dung, nhưng ngoài trang chủ (src/app/page.tsx) lại không hiển thị." User yêu cầu: (1) Kiểm tra truy vấn fetch, (2) Sửa điều kiện ẩn/hiện render, (3) Tắt cache `force-dynamic`, (4) Bọc Optional Chaining.

---

## 🔴 Root Cause Analysis (Phân tích nguyên nhân gốc)

1. **Missing Components**: File `src/app/page.tsx` hiện tại **CHỈ** render `<PageRenderer pageSelector="home" />` và bỏ sót hoàn toàn các component cố định (Hardcoded Sections) như `<Hero />`, `<About />`, `<Contact />`.
2. **Client Component Static Cache**: `src/app/page.tsx` đang có `"use client"`. Nó được Next.js compiled một lần ở client side. Không có `force-dynamic` (vì Client Component không dùng được export configs) nên SSR không liên tục fetch dữ liệu mới nhất.
3. Các component Hero/About tự fetch nội dung nhưng không hề được gọi ở layout chính.

---

## 🛠️ Action Plan (Các bước sửa lỗi)

### Bước 1: Sửa file `src/app/page.tsx`
- Biến thành **Server Component** (Bỏ `"use client"`).
- Thêm cờ tắt cache: `export const dynamic = 'force-dynamic';`
- Fetch tập dữ liệu cấu hình: `{ id: 'hero' }, { id: 'about' }` từ bảng `site_content`.
- Thêm điều kiện Render chuẩn xác:
  ```tsx
  {heroVisibility?.isVisible && <Hero />}
  {aboutVisibility?.isVisible && <About />}
  ```

### Bước 2: Bọc Optional Chaining (An toàn Server)
- Kiểm tra biến `heroVisibility?.isVisible` thay vì `heroVisibility.isVisible` để không crash trang nếu DB trả `null`.

### Bước 3: Đảm bảo giao diện không lỗi
- Giữ lại `<PageRenderer pageSelector="home" />` ở cuối trang phòng khi vẫn có custom block nội dung từ Builder.

---

**Đã thực hiện xong lập kế hoạch theo Workflow `/plan`.** Chờ lệnh của User để tiến hành code.
