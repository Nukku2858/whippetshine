import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const SCROLL_SPEED = 2; // px per frame for hold-scroll

const ScrollNav = () => {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);
  const rafRef = useRef<number | null>(null);
  const directionRef = useRef<"up" | "down" | null>(null);
  const wasHoldingRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const startHoldScroll = useCallback((direction: "up" | "down") => {
    wasHoldingRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      wasHoldingRef.current = true;
      directionRef.current = direction;
      const tick = () => {
        if (!directionRef.current) return;
        window.scrollBy(0, directionRef.current === "down" ? SCROLL_SPEED : -SCROLL_SPEED);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, 150);
  }, []);

  const stopHoldScroll = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    directionRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopHoldScroll(), [stopHoldScroll]);

  const scrollStep = (direction: "up" | "down") => {
    window.scrollBy({
      top: direction === "down" ? window.innerHeight * 0.75 : -window.innerHeight * 0.75,
      behavior: "smooth",
    });
  };

  const handlers = (direction: "up" | "down") => ({
    onClick: () => {
      if (!wasHoldingRef.current) scrollStep(direction);
    },
    onMouseDown: () => startHoldScroll(direction),
    onMouseUp: stopHoldScroll,
    onMouseLeave: stopHoldScroll,
    onTouchStart: () => startHoldScroll(direction),
    onTouchEnd: stopHoldScroll,
  });

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
      <button
        {...handlers("up")}
        className={`w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 ${
          showUp ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
        aria-label="Scroll up"
      >
        <ChevronUp size={18} />
      </button>
      <button
        {...handlers("down")}
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
