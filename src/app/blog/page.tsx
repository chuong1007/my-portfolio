import { Blog } from "@/components/Blog";

export const metadata = {
  title: "Blog - CHUONG.GRAPHIC",
  description: "Chia sẻ kiến thức thiết kế",
};

export default function BlogPageIndex() {
  return (
    <div className="pt-24 min-h-screen">
      <Blog variant="subpage" />
    </div>
  );
}
