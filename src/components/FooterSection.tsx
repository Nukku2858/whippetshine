import { MapPin, Phone, Mail, Clock, Car, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import whippetLogo from "@/assets/whippet-logo.png";

const FooterSection = () => {
  return (
    <footer className="relative py-16 px-4 md:px-6 border-t border-border overflow-hidden">
      <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <img key={i} src={whippetLogo} alt="" className="w-36 md:w-48 opacity-[0.06] mix-blend-screen shrink-0 mx-4" />
        ))}
      </div>
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img src={whippetLogo} alt="Whippet Shine" className="h-10 w-10 object-contain mix-blend-screen" />
            <h3 className="text-3xl font-display text-primary">Whippet Shine</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Shelby, Ohio's trusted car detailing & house pressure washing professionals. We treat every vehicle and home like it's our own.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl mb-4">Services</h4>
          <Link
            to="/home#detailing-packages"
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Car size={16} className="text-primary shrink-0" />
            <span>Auto Detailing</span>
          </Link>
          <Link
            to="/pressure-washing#pw-packages"
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Droplets size={16} className="text-primary shrink-0" />
            <span>Pressure Washing</span>
          </Link>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl mb-4">Contact</h4>
          <a href="https://maps.google.com/?q=66+Carleton+Ave,+Shelby,+OH+44875" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <span>66 Carleton Ave, Shelby, OH 44875</span>
          </a>
          <a href="tel:5673704021" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Phone size={16} className="text-primary shrink-0" />
            <span>567-370-4021</span>
          </a>
          <a href="mailto:whippetshine@gmail.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Mail size={16} className="text-primary shrink-0" />
            <span className="break-all">whippetshine@gmail.com</span>
          </a>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl mb-4">Hours</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg px-5 py-3">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Mon – Fri</span>
              <span className="text-xs text-primary font-semibold whitespace-nowrap">8:00 AM – 5:00 PM</span>
            </div>
            <div className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg px-5 py-3">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Saturday</span>
              <span className="text-xs text-primary font-semibold whitespace-nowrap">9:00 AM – 3:00 PM</span>
            </div>
            <div className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg px-5 py-3">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Sunday</span>
              <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">Closed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground space-y-2">
        <div>© {new Date().getFullYear()} Whippet Shine — Auto Detailing & House Pressure Washing — Shelby, Ohio</div>
        <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
      </div>
    </footer>
  );
};

export default FooterSection;
