import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Star, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Auto Detailing", path: "/home" },
  { label: "Pressure Washing", path: "/pressure-washing#pw-video" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, profile } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 pt-[env(safe-area-inset-top)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 py-2.5 md:px-6 md:py-4">
        <Link to="/home" className="flex items-center shrink-0">
          <span className="text-base md:text-2xl font-display tracking-wide">
            <span className="text-muted-foreground">Whippet</span>
            <span className="text-primary">Shine</span>
          </span>
        </Link>

        <div className="flex items-center gap-0.5 md:gap-1 bg-muted/60 rounded-full p-0.5 md:p-1">
          {navLinks.map((link) => {
            const isActive = link.path === "/home" ? pathname === "/home" : pathname.startsWith("/pressure-washing");
            const activeClass = link.path === "/home"
              ? "bg-[hsl(0,60%,30%)] text-primary-foreground shadow-md ring-2 ring-primary/50"
              : "bg-[hsl(0,0%,45%)] text-white shadow-md ring-2 ring-[hsl(0,0%,55%)]/50";
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[9px] md:text-sm tracking-wider md:tracking-widest uppercase transition-all px-2 md:px-5 py-1 md:py-2 rounded-full font-medium whitespace-nowrap",
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

        <Link
          to={user ? "/account" : "/auth"}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {user && profile ? (
            <>
              <Star size={14} className="text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">{profile.points_balance}</span>
              <User size={16} />
            </>
          ) : (
            <span className="text-xs md:text-sm font-medium uppercase tracking-wider">Sign In</span>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
