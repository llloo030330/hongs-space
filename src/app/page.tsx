import Link from "next/link";

const options = [
  {
    title: "测试词汇量",
    href: "/vocabulary-test",
    available: true,
  },
  {
    title: "开始阅读",
    href: "#",
    available: false,
  },
  {
    title: "记忆词表",
    href: "#",
    available: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-[#eeeeea] text-[#161815]">
      <section className="grid min-h-[100dvh] place-items-center px-6">
        <h1 className="max-w-[11ch] text-center text-6xl font-semibold leading-[0.96] sm:text-8xl lg:text-[10rem]">
          阅读环境中重复记忆
        </h1>
      </section>

      <section className="mx-auto grid min-h-[100dvh] w-full max-w-6xl content-center gap-5 px-5 py-24 sm:px-8">
        {options.map((option) =>
          option.available ? (
            <Link
              className="group grid min-h-32 grid-cols-1 items-end border border-[#161815]/10 bg-[#f7f7f2] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-[#161815]/24 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3f5f4a]/40 sm:min-h-40 sm:grid-cols-[1fr_auto] sm:p-8"
              href={option.href}
              key={option.title}
            >
              <span className="text-3xl font-medium sm:text-5xl">
                {option.title}
              </span>
              <span className="mt-8 text-sm font-medium text-[#3f5f4a] transition duration-300 group-hover:translate-x-1 sm:mt-0">
                进入
              </span>
            </Link>
          ) : (
            <button
              aria-disabled="true"
              className="grid min-h-32 cursor-not-allowed grid-cols-1 items-end border border-[#161815]/8 bg-[#e6e5df] p-6 text-left text-[#161815]/38 sm:min-h-40 sm:grid-cols-[1fr_auto] sm:p-8"
              key={option.title}
              type="button"
            >
              <span className="text-3xl font-medium sm:text-5xl">
                {option.title}
              </span>
              <span className="mt-8 text-sm font-medium sm:mt-0">稍后开放</span>
            </button>
          ),
        )}
      </section>
    </main>
  );
}
