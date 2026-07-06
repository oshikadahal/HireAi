export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-ink">{title}</h1>
        {subtitle && <p className="text-slate-soft text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
