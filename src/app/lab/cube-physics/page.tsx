import HeroCanvas from "@/components/hero/HeroCanvas";

export default function CubePhysicsLabPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#151515]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <div className="mb-6 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-black/38">
            Physics Lab
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[0.02em] text-black/82 sm:text-5xl">
            Glass Cube Physics
          </h1>
        </div>

        <div className="relative min-h-[620px] flex-1 overflow-hidden rounded-[34px] border border-white/70 bg-white/38 shadow-[0_28px_100px_rgba(0,0,0,0.07)] backdrop-blur-xl">
          <HeroCanvas />
        </div>
      </section>
    </main>
  );
}
