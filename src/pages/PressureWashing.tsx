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
      <PWPackagesSection />
      <PWHousePackagesSection />
      <PWBookingSection />
      <FooterSection />
    </main>
  );
};

export default PressureWashing;
