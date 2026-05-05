export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center pt-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
