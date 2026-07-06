export default function LoadingSpinner({ size = 'md', fullHeight = false, label }) {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-9 w-9 border-2', lg: 'h-12 w-12 border-3' };
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullHeight ? 'h-64' : 'py-10'}`}>
      <div className={`animate-spin rounded-full border-signal border-t-transparent ${sizes[size]}`} />
      {label && <p className="text-sm text-slate-soft">{label}</p>}
    </div>
  );
}
