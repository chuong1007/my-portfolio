const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/sections/About.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newRecoveryCode = `
  useEffect(() => {
    if (expandedBlocks.length === 0 && isEditor) {
       setAvatarUrl("https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2680&auto=format&fit=crop");
       setExpandedBlocks([
         {
           id: "left",
           type: "half",
           content: "<p>1. Giới thiệu bản thân</p><p></p><p><strong>Graphic Designer với hơn 7 năm kinh nghiệm</strong> xây dựng hình ảnh thương hiệu và ấn phẩm truyền thông đa nền tảng - từ nhận diện thương hiệu, bao bì, giao diện website đến các ấn phẩm chiến dịch (Banner, Poster, Social Media post, KV).</p><p></p><p>Có kinh nghiệm dựng và chỉnh sửa video bằng Capcut, đồng thời ứng dụng công cụ AI để tạo video từ hình ảnh tĩnh, phục vụ nội dung marketing nhanh và hiệu quả.</p>"
         },
         {
           id: "right",
           type: "half",
           content: "<p>2. Kỹ năng và Học vấn</p><p></p><p><strong>KỸ NĂNG CHUYÊN MÔN</strong></p><ul><li><p><strong>Thiết kế:</strong> Photoshop, Illustrator. Ứng dụng AI vào thiết kế đồ họa</p></li><li><p><strong>Dựng phim:</strong> Adobe Premiere, Capcut,... Ứng dụng AI vào dựng và edit clip.</p></li><li><p><strong>Kỹ năng mềm:</strong> Teamwork, Giao tiếp, Tiếng Anh giao tiếp tốt.</p></li></ul><p></p><p><strong>HỌC VẤN</strong></p><ul><li><p><strong>Đại học Công nghiệp TP.HCM (2013 - 2017):</strong> Tốt nghiệp chuyên ngành Quản trị kinh doanh.</p></li><li><p><strong>2017 - Nay:</strong> Tự học chuyên sâu về tư duy thiết kế, thẩm mỹ và công cụ qua thực tế.</p></li></ul>"
         }
       ]);
    }
  }, [isEditor, expandedBlocks.length]);
`;

// Replace the old useEffect with the new one
content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \(expandedBlocks\.length === 0 && isEditor\) \{[\s\S]*?\}\n\s*\}, \[isEditor, expandedBlocks\.length\]\);/,
  newRecoveryCode.trim()
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Recovery code FULL updated in About.tsx');
