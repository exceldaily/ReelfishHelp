/** Instant skeleton while any app page's server data loads — kills the blank-screen pause. */
export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-1 py-2" aria-busy aria-label="Loading">
      <div className="h-8 w-56 rounded-lg bg-sand-200/70" />
      <div className="mt-2 h-4 w-80 max-w-full rounded bg-sand-100" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl border border-sand-200/70 bg-white/70 p-4 shadow-card">
            <div className="h-4 w-2/3 rounded bg-sand-100" />
            <div className="mt-3 h-3 w-full rounded bg-sand-100/80" />
            <div className="mt-2 h-3 w-5/6 rounded bg-sand-100/80" />
            <div className="mt-6 h-8 w-24 rounded-lg bg-sand-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
