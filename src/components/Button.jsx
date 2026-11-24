// Botão único do site. Canto quase reto (2px) para conversar com os fios e
// carimbos da direção de arte — pílula arredondada era o default genérico.
// `wid` segue a API antiga ("full" ou número em px) para não quebrar o admin.
const VARIANTS = {
  primary: "bg-navy text-white hover:bg-navy-dark",
  gold: "bg-gold text-navy-dark hover:bg-gold-dark hover:text-white",
  danger: "bg-red-700 text-white hover:bg-red-800",
  ghost:
    "bg-transparent text-navy border border-line-strong hover:border-navy hover:bg-navy hover:text-white",
  claro:
    "bg-transparent text-white border border-white/35 hover:border-gold hover:bg-gold hover:text-navy-dark",
};

export default function Button({
  label,
  onClick,
  wid,
  disabled,
  className = "",
  variant = "primary",
  type = "button",
  icon,
}) {
  const style = wid
    ? { width: wid === "full" ? "100%" : `${Math.min(wid, 340)}px` }
    : undefined;

  return (
    <button
      type={type}
      style={style}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-[2px]
        px-6 py-3.5 text-[15px] font-semibold leading-none tracking-[.01em]
        transition-[background-color,color,border-color,transform] duration-200
        active:translate-y-px
        disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0
        ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
