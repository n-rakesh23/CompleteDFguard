export default function Card({ children, className = '', hover = true, glow = false, ...props }) {
  return (
    <div
      className={`
        neon-card rounded-[24px] p-6
        ${hover ? 'hover:-translate-y-1' : ''}
        ${glow ? 'shadow-glow-cyan' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
