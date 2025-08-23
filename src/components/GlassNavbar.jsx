import { Link } from "react-router-dom";

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
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="group flex items-center gap-4 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md transition-all duration-300 overflow-hidden w-[240px] hover:w-[680px] text-white">
        <Link to="/" className="logo-text text-xl mr-2">
          DNSX
        </Link>
        <NavLink to="/" label="Home" />
        <NavLink to="/goals" label="Goals" hidden />
        <NavLink to="/about" label="About" hidden />
        <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-lg">
          =
        </div>
      </div>
    </nav>
  );
}

