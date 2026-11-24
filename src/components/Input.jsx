// Campo de formulário do site. API igual à anterior (label, wid, select,
// textarea, setValue) mais três extras de apresentação:
//   prefixo — símbolo colado à esquerda (R$, U$, €)
//   sufixo  — unidade à direita (m²)
//   dica    — linha de apoio abaixo do campo, para formato esperado
const BASE =
  "w-full rounded-[2px] border border-line-strong bg-white px-3 py-2.5 text-[15.5px] text-ink " +
  "placeholder:text-muted/60 transition-colors duration-200 " +
  "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/60 " +
  "disabled:bg-canvas disabled:text-muted disabled:cursor-not-allowed";

export default function Input({
  type,
  placeholder,
  label,
  wid,
  value,
  setValue,
  select,
  selectOptions,
  disabled,
  className = "",
  textarea,
  rows,
  onChangeFunction,
  multiple,
  prefixo,
  sufixo,
  dica,
  inputMode,
  maxLength,
  id,
}) {
  const style = wid
    ? { width: wid === "full" ? "100%" : `${Math.min(wid, 340)}px` }
    : undefined;

  const campoId = id || label;

  const handleChange = (e) => {
    if (type === "file") setValue(e);
    else setValue(e.target.value);
  };

  const onChange = onChangeFunction || handleChange;

  const campo = select ? (
    <select
      id={campoId}
      className={`${BASE} cursor-pointer appearance-none bg-[length:18px] bg-[right_10px_center] bg-no-repeat pr-9`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235a6f7d' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>\")",
      }}
      disabled={disabled}
      value={value}
      onChange={onChange}
    >
      {selectOptions.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  ) : textarea ? (
    <textarea
      id={campoId}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      value={value}
      onChange={onChange}
      className={`${BASE} resize-y leading-relaxed`}
    />
  ) : (
    <input
      id={campoId}
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      value={type === "file" ? undefined : value}
      multiple={multiple}
      disabled={disabled}
      inputMode={inputMode}
      maxLength={maxLength}
      className={`${BASE} ${prefixo ? "pl-11" : ""} ${sufixo ? "pr-12" : ""}`}
    />
  );

  return (
    <div
      className={`flex min-w-[50px] flex-col text-left ${className}`}
      style={style}
    >
      {label && (
        <label
          className="mb-1.5 cursor-pointer text-[12px] font-semibold tracking-[.06em] text-muted"
          htmlFor={campoId}
        >
          {label}
        </label>
      )}

      {prefixo || sufixo ? (
        <div className="relative">
          {prefixo && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-gold-ink">
              {prefixo}
            </span>
          )}
          {campo}
          {sufixo && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-muted">
              {sufixo}
            </span>
          )}
        </div>
      ) : (
        campo
      )}

      {dica && <p className="m-0 mt-1.5 text-[12.5px] text-muted">{dica}</p>}
    </div>
  );
}
