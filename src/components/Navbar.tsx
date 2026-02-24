import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import whippetLogo from "@/assets/whippet-logo.png";

const navLinks = [
  { label: "Auto Detailing", path: "/" },
  { label: "Pressure Washing", path: "/pressure-washing#pw-video" },
];

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 py-2.5 md:px-6 md:py-4">
        <Link to="/" className="flex items-center shrink-0">
          <span className="text-base md:text-2xl font-display tracking-wide">
            <span className="text-muted-foreground">Whippet</span>
            <span className="text-primary">Shine</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 bg-muted/60 rounded-full p-1">
          {navLinks.map((link) => {
            const isActive = link.path === "/" ? pathname === "/" : pathname.startsWith("/pressure-washing");
            const activeClass = link.path === "/"
              ? "bg-[hsl(0,60%,30%)] text-primary-foreground shadow-md ring-2 ring-primary/50"
              : "bg-[hsl(0,0%,45%)] text-white shadow-md ring-2 ring-[hsl(0,0%,55%)]/50";
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[10px] md:text-sm tracking-widest uppercase transition-all px-2.5 md:px-5 py-1.5 md:py-2 rounded-full font-medium whitespace-nowrap",
                  isActive
                    ? activeClass
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
