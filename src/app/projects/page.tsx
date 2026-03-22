import { Gallery } from "@/components/Gallery";

export const metadata = {
  title: "Dự án - CHUONG.GRAPHIC",
  description: "Các dự án thiết kế nổi bật",
};

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  return (
    <div className="pt-24 min-h-screen">
      <Gallery variant="subpage" />
    </div>
  );
}
