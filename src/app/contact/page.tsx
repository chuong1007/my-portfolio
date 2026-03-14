import { About } from "@/components/About";

export const metadata = {
  title: "Contact - CHUONG.GRAPHIC",
  description: "Về tôi và liên hệ làm việc",
};

export default function ContactPage() {
  return (
    <div className="pt-24 min-h-screen">
      <About />
      {/* Contact is rendered globally in layout.tsx as a footer */}
    </div>
  );
}
