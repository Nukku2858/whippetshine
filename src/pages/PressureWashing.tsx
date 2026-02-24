import Navbar from "@/components/Navbar";
import PWHeroSection from "@/components/pressure-washing/PWHeroSection";
import PWPackagesSection from "@/components/pressure-washing/PWPackagesSection";
import PWHousePackagesSection from "@/components/pressure-washing/PWHousePackagesSection";
import PWBookingSection from "@/components/pressure-washing/PWBookingSection";
import FooterSection from "@/components/FooterSection";

const PressureWashing = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <PWHeroSection />
      <div id="pw-packages">
        <PWPackagesSection />
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <span className="text-primary/60 text-xs tracking-[0.3em] uppercase font-medium">
              Residential
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>
        </div>
        <PWHousePackagesSection />
      </div>
      <PWBookingSection />
      <FooterSection />
    </main>
  );
};

export default PressureWashing;
