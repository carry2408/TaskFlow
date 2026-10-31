export function StatusBadge({ status }) {
  const config = {
    TO_DO: { label: 'To Do', bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-sky-950/70', text: 'text-sky-300', border: 'border-sky-800' },
    IN_REVIEW: { label: 'In Review', bg: 'bg-amber-950/70', text: 'text-amber-300', border: 'border-amber-800' },
    DONE: { label: 'Done', bg: 'bg-emerald-950/70', text: 'text-emerald-300', border: 'border-emerald-800' },
    BLOCKED: { label: 'Blocked', bg: 'bg-rose-950/70', text: 'text-rose-300', border: 'border-rose-800' },
  }[status] || { label: status, bg: 'bg-surface-muted', text: 'text-gray-300', border: 'border-surface-border' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}

export function PriorityIndicator({ priority }) {
  const config = {
    CRITICAL: { label: 'Critical', text: 'text-red-400' },
    HIGH: { label: 'High', text: 'text-amber-400' },
    MEDIUM: { label: 'Medium', text: 'text-sky-400' },
    LOW: { label: 'Low', text: 'text-slate-400' },
  }[priority] || { label: priority, text: 'text-slate-400' };

  return (
    <span className={`inline-flex items-center text-xs font-medium ${config.text}`}>
      {config.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  return (
    <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase bg-surface-muted px-1.5 py-0.5 rounded border border-surface-border">
      {type?.replace('_', ' ')}
    </span>
  );
}

export function Avatar({ user, size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size] || 'w-6 h-6 text-xs';

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || '?';

  return (
    <div
      title={user?.fullName || user?.username || 'Unassigned'}
      className={`${sizeClasses} rounded-full bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-medium select-none flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variantStyles = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white border-transparent disabled:bg-brand-600/50',
    secondary: 'bg-surface-muted hover:bg-surface-hover text-gray-200 border-surface-border',
    danger: 'bg-red-900/60 hover:bg-red-800 text-red-100 border-red-800/80',
    ghost: 'bg-transparent hover:bg-surface-hover text-gray-300 border-transparent',
  }[variant];

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size];

  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs font-medium text-gray-300">{label}</label>}
      <input
        className={`bg-surface border border-surface-border rounded px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs font-medium text-gray-300">{label}</label>}
      <select
        className={`bg-surface border border-surface-border rounded px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-brand-500 transition-colors ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[1px]">
      <div className="bg-surface-card border border-surface-border rounded-lg shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-3.5 border-b border-surface-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-lg leading-none p-1 focus:outline-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-surface-border rounded-lg">
      {Icon && <Icon className="w-10 h-10 text-gray-500 mb-3" />}
      <h4 className="text-sm font-medium text-gray-200 mb-1">{title}</h4>
      {description && <p className="text-xs text-gray-400 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface-muted rounded ${className}`} />;
}

