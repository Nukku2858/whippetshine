import { MapPin, Phone, Mail, Clock } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="py-16 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-3xl font-display text-primary mb-4">Whippet Shine</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Shelby, Ohio's trusted car detailing professionals. We treat every vehicle like it's our own.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl mb-4">Contact</h4>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin size={16} className="text-primary shrink-0" />
            <span>Shelby, OH 44875</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone size={16} className="text-primary shrink-0" />
            <span>(419) 555-0123</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail size={16} className="text-primary shrink-0" />
            <span>info@whippetshine.com</span>
          </div>
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
        © {new Date().getFullYear()} Whippet Shine — Shelby, Ohio
      </div>
    </footer>
  );
};

export default FooterSection;
