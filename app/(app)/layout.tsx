import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
      <Footer />
    </>
  );
}
