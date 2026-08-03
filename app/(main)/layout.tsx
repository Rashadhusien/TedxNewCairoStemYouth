import Navbar from "@/components/layout/navigation/navbar";
import Footer from "@/components/layout/footer";
import AuthSessionProvider from "@/components/providers/session-provider";
import WelcomeAboardModal from "@/components/welcome/welcome-aboard-modal";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <WelcomeAboardModal />
      <div className="relative flex flex-col min-h-screen">
        <Navbar />
        <main className="grow">{children}</main>
        <Footer />
      </div>
    </AuthSessionProvider>
  );
}

export default MainLayout;
