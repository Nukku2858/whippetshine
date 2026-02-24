import { Star } from "lucide-react";
import reviewCustomer from "@/assets/review-customer.jpg";

const ReviewsSection = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-display mb-3">
            What Our <span className="text-primary">Clients</span> Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Don't just take our word for it — hear from real customers who trust WhippetShine.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
          <div className="w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/10]">
            <img
              src={reviewCustomer}
              alt="TheLotFather — satisfied WhippetShine customer"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg">
                T
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">TheLotFather</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={16} className="fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed text-base">
              "WhippetShine transformed my truck — it looked better than the day I bought it. Absolutely insane attention to detail. These guys don't cut corners."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
