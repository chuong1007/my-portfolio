# Changelog

Tất cả các thay đổi đáng chú ý của dự án sẽ được ghi lại tại đây.

---

## [2025-09-03] — Gallery Download ZIP & Bugfixes

### ✨ Tính năng mới

- **Tải ảnh dự án về dạng ZIP** (`ProjectForm.tsx`)
  - Nút **"Tải ảnh ↓"** trong khu vực gallery của trang chỉnh sửa dự án admin
  - **2 chế độ tải**:
    - **Tải về tất cả**: Đóng gói toàn bộ ảnh gallery thành 1 file `.zip`
    - **Chọn để tải về**: Vào chế độ chọn → click từng ảnh → tải các ảnh đã chọn
  - Sử dụng thư viện `jszip` (dynamic import, chỉ load khi cần)
  - Nén `STORE` (không DEFLATE) — ảnh đã nén sẵn nên tốc độ nhanh gấp 10-20x
  - Tải theo batch 10 ảnh/đợt, tránh nghẽn mạng
  - Hiển thị tiến trình real-time: `Tải 12/70...` → `Nén 85%...`
  - UI overlay xanh trên ảnh khi ở chế độ chọn, có checkbox tích/bỏ
  - Nút xác nhận `"Tải X ảnh"` chỉ hiện khi đã chọn ≥ 1 ảnh
  - Banner hướng dẫn: *"Nhấp vào ảnh để chọn ảnh cần tải về"*

### 🐛 Sửa lỗi

- **Turbopack Crash** (`package.json`)
  - Lỗi: `FATAL: An unexpected Turbopack error occurred` — PostCSS worker crash trên macOS
  - Fix: Chuyển script `dev` sang `next dev --webpack`

- **Lỗi Analytics Tracking** (`src/app/api/track/route.ts`)
  - Lỗi: `invalid input syntax for type uuid: "v-wqof0syogkt-..."` — ép chuỗi text vào cột UUID
  - Fix: Upsert theo `visitor_hash` (UNIQUE TEXT) thay vì ép vào cột `id` (UUID)

- **Lỗi Analytics Query** (`src/app/api/analytics/route.ts`)
  - Lỗi: Query `IN ('__none__')` khi visitorIds rỗng → crash vì `__none__` không phải UUID
  - Fix: Skip query khi mảng rỗng

- **React Hydration Mismatch** (`layout.tsx`, `admin/layout.tsx`, `GlobalPreviewWrapper.tsx`)
  - Lỗi: Extension Bitdefender chèn `bis_skin_checked="1"` vào DOM → React phát hiện khác biệt
  - Fix 1: Thêm `suppressHydrationWarning` vào `<html>`, `<body>`, và các div container
  - Fix 2: Inline script xóa sạch thuộc tính `bis_skin_checked` trước khi React hydrate

### 📦 Dependencies

- Thêm: `jszip` — Tạo file ZIP phía client-side

### 📁 Files thay đổi

| File | Loại | Mô tả |
|------|------|-------|
| `package.json` | Modified | Dev script → webpack, thêm jszip |
| `package-lock.json` | Modified | Lock file cho jszip |
| `src/components/admin/ProjectForm.tsx` | Modified | Thêm nút tải ảnh ZIP + UI chọn |
| `src/app/api/track/route.ts` | Modified | Fix upsert visitor_hash |
| `src/app/api/analytics/route.ts` | Modified | Fix query visitorIds rỗng |
| `src/app/layout.tsx` | Modified | Script xóa bis_skin_checked + suppressHydrationWarning |
| `src/app/admin/layout.tsx` | Modified | suppressHydrationWarning cho spinner |
| `src/app/GlobalPreviewWrapper.tsx` | Modified | suppressHydrationWarning cho container |

## [2026-09-18] — Smooth Scroll Snap & UI Refinements

### ✨ Cải tiến & Tính năng mới

- **Vùng Hút Thông Minh (Smart Snap Zone)** (`SmoothScrollSnap.tsx`)
  - Viết lại toàn bộ logic cuộn và hút màn hình (Snap) bằng `requestAnimationFrame`.
  - Tự động tính toán khoảng cách lý tưởng (Header + Breathing room) tùy theo padding của từng Section.
  - Hủy ngay hiệu ứng hút nếu người dùng chủ động thao tác cuộn (ưu tiên UX).
  - Khắc phục lỗi giật ngược màn hình khi đọc giữa Section dài.

- **Refactor Admin Dashboard** (`src/app/admin/page.tsx`)
  - Tách trang quản trị khổng lồ thành các tab component riêng biệt (`ProjectsTab`, `BlogsTab`, `AnalyticsTab`, `SettingsTab`) để dễ quản lý.
  
- **Dark/Light Mode Setup**
  - Đồng bộ thiết lập CSS variables cho Light/Dark mode trên các component cốt lõi (`About`, `Contact`, `GlobalPreviewWrapper`).

### 🐛 Sửa lỗi

- **Lệch khoảng cách Admin & Khách (Public)** (`Gallery.tsx`)
  - Khắc phục lỗi component Gallery bị mất class `.gallery-container` ở chế độ trang chủ (public mode), gây ra lỗi mất khoảng cách (padding).
  - Đảm bảo Admin và Public giống hệt nhau 100%.

- **Viền & Bóng của Avatar Emoji** (`About.tsx`)
  - Tự động loại bỏ khung tròn (border, bg, shadow) khi người dùng chọn hình ảnh đại diện là icon Emoji (`avatar-emoji.svg`), giúp Emoji hiển thị tự nhiên.

### 📁 Files thay đổi

| File | Loại | Mô tả |
|------|------|-------|
| `src/components/SmoothScrollSnap.tsx` | New | Logic cuộn Snap mới |
| `src/app/admin/page.tsx` | Modified | Chia tab |
| `src/app/admin/_tabs/*.tsx` | New | Các tab quản trị |
| `src/components/sections/Gallery.tsx` | Modified | Fix lỗi padding |
| `src/components/sections/About.tsx` | Modified | Xóa viền emoji, thêm CSS variables |
| `src/components/sections/Contact.tsx` | Modified | CSS variables |

## [2026-09-20] - AI Chatbot & UX Enhancement
### Added
- Tính năng bật/tắt hiển thị Chatbot AI Public từ Admin Dashboard, đồng bộ vào `site_content (global_settings)`.
- Fallback message hiển thị thêm 3 câu hỏi FAQ gợi ý khi AI không tìm thấy câu trả lời.
- Cải thiện UX nhập Keywords trong form Admin thành dạng Tag Input cao cấp, tự động gán nhãn và hỗ trợ phím tắt (Enter, Comma, Backspace).

### Fixed
- Lỗi tìm kiếm Fuse.js không hoạt động với array, fix bug "alo" bị điều hướng sai câu trả lời.
- Lỗi component `m.div` tàng hình do thiếu bọc `<LazyMotion>`.
- Lỗi giao diện Toast Success bị đè, thiếu hiển thị trạng thái và bị giới hạn layout fixed.
- Text và Icon (Zoom Kính lúp) trên Hover Overlay bị đổi thành màu đen khi ở giao diện Light Mode. Sửa thành cứng `text-white`.
- Đổi cách xưng hô từ "Anh/chị" thành "Anh/ Chị" trên toàn hệ thống (dữ liệu mẫu & tin nhắn mặc định).

### Changed
- Dọn dẹp các tệp mã nguồn python/js dư thừa trong dự án để repo gọn gàng.
