# 📅 Kế hoạch triển khai Hệ thống Backup Thông minh (Incremental Backup)

Hệ thống backup hiện tại đang thực hiện backup toàn bộ dữ liệu (Full Backup) mỗi lần chạy, gây lãng phí tài nguyên và thời gian khi dữ liệu lớn dần. Kế hoạch này sẽ chuyển sang cơ chế **Incremental Backup** tự động.

## 🎯 Mục tiêu
1.  **Chỉ backup dữ liệu mới hoặc đã thay đổi**: Dựa trên timestamp `updated_at`.
2.  **Tối ưu dung lượng**: Bản ghi đã backup sẽ không bị tải lại trong các lần sau (trừ khi có thay đổi).
3.  **Chính xác tuyệt đối**: Không bỏ sót dữ liệu mới/cập nhật.
4.  **Dễ dàng khôi phục**: Kết hợp bản full ban đầu và các bản incremental để có trạng thái mới nhất.

## 🏗️ Kiến trúc hệ thống
1.  **Metadata Tracker**: Một tệp `backups/metadata.json` lưu trữ mốc thời gian (high-water mark) của lần backup cuối cùng cho từng bảng.
2.  **Incremental Logic**: 
    - Truy vấn dữ liệu có `updated_at > last_backup_time`.
    - Đối với các bảng không có `updated_at`, thực hiện so sánh ID hoặc thêm cột `updated_at`.
3.  **Storage Layout**:
    - `backups/base_[timestamp]/`: Bản full backup gần nhất (nếu chưa có).
    - `backups/inc_[timestamp]/`: Các bản incremental lưu các thay đổi.
    - `backups/metadata.json`: Lưu trạng thái đồng bộ hiện tại.

## 📋 Danh sách công việc (Checklist)

### 1. Phân tích & Chuẩn bị
- [x] Kiểm tra lại schema của tất cả các bảng.
- [ ] Bổ sung cột `updated_at` cho các bảng còn thiếu (`project_images`).
- [ ] Tạo file `metadata.json` mẫu.

### 2. Phát triển script `incremental_backup.js`
- [ ] Đọc metadata hiện tại.
- [ ] Thực hiện fetch dữ liệu từ Supabase với điều kiện lọc (filtering).
- [ ] Lưu dữ liệu vào thư mục `inc_[timestamp]`.
- [ ] Cập nhật lại mốc thời gian trong `metadata.json`.

### 3. Phát triển script `restore_incremental.js`
- [ ] Ghép nối dữ liệu từ bản gốc và các bản tăng dần (incremental) để tái cấu trúc database.

### 4. Kiểm thử & Tự động hóa
- [ ] Kiểm tra tính toàn vẹn của dữ liệu sau khi backup incremental.
- [ ] Thiết lập alias hoặc lệnh npm để chạy dễ dàng.

## 🛠️ Công nghệ sử dụng
- **Node.js**: Script backup chính.
- **Supabase JS Client**: Tương tác với cơ sở dữ liệu.
- **FS (File System)**: Quản lý tệp cục bộ.

---
*Kế hoạch được lập bởi Antigravity Orchestrator.*
