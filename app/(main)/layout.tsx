import Navbar from "@/components/layout/navigation/navbar";
import Footer from "@/components/layout/footer";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
