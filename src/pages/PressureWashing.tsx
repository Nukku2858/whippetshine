import PWHeroSection from "@/components/pressure-washing/PWHeroSection";
import PWPackagesSection from "@/components/pressure-washing/PWPackagesSection";
import PWBookingSection from "@/components/pressure-washing/PWBookingSection";
import FooterSection from "@/components/FooterSection";

const PressureWashing = () => {
  return (
    <main className="min-h-screen bg-background">
      <PWHeroSection />
      <PWPackagesSection />
      <PWBookingSection />
      <FooterSection />
    </main>
  );
};

export default PressureWashing;
