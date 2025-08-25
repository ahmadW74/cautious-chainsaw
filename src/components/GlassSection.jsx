export default function GlassSection({ children, className = "", style = {} }) {
  return (
    <div
      className={`backdrop-blur-md bg-white/20 rounded-xl shadow-lg p-6 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
