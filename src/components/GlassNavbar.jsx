import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";

function NavLink({ to, label, hidden, textColor, hoverColor }) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden text-sm ${textColor} ${hoverColor} transition-all duration-300 ${
        hidden
          ? "w-0 px-0 opacity-0 group-hover/nav:w-auto group-hover/nav:px-2 group-hover/nav:opacity-100"
          : "px-2"
      } whitespace-nowrap flex-shrink-0`}
    >
      <span
        className={`block ${textColor} transition-transform duration-300 group-hover:-translate-y-full`}
      >
        {label}
      </span>
      <span
        className={`absolute inset-0 block translate-y-full ${textColor} transition-transform duration-300 group-hover:translate-y-0`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function GlassNavbar({ isSignedIn, onSignIn }) {
  const navRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { pathname } = useLocation();
  const [lightBg, setLightBg] = useState(false);

  useEffect(() => {
    const checkBackground = () => {
      const el = document.elementFromPoint(window.innerWidth / 2, 10);
      if (!el) return;
      let node = el;
      let color = getComputedStyle(node).backgroundColor;
      // Traverse up until we find a non-transparent color
      while (color.includes("0, 0, 0, 0") && node.parentElement) {
        node = node.parentElement;
        color = getComputedStyle(node).backgroundColor;
      }
      const rgb = color.match(/\d+/g);
      if (rgb) {
        const [r, g, b] = rgb.map(Number);
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        setLightBg(luminance > 200);
      }
    };

    checkBackground();
    window.addEventListener("scroll", checkBackground);
    window.addEventListener("resize", checkBackground);
    return () => {
      window.removeEventListener("scroll", checkBackground);
      window.removeEventListener("resize", checkBackground);
    };
  }, []);

  const textColor = lightBg ? "text-black" : "text-white";
  const hoverColor = lightBg ? "hover:text-black" : "hover:text-white";

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/blog", label: "Blog" },
    { to: "/history", label: "History" },
    { to: "/stats", label: "Stats" },
    { to: "/support", label: "Support" },
    { to: "/policy", label: "Policy" },
    { to: "/license", label: "License" },
  ];

  const expanded = hovered;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div
        ref={navRef}
        className={`group/nav relative flex items-center rounded-full bg-white/20 border border-white/30 px-4 py-2 backdrop-blur-lg transition-all duration-300 delay-200 group-hover/nav:delay-0 overflow-visible ${textColor} ${expanded ? "w-[800px]" : "w-[240px] hover:w-[800px]"}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={(e) => {
          const related = e.relatedTarget;
          if (related && navRef.current && navRef.current.contains(related)) return;
          setHovered(false);
        }}
      >
        <Link to="/" className={`logo-text text-xl mr-2 ${textColor} ${hoverColor}`}>
          DNSX
        </Link>
        <div className="flex-1 flex justify-center group-hover/nav:justify-start gap-0 group-hover/nav:gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              label={item.label}
              hidden={pathname !== item.to}
              textColor={textColor}
              hoverColor={hoverColor}
            />
          ))}
        </div>
        <div
          className="relative flex items-center gap-2 flex-shrink-0"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={(e) => {
            const related = e.relatedTarget;
            if (related && navRef.current && navRef.current.contains(related)) return;
            setHovered(false);
          }}
        >
          {!isSignedIn && expanded && (
            <button
              onClick={onSignIn}
              className={`px-3 py-1 text-sm rounded-full border border-white/30 bg-white/20 backdrop-blur-md ${textColor} ${hoverColor} hover:bg-white/30`}
            >
              Sign In
            </button>
          )}
          {isSignedIn && (
            <Link
              to="/profile"
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md ${textColor} ${hoverColor} hover:bg-white/30`}
            >
              <User className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

