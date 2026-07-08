"use client";

/**
 * Root error boundary. Renders when an unhandled error escapes the root layout
 * (so it must supply its own <html>/<body>). Keeps a branded, friendly screen
 * instead of Next's default crash page, and gives the user a way to recover.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#0f2a33",
          color: "#e7f0f1",
          fontFamily: '"Segoe UI", -apple-system, system-ui, sans-serif',
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", lineHeight: 1 }} aria-hidden>
            🎣
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "16px 0 8px" }}>
            Line snapped on our end
          </h1>
          <p style={{ color: "#8aa6ae", lineHeight: 1.5, margin: "0 0 20px" }}>
            Something went wrong loading this page. It&apos;s us, not you — try again, and if it keeps
            happening, head back to the home screen.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => reset()}
              style={{
                background: "#0e7490",
                color: "#fff",
                border: 0,
                borderRadius: "12px",
                padding: "12px 20px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/home"
              style={{
                background: "transparent",
                color: "#e7f0f1",
                border: "1px solid #385660",
                borderRadius: "12px",
                padding: "12px 20px",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
          {error?.digest && (
            <p style={{ marginTop: "20px", fontSize: "0.75rem", color: "#5b7480" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
