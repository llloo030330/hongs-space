import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[100svh] bg-[#f5f5f2] px-6 py-10 text-[#151515]">
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-xl flex-col items-center justify-center text-center">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.26em] text-black/30">
          404
        </p>
        <h1 className="text-3xl font-medium tracking-[0.01em] text-black/78 sm:text-5xl">
          Lost in space.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-black/48 sm:text-base sm:leading-8">
          This page does not exist, or it has drifted away.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full border border-black/[0.08] bg-white/[0.18] px-5 text-[11px] font-medium uppercase tracking-[0.16em] text-black/50 transition duration-300 hover:border-black/[0.14] hover:bg-white/35 hover:text-black/68 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
        >
          Back to Hong&apos;s Space
        </Link>
      </div>
    </main>
  );
}
