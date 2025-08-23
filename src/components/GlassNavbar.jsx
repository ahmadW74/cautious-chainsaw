import { Link } from "react-router-dom";
import { useState } from "react";
import { User } from "lucide-react";

function NavLink({ to, label, hidden }) {
  return (
    <Link
      to={to}
      className={`relative overflow-hidden text-sm text-white transition-all duration-300 group-hover:text-white/50 hover:text-white ${
        hidden
          ? "w-0 px-0 opacity-0 group-hover:w-auto group-hover:px-2 group-hover:opacity-100"
          : "px-2"
      }`}
    >
      <span className="block transition-transform duration-300 hover:-translate-y-full">
        {label}
      </span>
      <span className="absolute inset-0 block translate-y-full transition-transform duration-300 hover:translate-y-0">
        {label}
      </span>
    </Link>
  );
}

export default function GlassNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="group relative flex items-center gap-4 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md transition-all duration-300 overflow-hidden w-[240px] hover:w-[800px] text-white">
        <Link to="/" className="logo-text text-xl mr-2">
          DNSX
        </Link>
        <NavLink to="/" label="Home" />
        <NavLink to="/goals" label="Goals" hidden />
        <NavLink to="/about" label="About" hidden />
        <NavLink to="/blog" label="Blog" hidden />
        <NavLink to="/support" label="Support" hidden />
        <NavLink to="/policy" label="Policy" hidden />
        <NavLink to="/license" label="License" hidden />
        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/30"
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
    </nav>
  );
}

