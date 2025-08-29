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

    const comets = [];
    const asteroids = [];

    const spawnObject = () => {
      if (Math.random() < 0.5) {
        comets.push({
          x: -50,
          y: Math.random() * canvas.height,
          vx: 2 + Math.random() * 3,
          vy: (Math.random() - 0.5) * 1,
          radius: 2 + Math.random() * 3,
          tail: [],
        });
      } else {
        asteroids.push({
          x: Math.random() * canvas.width,
          y: -50,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 1 + Math.random() * 2,
          radius: 3 + Math.random() * 4,
        });
      }
    };
    const spawnInterval = setInterval(spawnObject, 1500);

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

      ctx.fillStyle = "white";
      comets.forEach((c, index) => {
        c.x += c.vx;
        c.y += c.vy;
        c.tail.push({ x: c.x, y: c.y });
        if (c.tail.length > 10) c.tail.shift();
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        for (let t = 0; t < c.tail.length; t++) {
          const p = c.tail[t];
          ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        if (
          c.x > canvas.width + 50 ||
          c.y < -50 ||
          c.y > canvas.height + 50
        ) {
          comets.splice(index, 1);
        }
      });

      ctx.fillStyle = "#888";
      asteroids.forEach((a, index) => {
        a.x += a.vx;
        a.y += a.vy;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fill();
        if (
          a.y > canvas.height + 50 ||
          a.x < -50 ||
          a.x > canvas.width + 50
        ) {
          asteroids.splice(index, 1);
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
