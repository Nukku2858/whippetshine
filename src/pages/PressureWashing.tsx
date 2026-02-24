import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PWHeroSection from "@/components/pressure-washing/PWHeroSection";
import PWPackagesSection from "@/components/pressure-washing/PWPackagesSection";
import PWHousePackagesSection from "@/components/pressure-washing/PWHousePackagesSection";

import FooterSection from "@/components/FooterSection";
import LoyaltyPromoSection from "@/components/LoyaltyPromoSection";


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
      <LoyaltyPromoSection />
      <FooterSection />
      
    </main>
  );
};

export default PressureWashing;
