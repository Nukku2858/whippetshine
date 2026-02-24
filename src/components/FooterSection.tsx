import { MapPin, Phone, Mail, Clock, Car, Droplets } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => {
  return (
    <footer className="py-16 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-3xl font-display text-primary mb-4">Whippet Shine</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Shelby, Ohio's trusted car detailing & house pressure washing professionals. We treat every vehicle and home like it's our own.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl mb-4">Services</h4>
          <Link
            to="/"
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Car size={16} className="text-primary shrink-0" />
            <span>Auto Detailing</span>
          </Link>
          <Link
            to="/pressure-washing"
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Droplets size={16} className="text-primary shrink-0" />
            <span>Pressure Washing</span>
          </Link>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl mb-4">Contact</h4>
          <a href="https://maps.google.com/?q=66+Carleton+Ave,+Shelby,+OH+44875" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MapPin size={16} className="text-primary shrink-0" />
            <span>66 Carleton Ave, Shelby, OH 44875</span>
          </a>
          <a href="tel:5673704021" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Phone size={16} className="text-primary shrink-0" />
            <span>567-370-4021</span>
          </a>
          <a href="mailto:whippetshine@gmail.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Mail size={16} className="text-primary shrink-0" />
            <span>whippetshine@gmail.com</span>
          </a>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl mb-4">Hours</h4>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock size={16} className="text-primary shrink-0" />
            <div>
              <p>Mon – Fri: 8:00 AM – 5:00 PM</p>
              <p>Saturday: 9:00 AM – 3:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Whippet Shine — Auto Detailing & House Pressure Washing — Shelby, Ohio
      </div>
    </footer>
  );
};

export default FooterSection;
