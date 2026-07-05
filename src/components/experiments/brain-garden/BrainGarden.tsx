"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type GameId = "memory" | "stroop" | "schulte";

type BrainStats = {
  bestMemoryScore: number;
  bestStroopScore: number;
  bestSchulteTime: number | null;
  sessions: number;
  lastPlayed: string;
};

const STORAGE_KEY = "hongs-space-brain-garden-v1";

const initialStats: BrainStats = {
  bestMemoryScore: 0,
  bestStroopScore: 0,
  bestSchulteTime: null,
  sessions: 0,
  lastPlayed: "",
};

const initialSchulteNumbers = Array.from({ length: 25 }, (_, index) => index + 1);

const games: Array<{
  id: GameId;
  title: string;
  description: string;
}> = [
  {
    id: "memory",
    title: "Memory Path",
    description: "Watch a quiet sequence, then repeat the path in order.",
  },
  {
    id: "stroop",
    title: "Stroop Focus",
    description: "Choose the ink color, not the word content.",
  },
  {
    id: "schulte",
    title: "Schulte Grid",
    description: "Find numbers in order with steady visual attention.",
  },
];

function safeJsonParse(value: string | null): BrainStats {
  if (!value) return initialStats;

  try {
    const parsed = JSON.parse(value);

    if (!parsed || typeof parsed !== "object") return initialStats;

    return {
      bestMemoryScore:
        typeof parsed.bestMemoryScore === "number"
          ? parsed.bestMemoryScore
          : 0,
      bestStroopScore:
        typeof parsed.bestStroopScore === "number" ? parsed.bestStroopScore : 0,
      bestSchulteTime:
        typeof parsed.bestSchulteTime === "number"
          ? parsed.bestSchulteTime
          : null,
      sessions: typeof parsed.sessions === "number" ? parsed.sessions : 0,
      lastPlayed: typeof parsed.lastPlayed === "string" ? parsed.lastPlayed : "",
    };
  } catch {
    return initialStats;
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function randomInteger(max: number) {
  return Math.floor(Math.random() * max);
}

function shuffledNumbers(size: number) {
  const values = Array.from({ length: size }, (_, index) => index + 1);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(index + 1);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values;
}

function memorySequence(length: number) {
  const sequence: number[] = [];

  while (sequence.length < length) {
    const value = randomInteger(16);

    if (value !== sequence[sequence.length - 1]) {
      sequence.push(value);
    }
  }

  return sequence;
}

export function BrainGarden() {
  const [activeGame, setActiveGame] = useState<GameId>("memory");
  const [stats, setStats] = useState<BrainStats>(initialStats);
  const [isLoaded, setIsLoaded] = useState(false);
  const [latestResult, setLatestResult] = useState("Start a short session.");

  useEffect(() => {
    setStats(safeJsonParse(window.localStorage.getItem(STORAGE_KEY)));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [isLoaded, stats]);

  const recordResult = useCallback(
    (game: GameId, value: number, label: string) => {
      setLatestResult(label);
      setStats((current) => ({
        bestMemoryScore:
          game === "memory"
            ? Math.max(current.bestMemoryScore, value)
            : current.bestMemoryScore,
        bestStroopScore:
          game === "stroop"
            ? Math.max(current.bestStroopScore, value)
            : current.bestStroopScore,
        bestSchulteTime:
          game === "schulte"
            ? current.bestSchulteTime === null
              ? value
              : Math.min(current.bestSchulteTime, value)
            : current.bestSchulteTime,
        sessions: current.sessions + 1,
        lastPlayed: todayKey(),
      }));
    },
    [],
  );

  return (
    <main className="min-h-[100dvh] bg-[#f5f5f2] px-6 py-10 text-[#151515] sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex flex-col gap-8 border-b border-black/[0.07] pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.28em] text-black/36">
              Experiment
            </p>
            <h1 className="text-4xl font-medium tracking-[0.01em] text-black/82 sm:text-6xl">
              Brain Garden
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-black/52 sm:text-lg sm:leading-9">
              A small daily experiment for focus, memory, and attention. It is
              a mental warm-up, not a medical tool.
            </p>
          </div>

          <Link
            href="/#projects"
            className="inline-flex min-h-11 w-fit items-center rounded-full border border-black/[0.08] px-5 text-[11px] font-medium tracking-[0.16em] text-black/48 transition duration-300 hover:border-black/[0.14] hover:bg-white/35 hover:text-black/66 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
          >
            Back to Hong's Space
          </Link>
        </header>

        <section className="grid gap-5 md:grid-cols-4">
          <Metric label="Memory best" value={`${stats.bestMemoryScore}`} />
          <Metric label="Stroop best" value={`${stats.bestStroopScore}`} />
          <Metric
            label="Schulte best"
            value={
              stats.bestSchulteTime === null
                ? "--"
                : `${stats.bestSchulteTime.toFixed(1)}s`
            }
          />
          <Metric label="Sessions" value={`${stats.sessions}`} />
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-4">
            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
                Today's Session
              </p>
              <p className="max-w-md text-sm leading-7 text-black/48">
                Pick one exercise at a time. Each game is intentionally short
                and quiet.
              </p>
            </div>

            <div className="grid gap-3">
              {games.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => setActiveGame(game.id)}
                  className={`rounded-[18px] border p-5 text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 ${
                    activeGame === game.id
                      ? "border-black/[0.16] bg-white/[0.36] text-black/76"
                      : "border-black/[0.06] bg-white/[0.14] text-black/52 hover:border-black/[0.11] hover:bg-white/[0.24]"
                  }`}
                >
                  <span className="block text-base font-medium">
                    {game.title}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-black/45">
                    {game.description}
                  </span>
                </button>
              ))}
            </div>

            <p className="border-y border-black/[0.06] py-5 text-sm leading-7 text-black/48">
              {latestResult}
            </p>
          </aside>

          <div className="rounded-[24px] border border-black/[0.07] bg-white/[0.2] p-5 backdrop-blur-xl sm:p-8">
            {activeGame === "memory" ? (
              <MemoryPathGame onComplete={recordResult} />
            ) : null}
            {activeGame === "stroop" ? (
              <StroopFocusGame onComplete={recordResult} />
            ) : null}
            {activeGame === "schulte" ? (
              <SchulteGridGame onComplete={recordResult} />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-black/[0.07] pt-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/32">
        {label}
      </p>
      <p className="mt-3 text-2xl font-medium text-black/72">{value}</p>
    </div>
  );
}

function GameHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
        Practice
      </p>
      <h2 className="text-2xl font-medium text-black/78 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-black/48">
        {description}
      </p>
    </div>
  );
}

function MemoryPathGame({
  onComplete,
}: {
  onComplete: (game: GameId, value: number, label: string) => void;
}) {
  const runIdRef = useRef(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
    };
  }, []);

  const startRound = useCallback(async () => {
    if (isShowing) return;

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    const nextSequence = memorySequence(level + 2);

    setSequence(nextSequence);
    setInputIndex(0);
    setAccepting(false);
    setIsShowing(true);
    setStatus("Watch the path");
    await wait(420);

    for (const cell of nextSequence) {
      if (runIdRef.current !== runId) return;

      setActiveCell(cell);
      await wait(Math.max(230, 520 - level * 24));
      setActiveCell(null);
      await wait(110);
    }

    if (runIdRef.current !== runId) return;

    setStatus("Repeat the path");
    setAccepting(true);
    setIsShowing(false);
  }, [isShowing, level]);

  const handleCellClick = useCallback(
    (cell: number) => {
      if (!accepting) return;

      if (cell !== sequence[inputIndex]) {
        setAccepting(false);
        setIsShowing(false);
        setStatus("Path ended. Score recorded.");
        onComplete("memory", score, `Memory Path recorded ${score} points.`);
        return;
      }

      const nextInputIndex = inputIndex + 1;
      setInputIndex(nextInputIndex);

      if (nextInputIndex === sequence.length) {
        const nextScore = score + sequence.length * 10;
        const nextLevel = level + 1;
        setScore(nextScore);
        setAccepting(false);

        if (nextLevel > 5) {
          setStatus("Complete. Score recorded.");
          onComplete(
            "memory",
            nextScore,
            `Memory Path completed with ${nextScore} points.`,
          );
          return;
        }

        setLevel(nextLevel);
        setStatus("Correct. Start the next path.");
      }
    },
    [accepting, inputIndex, level, onComplete, score, sequence],
  );

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setLevel(1);
    setScore(0);
    setSequence([]);
    setInputIndex(0);
    setActiveCell(null);
    setAccepting(false);
    setIsShowing(false);
    setStatus("Ready");
  }, []);

  return (
    <section>
      <GameHeader
        title="Memory Path"
        description="Watch a sequence of quiet cells. Repeat it in order after the lights stop."
      />

      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 16 }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Memory path cell ${index + 1}`}
            onClick={() => handleCellClick(index)}
            className={`aspect-square rounded-[16px] border transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 ${
              activeCell === index
                ? "border-black/25 bg-black/[0.18]"
                : "border-black/[0.06] bg-white/[0.22] hover:border-black/[0.12]"
            }`}
          />
        ))}
      </div>

      <GameFooter
        status={status}
        stats={`Level ${level} / Score ${score}`}
        primaryLabel={sequence.length ? "Next Path" : "Start Path"}
        primaryDisabled={isShowing || accepting}
        onPrimary={startRound}
        secondaryLabel="Reset"
        onSecondary={reset}
      />
    </section>
  );
}

const stroopColors = [
  { name: "black", value: "#151515" },
  { name: "gray", value: "#73736d" },
  { name: "blue", value: "#4c6375" },
  { name: "green", value: "#5f6f5c" },
];

function StroopFocusGame({
  onComplete,
}: {
  onComplete: (game: GameId, value: number, label: string) => void;
}) {
  const [active, setActive] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [prompt, setPrompt] = useState<{
    word: string;
    ink: string;
    value: string;
  } | null>(null);

  const nextPrompt = useCallback(() => {
    const word = stroopColors[randomInteger(stroopColors.length)];
    let ink = stroopColors[randomInteger(stroopColors.length)];

    while (ink.name === word.name) {
      ink = stroopColors[randomInteger(stroopColors.length)];
    }

    setPrompt({ word: word.name, ink: ink.name, value: ink.value });
  }, []);

  const start = useCallback(() => {
    setActive(true);
    setRound(1);
    setScore(0);
    setStatus("Choose the ink color");
    nextPrompt();
  }, [nextPrompt]);

  const answer = useCallback(
    (colorName: string) => {
      if (!active || !prompt) return;

      const nextScore = colorName === prompt.ink ? score + 1 : score;
      const nextRound = round + 1;
      setScore(nextScore);

      if (nextRound > 8) {
        setActive(false);
        setRound(8);
        setStatus("Complete. Score recorded.");
        onComplete(
          "stroop",
          nextScore,
          `Stroop Focus completed with ${nextScore} / 8 correct.`,
        );
        return;
      }

      setRound(nextRound);
      setStatus(colorName === prompt.ink ? "Correct" : "Missed");
      nextPrompt();
    },
    [active, nextPrompt, onComplete, prompt, round, score],
  );

  return (
    <section>
      <GameHeader
        title="Stroop Focus"
        description="Ignore the word content. Select the color the word is drawn in."
      />

      <div className="grid min-h-48 place-items-center rounded-[20px] border border-black/[0.06] bg-white/[0.18] p-8 text-center">
        <p
          className="text-5xl font-medium capitalize tracking-[0.02em] sm:text-7xl"
          style={{ color: prompt?.value ?? "#151515" }}
        >
          {prompt?.word ?? "Ready"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stroopColors.map((color) => (
          <button
            key={color.name}
            type="button"
            disabled={!active}
            onClick={() => answer(color.name)}
            className="min-h-12 rounded-full border border-black/[0.07] bg-white/[0.16] text-[11px] font-medium uppercase tracking-[0.16em] text-black/52 transition duration-300 hover:border-black/[0.13] hover:bg-white/[0.28] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {color.name}
          </button>
        ))}
      </div>

      <GameFooter
        status={status}
        stats={`Round ${active ? round : 0} / Score ${score}`}
        primaryLabel="Start Stroop"
        primaryDisabled={active}
        onPrimary={start}
      />
    </section>
  );
}

function SchulteGridGame({
  onComplete,
}: {
  onComplete: (game: GameId, value: number, label: string) => void;
}) {
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const [numbers, setNumbers] = useState<number[]>(initialSchulteNumbers);
  const [active, setActive] = useState(false);
  const [next, setNext] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [doneNumbers, setDoneNumbers] = useState<number[]>([]);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = null;
    setNumbers(shuffledNumbers(25));
    setActive(false);
    setNext(1);
    setElapsed(0);
    setErrors(0);
    setDoneNumbers([]);
    setStatus("Ready");
  }, []);

  const start = useCallback(() => {
    reset();
    startRef.current = performance.now();
    setActive(true);
    setStatus("Find 1");
    timerRef.current = window.setInterval(() => {
      setElapsed((performance.now() - startRef.current) / 1000);
    }, 100);
  }, [reset]);

  const handleClick = useCallback(
    (number: number) => {
      if (!active || doneNumbers.includes(number)) return;

      if (number !== next) {
        setErrors((current) => current + 1);
        setStatus(`Find ${next}`);
        return;
      }

      const nextNumber = next + 1;
      setDoneNumbers((current) => [...current, number]);
      setNext(nextNumber);

      if (nextNumber > 25) {
        const finalTime = Number(
          ((performance.now() - startRef.current) / 1000).toFixed(1),
        );

        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
        }

        timerRef.current = null;
        setActive(false);
        setElapsed(finalTime);
        setStatus("Complete. Time recorded.");
        onComplete(
          "schulte",
          finalTime,
          `Schulte Grid completed in ${finalTime.toFixed(1)}s with ${errors} errors.`,
        );
        return;
      }

      setStatus(`Find ${nextNumber}`);
    },
    [active, doneNumbers, errors, next, onComplete],
  );

  return (
    <section>
      <GameHeader
        title="Schulte Grid"
        description="Find 1 to 25 in order. The goal is steady attention, not frantic speed."
      />

      <div className="mb-5 flex flex-wrap gap-3 text-sm text-black/48">
        <span className="rounded-full border border-black/[0.06] px-4 py-2">
          Next {next <= 25 ? next : "done"}
        </span>
        <span className="rounded-full border border-black/[0.06] px-4 py-2">
          {elapsed.toFixed(1)}s
        </span>
        <span className="rounded-full border border-black/[0.06] px-4 py-2">
          Errors {errors}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {numbers.map((number) => {
          const isDone = doneNumbers.includes(number);

          return (
            <button
              key={number}
              type="button"
              onClick={() => handleClick(number)}
              className={`aspect-square rounded-[14px] border text-lg font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:text-2xl ${
                isDone
                  ? "border-black/[0.04] bg-white/[0.08] text-black/20"
                  : "border-black/[0.07] bg-white/[0.2] text-black/62 hover:border-black/[0.14] hover:bg-white/[0.32]"
              }`}
            >
              {number}
            </button>
          );
        })}
      </div>

      <GameFooter
        status={status}
        stats={`Time ${elapsed.toFixed(1)}s / Errors ${errors}`}
        primaryLabel="Start Grid"
        primaryDisabled={active}
        onPrimary={start}
        secondaryLabel="Reset"
        onSecondary={reset}
      />
    </section>
  );
}

function GameFooter({
  status,
  stats,
  primaryLabel,
  primaryDisabled = false,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  status: string;
  stats: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <footer className="mt-7 flex flex-col gap-4 border-t border-black/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm text-black/58">{status}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-black/34">
          {stats}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {secondaryLabel && onSecondary ? (
          <button
            type="button"
            onClick={onSecondary}
            className="min-h-11 rounded-full border border-black/[0.07] px-5 text-[11px] font-medium uppercase tracking-[0.16em] text-black/42 transition duration-300 hover:border-black/[0.13] hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
          >
            {secondaryLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={primaryDisabled}
          onClick={onPrimary}
          className="min-h-11 rounded-full border border-black/[0.085] bg-white/[0.2] px-5 text-[11px] font-medium uppercase tracking-[0.16em] text-black/58 transition duration-300 hover:border-black/[0.15] hover:bg-white/[0.36] hover:text-black/74 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
        >
          {primaryLabel}
        </button>
      </div>
    </footer>
  );
}
