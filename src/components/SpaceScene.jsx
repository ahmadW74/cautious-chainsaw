import { useEffect, useRef } from "react";

export default function SpaceScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    container.appendChild(canvas);

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
    }));

    const streaks = [];

    const spawnObject = () => {
      if (Math.random() < 0.5) {
        streaks.push({
          x: -50,
          y: Math.random() * canvas.height,
          vx: 8 + Math.random() * 12,
          vy: (Math.random() - 0.5) * 2,
          length: 40,
        });
      } else {
        streaks.push({
          x: Math.random() * canvas.width,
          y: -50,
          vx: (Math.random() - 0.5) * 2,
          vy: 8 + Math.random() * 12,
          length: 40,
        });
      }
    };
    const spawnInterval = setInterval(spawnObject, 700);

    const drawStars = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      drawStars();

      streaks.forEach((s, index) => {
        s.x += s.vx;
        s.y += s.vy;
        const angle = Math.atan2(s.vy, s.vx);
        const tailX = s.x - Math.cos(angle) * s.length;
        const tailY = s.y - Math.sin(angle) * s.length;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        if (
          s.x > canvas.width + 50 ||
          s.y > canvas.height + 50 ||
          s.x < -50 ||
          s.y < -50
        ) {
          streaks.splice(index, 1);
        }
      });

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(spawnInterval);
      container.removeChild(canvas);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
