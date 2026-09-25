import { Blog } from "@/components/sections/Blog";

export const metadata = {
  title: 'Blog thiết kế',
  description: 'Chia sẻ kiến thức, kinh nghiệm và xu hướng thiết kế đồ hoạ, nhận diện thương hiệu từ góc nhìn của một Visual Designer 7+ năm tại TP.HCM.',
  openGraph: {
    title: 'Blog thiết kế | CHUONG.PORTFOLIO',
    description: 'Chia sẻ kiến thức, kinh nghiệm và xu hướng thiết kế đồ hoạ, nhận diện thương hiệu từ góc nhìn của một Visual Designer 7+ năm tại TP.HCM.',
    url: 'https://chuong-graphic.vercel.app/blog',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export const dynamic = 'force-dynamic';

export default function BlogPageIndex() {
  return (
    <div className="pt-24 min-h-screen">
      <Blog variant="subpage" />
    </div>
  );
}
