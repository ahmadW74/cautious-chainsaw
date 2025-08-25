import { useEffect, useRef, useState } from "react";
import chainModel from "@/assets/models/chain.obj?url";
import lockModel from "@/assets/models/lock.obj?url";
import keyModel from "@/assets/models/key.obj?url";
import GoalsBackground from "@/components/GoalsBackground";

// Use locally imported models so the background works offline
const modelUrls = [chainModel, lockModel, keyModel];

const sections = [
  {
    title: "Unchain Your Potential",
    text: "Explore how our platform empowers you to break barriers and reach new heights.",
    color: "#f8f8f8",
  },
  {
    title: "Forge Strong Connections",
    text: "Collaborate with others and build meaningful networks that drive success.",
    color: "#e0f7fa",
  },
  {
    title: "Unlock Success",
    text: "Leverage intuitive tools and insights to achieve your goals efficiently.",
    color: "#fce4ec",
  },
  {
    title: "Secure Your Future",
    text: "Stay informed and prepared with up‑to‑date resources and guidance.",
    color: "#e8f5e9",
  },
];

export default function Goals() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bgColor, setBgColor] = useState(sections[0].color);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      container.scrollBy({ left: e.deltaY, behavior: "smooth" });
    };

    const handleScroll = () => {
      const max = container.scrollWidth - container.clientWidth;
      const pct = (container.scrollLeft / max) * 100;
      setProgress(pct);
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setActiveIndex(index);
      setBgColor(sections[index]?.color || sections[0].color);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: bgColor, transition: "background-color 0.8s ease" }}
    >
      <GoalsBackground
        modelUrls={modelUrls}
        bgColor={bgColor}
        activeIndex={activeIndex}
        sectionCount={sections.length}
      />
      <div
        ref={containerRef}
        className="relative z-10 flex h-screen overflow-x-scroll overflow-y-hidden snap-x snap-mandatory scroll-smooth scrollbar-hide"
      >
        {sections.map((s, i) => (
          <div
            key={i}
            className={`flex-shrink-0 w-screen h-full flex flex-col items-center justify-center p-10 text-center snap-start transition-all duration-700 ease-in-out ${activeIndex === i ? "opacity-100" : "opacity-50 scale-95"}`}
          >
            <h2 className="text-4xl font-bold mb-4">{s.title}</h2>
            <p className="max-w-md text-lg">{s.text}</p>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gray-200">
        <div
          className="h-full bg-gray-800 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}
