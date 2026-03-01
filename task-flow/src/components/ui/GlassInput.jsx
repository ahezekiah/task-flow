export function GlassInput({ className = "", label, error, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`glass-input ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: "rgba(252, 165, 165, 0.8)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function GlassTextarea({ className = "", label, error, id, rows = 3, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`glass-input resize-none ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: "rgba(252, 165, 165, 0.8)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function GlassSelect({ className = "", label, error, id, children, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`glass-input glass-select ${className}`}
        style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs" style={{ color: "rgba(252, 165, 165, 0.8)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
