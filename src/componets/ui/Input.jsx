export function Input({
  id,
  name,
  label,
  type         = "text",
  placeholder  = "",
  value,
  onChange,
  error        = "",
  required     = false,
  pattern,
  minLength,
  maxLength,
  autoComplete,
  className    = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>

      {label && (
        <label htmlFor={id}
          className="text-xs font-semibold uppercase tracking-widest text-slate-500"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={id}           name={name}
        type={type}       value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}   pattern={pattern}
        minLength={minLength} maxLength={maxLength}
        autoComplete={autoComplete}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm
          ${error
            ? "border-red-400 bg-red-50 ring-2 ring-red-100"
            : "border-slate-200 focus:border-indigo-400 focus:ring-2"
          }
        `}
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}