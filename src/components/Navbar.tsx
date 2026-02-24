import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Auto Detailing", path: "/" },
  { label: "Pressure Washing", path: "/pressure-washing" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-display tracking-wide">
          <span className="text-muted-foreground">Whippet</span>
          <span className="text-primary">Shine</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 bg-muted/60 rounded-full p-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm tracking-widest uppercase transition-all px-5 py-2 rounded-full font-medium",
                pathname === link.path
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-6 py-4 animate-slide-down overflow-hidden">
          <div className="flex gap-1 bg-muted/60 rounded-full p-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex-1 text-center text-sm tracking-widest uppercase transition-all px-4 py-2 rounded-full font-medium",
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
      )}
    </nav>
  );
};

export default Navbar;
