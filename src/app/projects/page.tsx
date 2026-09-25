import { Gallery } from "@/components/sections/Gallery";

export const metadata = {
  title: 'Dự án thiết kế',
  description: 'Xem toàn bộ các dự án nhận diện thương hiệu, ấn phẩm đồ hoạ, thiết kế bao bì và quảng cáo đa nền tảng của CHUONG.GRAPHIC tại TP.HCM.',
  openGraph: {
    title: 'Dự án thiết kế | CHUONG.PORTFOLIO',
    description: 'Xem toàn bộ các dự án nhận diện thương hiệu, ấn phẩm đồ hoạ, thiết kế bao bì và quảng cáo đa nền tảng của CHUONG.GRAPHIC tại TP.HCM.',
    url: 'https://chuong-graphic.vercel.app/projects',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  return (
    <div className="pt-24 min-h-screen">
      <Gallery variant="subpage" />
    </div>
  );
}
