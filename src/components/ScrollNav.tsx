import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const ScrollNav = () => {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);

  const updateVisibility = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    setShowUp(scrollTop > 200);
    setShowDown(scrollTop + clientHeight < scrollHeight - 100);
  }, []);

  useEffect(() => {
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [updateVisibility]);

  const scrollStep = (direction: "up" | "down") => {
    window.scrollBy({
      top: direction === "down" ? window.innerHeight * 0.75 : -window.innerHeight * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
      <button
        onClick={() => scrollStep("up")}
        className={`w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 ${
          showUp ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
        aria-label="Scroll up"
      >
        <ChevronUp size={18} />
      </button>
      <button
        onClick={() => scrollStep("down")}
        className={`w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 ${
          showDown ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
        aria-label="Scroll down"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
};

export default ScrollNav;
