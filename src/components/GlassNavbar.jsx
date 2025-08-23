import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { User } from "lucide-react";

function NavLink({ to, label, hidden }) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden text-sm text-white transition-all duration-300 hover:text-white ${
        hidden
          ? "w-0 px-0 opacity-0 group-hover/nav:w-auto group-hover/nav:px-2 group-hover/nav:opacity-100"
          : "px-2"
      } whitespace-nowrap flex-shrink-0`}
    >
      <span className="block !text-white transition-transform duration-300 group-hover:-translate-y-full">
        {label}
      </span>
      <span className="absolute inset-0 block translate-y-full !text-white transition-transform duration-300 group-hover:translate-y-0">
        {label}
      </span>
    </Link>
  );
}

export default function GlassNavbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/goals", label: "Goals" },
    { to: "/about", label: "About" },
    { to: "/blog", label: "Blog" },
    { to: "/support", label: "Support" },
    { to: "/policy", label: "Policy" },
    { to: "/license", label: "License" },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="group/nav relative flex items-center rounded-full bg-white/10 px-4 py-2 backdrop-blur-md transition-all duration-300 w-[240px] hover:w-[800px] text-white overflow-visible">
        <Link to="/" className="logo-text text-xl mr-2">
          DNSX
        </Link>
        <div className="flex-1 flex justify-center group-hover/nav:justify-start gap-0 group-hover/nav:gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              label={item.label}
              hidden={pathname !== item.to}
            />
          ))}
        </div>
        <div
          className="relative flex-shrink-0"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30"
          >
            <User className="h-4 w-4 text-white" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-32 rounded-md bg-black/50 backdrop-blur-md text-white py-2">
              <Link to="/profile" className="block px-4 py-1 hover:bg-white/10">
                Profile
              </Link>
              <Link to="/settings" className="block px-4 py-1 hover:bg-white/10">
                Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

