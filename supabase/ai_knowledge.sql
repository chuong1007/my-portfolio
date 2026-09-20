create table if not exists public.ai_knowledge (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null check (char_length(question) between 3 and 300),
  answer text not null check (char_length(answer) between 1 and 2000),
  keywords text[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_knowledge enable row level security;

-- Drop exist policies to ensure idempotent
drop policy if exists "public read active" on public.ai_knowledge;
drop policy if exists "admin all" on public.ai_knowledge;

-- Khách: Chỉ đọc dòng đang bật
create policy "public read active" on public.ai_knowledge
  for select using (is_active = true);

-- Admin: Toàn quyền (Dành cho tài khoản đã đăng nhập vào hệ thống)
create policy "admin all" on public.ai_knowledge
  for all to authenticated
  using (true)
  with check (true);

-- Trigger tự động cập nhật updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists ai_knowledge_updated_at on public.ai_knowledge;
create trigger ai_knowledge_updated_at
before update on public.ai_knowledge
for each row execute function public.set_updated_at();

-- Xoá dữ liệu cũ để nạp lại dữ liệu mới chuẩn hơn
TRUNCATE TABLE public.ai_knowledge;

-- Nạp lại dữ liệu xịn xò
insert into public.ai_knowledge (category, question, answer, keywords, sort_order)
values
('Giới thiệu', 'Giới thiệu một chút về Chương được không?', 'Chào anh/chị, em là AI của Trần Thanh Chương. Sếp em là một Graphic, Web UI & Packaging Designer với hơn 7 năm kinh nghiệm. Sếp em chuyên thiết kế xây dựng hình ảnh thương hiệu đa nền tảng, từ ấn phẩm truyền thông, bao bì sản phẩm cho đến giao diện Website.', ARRAY['chuong la ai', 'gioi thieu'], 1),
('Giới thiệu', 'Điểm khác biệt lớn nhất của Chương so với các Designer khác là gì?', 'Sếp em luôn cố gắng kết hợp giữa tính thẩm mỹ và tư duy chiến lược trong từng dự án. Sếp không chỉ tập trung vào thiết kế đẹp mắt mà còn nghiên cứu tâm lý thị giác của người dùng, với mục tiêu giúp tối ưu tỷ lệ chuyển đổi và mang lại giá trị thực tế cho sản phẩm.', ARRAY['the manh', 'diem khac biet'], 2),
('Liên hệ', 'Làm sao để liên lạc trực tiếp trao đổi dự án với Chương?', 'Anh/chị có thể liên hệ trực tiếp qua số Zalo 038 429 7019 nhé. Hoặc gửi thông tin chi tiết qua email chuong.thanh1007@gmail.com. Sếp em sẽ phản hồi sớm nhất có thể ạ!', ARRAY['lien he', 'zalo', 'sdt'], 3),
('Kỹ năng', 'Chương thường sử dụng những phần mềm nào?', 'Về đồ hoạ, sếp em chủ yếu sử dụng Photoshop và Illustrator. Về UI/UX, công cụ chính là Figma để đảm bảo bàn giao file hiệu quả cho đội ngũ lập trình. Ngoài ra, sếp cũng dùng Adobe Premiere và Capcut để dựng video cơ bản. Đặc biệt, sếp em còn linh hoạt ứng dụng các công cụ AI để hỗ trợ tìm kiếm ý tưởng và tối ưu hoá quy trình thiết kế.', ARRAY['ky nang', 'phan mem'], 4),
('Kỹ năng', 'Chương có bắt kịp công nghệ AI không?', 'Dạ có, sếp em luôn nỗ lực cập nhật các xu hướng mới và thường xuyên ứng dụng công cụ AI vào quy trình thiết kế, tạo video. Điều này giúp tối ưu thời gian làm việc mà vẫn đảm bảo được chất lượng sản phẩm.', ARRAY['ai', 'cong nghe ai'], 5),
('Kinh nghiệm', 'Kinh nghiệm làm việc thực tế của Chương thế nào?', 'Sếp em đã có hơn 7 năm kinh nghiệm làm việc. Từ tháng 2/2020 đến nay, sếp hoạt động độc lập (Freelancer) ở mảng Web UI, Bao bì & Nhận diện thương hiệu. Trước đó, sếp từng đảm nhiệm vị trí Trưởng nhóm Graphic tại AZSEO và làm việc tại Viện thẩm mỹ Jenna Thanh.', ARRAY['kinh nghiem'], 6),
('Kinh nghiệm', 'Chương có biết làm việc chung với team Marketing không?', 'Dạ có, sếp em từng có kinh nghiệm chạy quảng cáo Google & Facebook và lên kế hoạch từ khóa. Nhờ vậy, sếp hiểu được cách phối hợp nhịp nhàng với team Marketing và Content để tạo ra các thiết kế bám sát mục tiêu của chiến dịch.', ARRAY['marketing', 'content'], 7),
('Mục tiêu', 'Định hướng công việc của Chương là gì?', 'Mục tiêu của sếp em là tiếp tục đào sâu nghiên cứu về tâm lý thị giác và hành vi người dùng, từ đó ứng dụng vào các dự án thiết kế nhận diện thương hiệu nhằm mang lại trải nghiệm tốt nhất cho người sử dụng.', ARRAY['dinh huong', 'muc tieu'], 8),
('Sở thích', 'Ngoài giờ làm, Chương thích làm gì?', 'Ngoài thời gian làm việc, sếp em thích viết lách, nghe nhạc, xem phim và đi du lịch. Sếp cũng dành khá nhiều thời gian để tìm hiểu thêm về tâm lý học ứng dụng trong thiết kế.', ARRAY['so thich', 'lam gi'], 9);

