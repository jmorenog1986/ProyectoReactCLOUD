// components/ui/Button.jsx

const VARIANTS = {
  primary:   "bg-indigo-600 hover:bg-indigo-700 text-white",
  danger:    "bg-red-500   hover:bg-red-600   text-white",
  ghost:     "bg-transparent border border-slate-300 text-slate-700",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2   text-sm",
  lg: "px-6 py-3   text-base",
};

export function Button({
  children,
  variant   = "primary",
  size      = "md",
  type      = "button",
  disabled  = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${VARIANTS[variant]}
        ${SIZES[size]}
        rounded-lg font-medium transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}