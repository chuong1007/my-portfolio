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
