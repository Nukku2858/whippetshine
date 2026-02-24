import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PWHeroSection from "@/components/pressure-washing/PWHeroSection";
import PWPackagesSection from "@/components/pressure-washing/PWPackagesSection";
import PWHousePackagesSection from "@/components/pressure-washing/PWHousePackagesSection";
import PWBookingSection from "@/components/pressure-washing/PWBookingSection";
import FooterSection from "@/components/FooterSection";

const PressureWashing = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [hash]);
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <PWHeroSection />
      <div id="pw-packages">
        <PWPackagesSection />
        <PWHousePackagesSection />
      </div>
      <PWBookingSection />
      <FooterSection />
    </main>
  );
};

export default PressureWashing;
