import { useEffect, useState } from "react";

export default function NumberTicker({ start, className = "" }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    let timeout;
    let current = 0;
    const target = start;

    const animateToTarget = () => {
      current += Math.ceil((target - current) / 10);
      setValue(current);
      if (current < target) {
        raf = requestAnimationFrame(animateToTarget);
      } else {
        const tick = () => {
          setValue((v) => v + Math.floor(Math.random() * 1000) + 500);
          timeout = setTimeout(tick, Math.random() * 2000 + 1000);
        };
        timeout = setTimeout(tick, Math.random() * 2000 + 1000);
      }
    };

    raf = requestAnimationFrame(animateToTarget);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
    };
  }, [start]);

  return (
    <span className={`text-white ${className}`}>{value.toLocaleString()}</span>
  );
}
