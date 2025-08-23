import { Link } from "react-router-dom";

function NavLink({ to, label, hidden }) {
  return (
    <Link
      to={to}
      className={`relative overflow-hidden px-2 text-sm group/nav-link transition-all duration-300 group-hover/nav:text-white/50 hover:text-white ${
        hidden ? "opacity-0 max-w-0 group-hover/nav:opacity-100 group-hover/nav:max-w-[100px]" : ""
      }`}
    >
      <span className="block transition-transform duration-300 group-hover/nav-link:-translate-y-full">
        {label}
      </span>
      <span className="absolute inset-0 block translate-y-full transition-transform duration-300 group-hover/nav-link:translate-y-0">
        {label}
      </span>
    </Link>
  );
}

export default function GlassNavbar() {
  return (
    <nav className="fixed top-4 left-4 z-50">
      <div className="group/nav flex items-center gap-4 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md transition-all duration-300 overflow-hidden max-w-[170px] group-hover/nav:max-w-[600px] text-white">
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
