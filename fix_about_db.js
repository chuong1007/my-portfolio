const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const blocks = [
    {
      id: "block-1",
      type: "half",
      content: "<p><strong>1. Giới thiệu bản thân</strong></p><p>Graphic Designer với hơn 7 năm kinh nghiệm xây dựng hình ảnh thương hiệu và ấn phẩm truyền thông đa nền tảng - từ nhận diện thương hiệu, bao bì, giao diện website đến các ấn phẩm chiến dịch (Banner, Poster, Social Media post, KV).</p><p>Có kinh nghiệm dựng và chỉnh sửa video bằng Capcut, đồng thời ứng dụng công cụ AI để tạo video từ hình ảnh tĩnh, phục vụ nội dung marketing nhanh và hiệu quả.</p><p>Kết hợp tư duy chiến lược với thẩm mỹ hiện đại, quen thuộc với việc phối hợp cùng đội ngũ Content và Marketing để phát triển ý tưởng hình ảnh, đảm bảo tính đồng bộ và bám sát mục tiêu chiến dịch. Khả năng thích ứng nhanh, làm việc tốt dưới áp lực deadline và luôn cập nhật xu hướng thiết kế, công nghệ AI mới.</p>"
    },
    {
      id: "block-2",
      type: "half",
      content: "<p><strong>2. Kỹ năng chuyên môn</strong></p><ul><li><strong>Thiết kế:</strong> Photoshop, Illustrator (Sử dụng thành thạo). Ứng dụng AI vào thiết kế đồ họa.</li><li><strong>Dựng phim:</strong> Adobe Premiere, Capcut,... Ứng dụng AI vào dựng và edit clip.</li><li><strong>Kỹ năng mềm:</strong> Làm việc nhóm & Quản lý tiến độ, Giao tiếp & Thuyết trình ý tưởng, Tiếng Anh giao tiếp công việc.</li></ul>"
    },
    {
      id: "block-3",
      type: "full",
      content: "<p><strong>3. Mục tiêu & Sở thích</strong></p><ul><li><strong>Mục tiêu:</strong> Không ngừng nghiên cứu tâm lý thị giác và hành vi người dùng ứng dụng vào thiết kế; hướng tới việc dẫn dắt các dự án sáng tạo toàn diện từ định vị thương hiệu, tối ưu trải nghiệm số cho đến hoàn thiện bao bì sản phẩm.</li><li><strong>Sở thích:</strong> Viết lách, nghe nhạc, xem phim, du lịch và đặc biệt hứng thú nghiên cứu về tâm lý học ứng dụng vào thiết kế.</li></ul>"
    },
    {
      id: "block-4",
      type: "full",
      content: "<p><strong>4. Kinh nghiệm làm việc</strong></p><p><strong>FREELANCER DESIGNER (02/2020 - Nay)</strong><br><strong>Senior Graphic / Web UI & Packaging Designer</strong></p><ul><li>Nghiên cứu, lên khung cấu trúc và thiết kế giao diện Website/Landing Page chuẩn UI/UX trên nền tảng Figma, đảm bảo tính thẩm mỹ và tối ưu bàn giao cho lập trình viên.</li><li>Định hướng phong cách hình ảnh chiến dịch (Key Visual, Poster, Banner), bảo đảm tính đồng bộ thị giác và độ nhận diện thương hiệu trên mọi điểm chạm.</li><li>Phụ trách thiết kế trọn gói từ bộ nhận diện thương hiệu (Logo, Brand Guidelines), bao bì sản phẩm đến các ấn phẩm truyền thông số cho nhiều nhóm khách hàng doanh nghiệp.</li></ul><br><p><strong>CÔNG TY CPDV AZSEO (09/2018 - 02/2020)</strong><br><strong>Leader Team Graphic, thiết kế giao diện Website / Chạy quảng cáo Google - Facebook.</strong></p><ul><li>Quản lý nhóm thiết kế, trực tiếp phân chia khối lượng công việc, kiểm soát chất lượng và tiến độ bàn giao ấn phẩm cho các dự án khách hàng của công ty.</li><li>Thiết kế giao diện Website (UI) chuẩn responsive cho các dự án trên nền tảng WordPress.</li><li>Phối hợp cùng phòng Marketing lên ý tưởng hình ảnh, tối ưu định dạng ấn phẩm quảng cáo chạy Ads (Google, Facebook) nhằm nâng cao tỷ lệ chuyển đổi.</li></ul><br><p><strong>VIỆN THẨM MỸ JENNA THANH (07/2016 - 08/2017)</strong><br><strong>Nhân viên thiết kế đồ họa / Chạy quảng cáo Google - Facebook</strong></p><ul><li>Thiết kế hình ảnh social, tối ưu cho quảng cáo Google, Facebook.</li><li>Thiết kế các ấn phẩm in ấn: Brochure, Name card, Thẻ bảo hành, Standee.</li><li>Sáng tạo nội dung (Copywriting), chăm sóc Fanpage và Website.</li><li>Lên kế hoạch từ khóa và tối ưu hóa ngân sách Ads.</li></ul>"
    }
  ];

  // Fetch current data
  const { data, error: fetchErr } = await supabase.from('site_content').select('*').eq('id', 'about').single();
  if (fetchErr) {
    console.error("Fetch err:", fetchErr);
    return;
  }
  
  const updatedData = {
    ...data.data,
    expandedBlocks: blocks
  };

  const { error: updateErr } = await supabase.from('site_content').update({ data: updatedData }).eq('id', 'about');
  if (updateErr) {
    console.error("Update err:", updateErr);
  } else {
    console.log("SUCCESS! DB updated with real data.");
  }
}
main();
