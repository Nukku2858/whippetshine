import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import whippetLogo from "@/assets/whippet-logo.webp";

const navLinks = [
  { label: "Auto Detailing", path: "/" },
  { label: "Pressure Washing", path: "/pressure-washing" },
];

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={whippetLogo} alt="Whippet Shine" className="h-8 w-8 object-contain" />
          <span className="text-xl md:text-2xl font-display tracking-wide">
            <span className="text-muted-foreground">Whippet</span>
            <span className="text-primary">Shine</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 bg-muted/60 rounded-full p-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-xs md:text-sm tracking-widest uppercase transition-all px-3 md:px-5 py-1.5 md:py-2 rounded-full font-medium whitespace-nowrap",
                pathname === link.path
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
