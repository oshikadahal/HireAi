export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center text-center py-14">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-signal/10 flex items-center justify-center mb-4">
          <Icon size={26} className="text-signal" />
        </div>
      )}
      <h3 className="font-display font-semibold text-slate-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-soft max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
