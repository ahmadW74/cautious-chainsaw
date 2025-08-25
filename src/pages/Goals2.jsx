import { useEffect, useRef, useState } from "react";
import GlobeScene from "@/components/GlobeScene";
import GlassSection from "@/components/GlassSection";

const sections = [
  { title: "Goal One", content: "First milestone toward our mission." },
  { title: "Goal Two", content: "Expanding reach across the globe." },
  { title: "Goal Three", content: "Innovating for a secure future." },
];

export default function Goals2() {
  const sectionRefs = useRef([]);
  const rotationRef = useRef({ x: 0, y: 0 });
  const setRotationRef = useRef(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const rotations = [
      { x: 0.2, y: 0 },
      { x: 0, y: Math.PI / 2 },
      { x: -0.2, y: Math.PI },
    ];

    function spinTo(target) {
      const start = { ...rotationRef.current };
      const duration = 1200;
      const startTime = performance.now();
      function animate(time) {
        const t = Math.min((time - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const x = start.x + (target.x - start.x) * ease;
        const y = start.y + (target.y - start.y) * ease;
        rotationRef.current = { x, y };
        setRotationRef.current({ x, y });
        if (t < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            setActive(index);
            spinTo(rotations[index] || { x: 0, y: 0 });
          }
        });
      },
      { threshold: 0.6 }
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-black via-indigo-900 to-black">
      <div className="md:w-1/2 w-full md:h-screen md:sticky md:top-0 p-4 bg-gradient-to-b from-black via-indigo-900 to-black">
        <GlobeScene
          onSetRotation={(fn) =>
            (setRotationRef.current = (rot) => {
              rotationRef.current = { ...rotationRef.current, ...rot };
              fn(rot);
            })
          }
        />
      </div>
      <div className="md:w-1/2 w-full space-y-24 p-4">
        {sections.map((s, i) => (
          <div
            key={s.title}
            data-index={i}
            ref={(el) => (sectionRefs.current[i] = el)}
            className="min-h-screen flex items-center justify-center"
          >
            <GlassSection
              className={`w-full transition-all duration-700 ${
                active === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">{s.title}</h2>
              <p>{s.content}</p>
            </GlassSection>
          </div>
        ))}
      </div>
    </section>
  );
}
