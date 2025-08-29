import { useState } from "react";
import { ArrowRight, Star } from "lucide-react";

export default function ReviewCarousel({ reviews = [], onNext }) {
  const [index, setIndex] = useState(0);
  const next = () => {
    const newIndex = (index + 1) % reviews.length;
    setIndex(newIndex);
    if (onNext) onNext(reviews[newIndex]);
  };
  const review = reviews[index] || {};
  return (
    <div className="relative w-80 md:w-[32rem] p-6 rounded-xl bg-white/30 backdrop-blur-md text-white">
      <div className="flex items-center gap-4">
        {review.pfp && (
          <img
            src={review.pfp}
            alt={review.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-bold">{review.name}</p>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${review.stars && i < review.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed">{review.text}</p>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2"
      >
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
}
