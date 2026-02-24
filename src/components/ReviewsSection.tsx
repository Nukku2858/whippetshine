import { Star } from "lucide-react";
import reviewCustomer from "@/assets/review-customer.jpg";

const reviews = [
  {
    name: "TheLotFather",
    image: reviewCustomer,
    text: "WhippetShine transformed my truck — it looked better than the day I bought it. Absolutely insane attention to detail. These guys don't cut corners.",
    rating: 5,
  },
  {
    name: "Marcus T.",
    text: "I've tried every detailer in town and nobody comes close. My car had swirl marks everywhere and they made the paint look like glass. 10/10 would recommend.",
    rating: 5,
  },
  {
    name: "Sarah L.",
    text: "Got the full detail package for my SUV before a road trip. The interior smelled brand new and the exterior was gleaming. Worth every single penny!",
    rating: 5,
  },
  {
    name: "Devon R.",
    text: "Had my driveway pressure washed too — night and day difference. Professional, on time, and the results speak for themselves. Already booked my next appointment.",
    rating: 5,
  },
  {
    name: "Chris B.",
    text: "These guys are the real deal. My black car has never looked this good. Zero scratches, perfect finish. WhippetShine is the only name I trust with my ride.",
    rating: 5,
  },
];

const ReviewsSection = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-display mb-3">
            What Our <span className="text-primary">Clients</span> Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Don't just take our word for it — hear from real customers who trust WhippetShine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                {review.image ? (
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg">
                    {review.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
