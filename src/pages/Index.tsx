import HeroSection from "@/components/HeroSection";
import PackagesSection from "@/components/PackagesSection";
import BookingSection from "@/components/BookingSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <PackagesSection />
      <BookingSection />
      <FooterSection />
    </main>
  );
};

export default Index;
