"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#07301A] text-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-amber-400 text-black rounded-lg font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
