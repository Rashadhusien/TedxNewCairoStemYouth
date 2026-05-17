import Navbar from "@/components/layout/navigation/navbar";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[10000px]">
      <Navbar />
      <main className="">{children}</main>
    </div>
  );
}

export default MainLayout;
