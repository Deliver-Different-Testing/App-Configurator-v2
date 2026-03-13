interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  label?: string;
}

export type { ToggleProps };

export function Toggle({ checked, onChange, size = 'md', disabled = false, className = '', label }: ToggleProps) {
  const sizeStyles = {
    sm: {
      track: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5',
    },
    md: {
      track: 'w-12 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-6',
    },
  };

  const styles = sizeStyles[size];

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        ${styles.track}
        relative inline-flex shrink-0 cursor-pointer rounded-full
        transition-colors duration-normal ease-in-out
        focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-gradient-to-r from-brand-cyan to-brand-purple' : 'bg-border'}
        ${className}
      `}
    >
      <span
        className={`
          ${styles.thumb}
          pointer-events-none inline-block rounded-full bg-white shadow-md
          transform transition-transform duration-normal ease-in-out
          ${checked ? styles.translate : 'translate-x-0.5'}
          mt-0.5
        `}
      />
    </button>
  );

  if (label) {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        {toggle}
        <span className="text-sm text-text-secondary">{label}</span>
      </label>
    );
  }

  return toggle;
}
