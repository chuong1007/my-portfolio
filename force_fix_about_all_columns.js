const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newRecoveryCode = `
  useEffect(() => {
    const hasCorrectTitle = expandedBlocks.some(b => b.content && b.content.includes("Giới thiệu bản thân"));
    if (!hasCorrectTitle || expandedBlocks.length < 4) {
       setAvatarUrl("https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2680&auto=format&fit=crop");
       setExpandedBlocks([
         {
           id: "block-1",
           type: "half",
           content: "<p>1. Giới thiệu bản thân</p><p></p><p><strong>Graphic Designer với hơn 7 năm kinh nghiệm</strong> xây dựng hình ảnh thương hiệu và ấn phẩm truyền thông đa nền tảng - từ nhận diện thương hiệu, bao bì, giao diện website đến các ấn phẩm chiến dịch (Banner, Poster, Social Media post, KV).</p><p></p><p>Có kinh nghiệm dựng và chỉnh sửa video bằng Capcut, đồng thời ứng dụng công cụ AI để tạo video từ hình ảnh tĩnh, phục vụ nội dung marketing nhanh và hiệu quả.</p>"
         },
         {
           id: "block-2",
           type: "half",
           content: "<p>2. Kỹ năng và Học vấn</p><p></p><p><strong>KỸ NĂNG CHUYÊN MÔN</strong></p><ul><li><p><strong>Thiết kế:</strong> Photoshop, Illustrator. Ứng dụng AI vào thiết kế đồ họa</p></li><li><p><strong>Dựng phim:</strong> Adobe Premiere, Capcut,... Ứng dụng AI vào dựng và edit clip.</p></li><li><p><strong>Kỹ năng mềm:</strong> Teamwork, Giao tiếp, Tiếng Anh giao tiếp tốt.</p></li></ul><p></p><p><strong>HỌC VẤN</strong></p><ul><li><p><strong>Đại học Công nghiệp TP.HCM (2013 - 2017):</strong> Tốt nghiệp chuyên ngành Quản trị kinh doanh.</p></li><li><p><strong>2017 - Nay:</strong> Tự học chuyên sâu về tư duy thiết kế, thẩm mỹ và công cụ qua thực tế.</p></li></ul>"
         },
         {
           id: "block-3",
           type: "half",
           content: "<p>3. Kinh nghiệm làm việc</p><p></p><p><strong>2020 - Hiện tại: Senior Graphic Designer</strong></p><p>Chịu trách nhiệm thiết kế bộ nhận diện thương hiệu, UI/UX cơ bản cho website, và các ấn phẩm truyền thông digital. Phối hợp với team Marketing để tối ưu hóa hình ảnh quảng cáo trên các nền tảng mạng xã hội.</p><p></p><p><strong>2017 - 2020: Graphic Designer</strong></p><p>Thiết kế banner, poster, standee cho các sự kiện offline. Chỉnh sửa hình ảnh sản phẩm và hỗ trợ quay dựng video cơ bản cho các chiến dịch ra mắt sản phẩm mới.</p>"
         },
         {
           id: "block-4",
           type: "half",
           content: "<p>4. Sở thích</p><p></p><p><strong>Nhiếp ảnh & Quay phim:</strong> Thích ghi lại những khoảnh khắc đời thường và du lịch, tìm tòi các góc máy và cách xử lý ánh sáng mới.</p><p></p><p><strong>Tìm hiểu công nghệ & AI:</strong> Thường xuyên cập nhật các công cụ AI mới (Midjourney, ChatGPT, Stable Diffusion) để ứng dụng vào tối ưu hóa quy trình thiết kế.</p><p></p><p><strong>Thể thao:</strong> Chạy bộ và bơi lội để rèn luyện sức khỏe, duy trì sự cân bằng sau những giờ làm việc căng thẳng.</p>"
         }
       ]);
    }
  }, [expandedBlocks]);
`;

// Find the old recovery code and replace it
const oldRecoveryCodeRegex = /useEffect\(\(\) => \{\n\s*const hasCorrectTitle[\s\S]*?\}, \[expandedBlocks\]\);/;
if (oldRecoveryCodeRegex.test(content)) {
  content = content.replace(oldRecoveryCodeRegex, newRecoveryCode.trim());
} else {
  console.log("Could not find the previous recovery code!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Force fix code injected into About.tsx with 4 columns');
