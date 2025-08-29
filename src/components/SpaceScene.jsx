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

      comets.forEach((c, index) => {
        c.x += c.vx;
        c.y += c.vy;
        const angle = Math.atan2(c.vy, c.vx);
        const tailLength = c.radius * 8;
        const baseAngle1 = angle + Math.PI / 2;
        const baseAngle2 = angle - Math.PI / 2;
        const tipX = c.x - Math.cos(angle) * tailLength;
        const tipY = c.y - Math.sin(angle) * tailLength;
        const base1X = c.x + Math.cos(baseAngle1) * c.radius;
        const base1Y = c.y + Math.sin(baseAngle1) * c.radius;
        const base2X = c.x + Math.cos(baseAngle2) * c.radius;
        const base2Y = c.y + Math.sin(baseAngle2) * c.radius;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.moveTo(base1X, base1Y);
        ctx.lineTo(base2X, base2Y);
        ctx.lineTo(tipX, tipY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "blue";
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

      asteroids.forEach((a, index) => {
        a.x += a.vx;
        a.y += a.vy;
        const angle = Math.atan2(a.vy, a.vx);
        const tailLength = a.radius * 6;
        const baseAngle1 = angle + Math.PI / 2;
        const baseAngle2 = angle - Math.PI / 2;
        const tipX = a.x - Math.cos(angle) * tailLength;
        const tipY = a.y - Math.sin(angle) * tailLength;
        const base1X = a.x + Math.cos(baseAngle1) * a.radius;
        const base1Y = a.y + Math.sin(baseAngle1) * a.radius;
        const base2X = a.x + Math.cos(baseAngle2) * a.radius;
        const base2Y = a.y + Math.sin(baseAngle2) * a.radius;
        ctx.fillStyle = "rgba(255,69,0,0.8)";
        ctx.beginPath();
        ctx.moveTo(base1X, base1Y);
        ctx.lineTo(base2X, base2Y);
        ctx.lineTo(tipX, tipY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#888";
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
