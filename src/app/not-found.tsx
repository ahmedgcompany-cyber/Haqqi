import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel surface-border w-full max-w-xl rounded-[2rem] p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-balance text-foreground">
          This page could not be found.
        </h1>
        <p className="mt-3 text-muted">
          Try returning to the bilingual home page and continue from there.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/en"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Go to Haqqi
          </Link>
        </div>
      </div>
    </main>
  );
}