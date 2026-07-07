"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RpsLogicGame } from "@/components/experiments/brain-garden/RpsLogicGame";

type GameId = "memory" | "stroop" | "schulte" | "rps";

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
  tags?: string[];
}> = [
  {
    id: "memory",
    title: "Memory Path",
    description: "Watch a quiet sequence, then repeat the path in order.",
    tags: ["Memory"],
  },
  {
    id: "stroop",
    title: "Stroop Focus",
    description: "Choose the ink color, not the word content.",
    tags: ["Focus"],
  },
  {
    id: "schulte",
    title: "Schulte Grid",
    description: "Find numbers in order with steady visual attention.",
    tags: ["Attention"],
  },
  {
    id: "rps",
    title: "RPS Logic",
    description: "Choose the move that creates the requested outcome.",
    tags: ["Logic", "Reaction", "Rule Switching"],
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
  const gamePanelRef = useRef<HTMLDivElement>(null);
  const hasSelectedGameRef = useRef(false);
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

  useEffect(() => {
    if (!hasSelectedGameRef.current) {
      hasSelectedGameRef.current = true;
      return;
    }

    if (!window.matchMedia("(max-width: 1023px)").matches) {
      return;
    }

    gamePanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [activeGame]);

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
    <main className="min-h-[100svh] overflow-x-hidden bg-[#f5f5f2] px-4 py-5 text-[#151515] sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-12">
        <header className="flex flex-col gap-4 border-b border-black/[0.07] pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-7 sm:pb-9">
          <div className="max-w-3xl">
            <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.24em] text-black/36 sm:mb-5 sm:text-[10px] sm:tracking-[0.28em]">
              Experiment
            </p>
            <h1 className="text-3xl font-medium tracking-[0.01em] text-black/82 sm:text-5xl">
              Brain Garden
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/52 sm:mt-6 sm:text-lg sm:leading-9">
              A small daily experiment for focus, memory, and attention. It is
              a mental warm-up, not a medical tool.
            </p>
          </div>

          <Link
            href="/#projects"
            className="inline-flex min-h-10 w-fit items-center rounded-full border border-black/[0.08] px-4 text-[10px] font-medium tracking-[0.14em] text-black/48 transition duration-300 hover:border-black/[0.14] hover:bg-white/35 hover:text-black/66 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:min-h-11 sm:px-5 sm:text-[11px] sm:tracking-[0.16em]"
          >
            Back to Hong's Space
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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

        <section className="grid gap-4 sm:gap-7 lg:grid-cols-[0.68fr_1.32fr]">
          <aside className="space-y-3 sm:space-y-5">
            <div>
              <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.2em] text-black/34 sm:mb-4 sm:text-[10px] sm:tracking-[0.22em]">
                Today's Session
              </p>
              <p className="hidden max-w-md text-sm leading-7 text-black/48 sm:block">
                Pick one exercise at a time. Each game is intentionally short
                and quiet.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1">
              {games.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => setActiveGame(game.id)}
                  className={`rounded-[14px] border p-3 text-left transition duration-300 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:rounded-[18px] sm:p-5 ${
                    activeGame === game.id
                      ? "border-black/[0.16] bg-white/[0.42] text-black/76 shadow-[0_1px_12px_rgba(0,0,0,0.035)]"
                      : "border-black/[0.06] bg-white/[0.14] text-black/52 hover:border-black/[0.11] hover:bg-white/[0.26]"
                  }`}
                >
                  <span className="block text-sm font-medium sm:text-base">
                    {game.title}
                  </span>
                  <span className="mt-3 hidden text-sm leading-6 text-black/45 sm:block">
                    {game.description}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                    {game.tags?.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-2 py-0.5 text-[8.5px] font-medium tracking-[0.08em] sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.12em] ${
                          activeGame === game.id
                            ? "border-black/[0.08] bg-white/[0.24] text-black/44"
                            : "border-black/[0.055] text-black/34"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                </button>
              ))}
            </div>

            <p className="hidden rounded-[18px] border border-black/[0.055] bg-white/[0.12] p-4 text-sm leading-7 text-black/48 sm:block">
              {latestResult}
            </p>
          </aside>

          <div
            ref={gamePanelRef}
            className="scroll-mt-4 rounded-[18px] border border-black/[0.065] bg-white/[0.24] p-3.5 shadow-[0_12px_42px_rgba(36,36,30,0.045)] backdrop-blur-xl sm:scroll-mt-8 sm:rounded-[22px] sm:p-7 sm:shadow-[0_18px_70px_rgba(36,36,30,0.055)] lg:p-8"
          >
            {activeGame === "memory" ? (
              <MemoryPathGame onComplete={recordResult} />
            ) : null}
            {activeGame === "stroop" ? (
              <StroopFocusGame onComplete={recordResult} />
            ) : null}
            {activeGame === "schulte" ? (
              <SchulteGridGame onComplete={recordResult} />
            ) : null}
            {activeGame === "rps" ? (
              <RpsLogicGame
                onComplete={(value, label) => recordResult("rps", value, label)}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-black/[0.07] pt-3 sm:pt-5">
      <p className="text-[8.5px] font-medium uppercase tracking-[0.14em] text-black/32 sm:text-[10px] sm:tracking-[0.2em]">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-medium text-black/72 sm:mt-3 sm:text-2xl">
        {value}
      </p>
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
    <div className="mb-4 border-b border-black/[0.045] pb-3 sm:mb-7 sm:pb-6">
      <p className="mb-2 hidden text-[10px] font-medium uppercase tracking-[0.22em] text-black/34 sm:block">
        Practice
      </p>
      <h2 className="text-xl font-medium text-black/78 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 hidden max-w-2xl text-sm leading-7 text-black/48 sm:block">
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
  const pressedTimeoutRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [pressedTile, setPressedTile] = useState<number | null>(null);
  const [feedbackTile, setFeedbackTile] = useState<{
    index: number;
    type: "correct" | "wrong";
  } | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [isShowing, setIsShowing] = useState(false);

  const clearFeedbackTimers = useCallback(() => {
    if (pressedTimeoutRef.current !== null) {
      window.clearTimeout(pressedTimeoutRef.current);
      pressedTimeoutRef.current = null;
    }

    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      clearFeedbackTimers();
    };
  }, [clearFeedbackTimers]);

  const startRound = useCallback(async () => {
    if (isShowing) return;

    clearFeedbackTimers();
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    const nextSequence = memorySequence(level + 2);

    setSequence(nextSequence);
    setInputIndex(0);
    setPressedTile(null);
    setFeedbackTile(null);
    setAccepting(false);
    setIsShowing(true);
    setStatus("Watch the path");
    await wait(420);

    for (const cell of nextSequence) {
      if (runIdRef.current !== runId) return;

      setActiveCell(cell);
      await wait(Math.max(360, 500 - level * 12));
      setActiveCell(null);
      await wait(140);
    }

    if (runIdRef.current !== runId) return;

    setStatus("Repeat the path");
    setAccepting(true);
    setIsShowing(false);
  }, [clearFeedbackTimers, isShowing, level]);

  const showPressedFeedback = useCallback(
    (cell: number) => {
      if (pressedTimeoutRef.current !== null) {
        window.clearTimeout(pressedTimeoutRef.current);
      }

      setPressedTile(cell);
      pressedTimeoutRef.current = window.setTimeout(() => {
        setPressedTile(null);
        pressedTimeoutRef.current = null;
      }, 120);
    },
    [],
  );

  const showResultFeedback = useCallback(
    (cell: number, type: "correct" | "wrong") => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }

      setFeedbackTile({ index: cell, type });
      feedbackTimeoutRef.current = window.setTimeout(
        () => {
          setFeedbackTile(null);
          feedbackTimeoutRef.current = null;
        },
        type === "correct" ? 220 : 420,
      );
    },
    [],
  );

  const handleCellClick = useCallback(
    (cell: number) => {
      if (!accepting) return;

      showPressedFeedback(cell);

      if (cell !== sequence[inputIndex]) {
        showResultFeedback(cell, "wrong");
        setAccepting(false);
        setIsShowing(false);
        setStatus("Try again. Score recorded.");
        onComplete("memory", score, `Memory Path recorded ${score} points.`);
        return;
      }

      showResultFeedback(cell, "correct");
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
        return;
      }

      setStatus(`Correct. ${sequence.length - nextInputIndex} left.`);
    },
    [
      accepting,
      inputIndex,
      level,
      onComplete,
      score,
      sequence,
      showPressedFeedback,
      showResultFeedback,
    ],
  );

  const reset = useCallback(() => {
    clearFeedbackTimers();
    runIdRef.current += 1;
    setLevel(1);
    setScore(0);
    setSequence([]);
    setInputIndex(0);
    setActiveCell(null);
    setPressedTile(null);
    setFeedbackTile(null);
    setAccepting(false);
    setIsShowing(false);
    setStatus("Ready");
  }, [clearFeedbackTimers]);

  const progressHint =
    accepting && sequence.length > 0
      ? `Step ${inputIndex + 1} of ${sequence.length}`
      : isShowing
        ? "Watch the path."
        : sequence.length > 0
          ? "Start the next path when ready."
          : "Start when ready.";

  return (
    <section>
      <GameHeader
        title="Memory Path"
        description="Watch a sequence of quiet cells. Repeat it in order after the lights stop."
      />

      <div className="mb-3 flex items-center justify-between gap-3 text-[11px] text-black/38 sm:mb-4 sm:text-xs">
        <p>{status}</p>
        <p className="text-right uppercase tracking-[0.1em] sm:tracking-[0.14em]">
          {progressHint}
        </p>
      </div>

      <div className="mx-auto max-w-[300px] rounded-[16px] border border-black/[0.045] bg-white/[0.12] p-2.5 sm:max-w-none sm:rounded-[20px] sm:p-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 16 }, (_, index) => {
          const feedbackType =
            feedbackTile?.index === index ? feedbackTile.type : null;
          const tileState =
            activeCell === index
              ? "showing"
              : feedbackType === "wrong"
                ? "wrong"
                : feedbackType === "correct"
                  ? "correct"
                  : pressedTile === index
                    ? "pressed"
                    : accepting
                      ? "idle"
                      : "disabled";
          const stateClass =
            tileState === "showing"
              ? "scale-[1.02] border-black/35 bg-black/[0.16] shadow-[0_1px_10px_rgba(0,0,0,0.055),inset_0_0_0_1px_rgba(255,255,255,0.18)] ring-1 ring-black/10"
              : tileState === "pressed"
                ? "scale-[0.965] border-black/24 bg-black/[0.08] shadow-[0_1px_8px_rgba(0,0,0,0.045),inset_0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-black/10"
                : tileState === "correct"
                  ? "scale-[1.018] border-emerald-950/24 bg-emerald-950/[0.07] shadow-[0_1px_10px_rgba(0,0,0,0.045)] ring-1 ring-emerald-950/14"
                  : tileState === "wrong"
                    ? "scale-[0.985] border-rose-950/28 bg-rose-950/[0.075] shadow-[0_1px_10px_rgba(0,0,0,0.045)] ring-1 ring-rose-950/18"
                    : tileState === "idle"
                      ? "border-black/[0.105] bg-white/[0.52] shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-black/[0.2] hover:bg-white/[0.68]"
                      : "cursor-default border-black/[0.075] bg-white/[0.28] opacity-76 shadow-[0_1px_6px_rgba(0,0,0,0.026)]";

          return (
            <button
              key={index}
              type="button"
              disabled={!accepting || isShowing}
              aria-label={`Memory path cell ${index + 1}`}
              onClick={() => handleCellClick(index)}
              className={`aspect-square touch-manipulation rounded-[12px] border transition duration-150 [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/18 disabled:pointer-events-none sm:rounded-[14px] ${stateClass}`}
            />
          );
        })}
        </div>
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
  { name: "red", label: "Red", value: "#ef4444" },
  { name: "blue", label: "Blue", value: "#2563eb" },
  { name: "green", label: "Green", value: "#16a34a" },
  { name: "yellow", label: "Yellow", value: "#eab308" },
  { name: "purple", label: "Purple", value: "#9333ea" },
  { name: "gray", label: "Gray", value: "#6b7280" },
];

type StroopColor = (typeof stroopColors)[number];

type StroopOption = {
  name: string;
  label: string;
  textColor: StroopColor;
};

type StroopQuestion = {
  wordText: StroopColor;
  inkColor: StroopColor;
  correctAnswer: string;
  options: StroopOption[];
};

function shuffledStroopColors(colors: StroopColor[]) {
  const values = [...colors];

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(index + 1);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values;
}

function randomStroopColorExcept(colorName: string) {
  const choices = stroopColors.filter((color) => color.name !== colorName);
  return choices[randomInteger(choices.length)];
}

function generateStroopQuestion(): StroopQuestion {
  const wordText = stroopColors[randomInteger(stroopColors.length)];
  const shouldForceMismatch = randomInteger(100) < 80;
  const inkColor = shouldForceMismatch
    ? randomStroopColorExcept(wordText.name)
    : stroopColors[randomInteger(stroopColors.length)];
  const distractors = shuffledStroopColors(
    stroopColors.filter((color) => color.name !== inkColor.name),
  ).slice(0, 3);
  const optionColors = shuffledStroopColors([inkColor, ...distractors]);

  return {
    wordText,
    inkColor,
    correctAnswer: inkColor.name,
    options: optionColors.map((color) => ({
      name: color.name,
      label: color.label,
      textColor: stroopColors[randomInteger(stroopColors.length)],
    })),
  };
}

function StroopFocusGame({
  onComplete,
}: {
  onComplete: (game: GameId, value: number, label: string) => void;
}) {
  const resultTimeoutRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [question, setQuestion] = useState<StroopQuestion | null>(null);

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current !== null) {
        window.clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  const nextQuestion = useCallback(() => {
    setQuestion(generateStroopQuestion());
  }, []);

  const start = useCallback(() => {
    setActive(true);
    setRound(1);
    setScore(0);
    if (resultTimeoutRef.current !== null) {
      window.clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
    setResult(null);
    setSelectedAnswer(null);
    setIsResolving(false);
    setStatus("Choose the text color");
    nextQuestion();
  }, [nextQuestion]);

  const answer = useCallback(
    (colorName: string) => {
      if (!active || !question || isResolving) return;

      const isCorrect = colorName === question.correctAnswer;
      const nextScore = isCorrect ? score + 1 : score;
      const nextRound = round + 1;
      setScore(nextScore);
      setSelectedAnswer(colorName);
      setResult(isCorrect ? "correct" : "wrong");
      setStatus(isCorrect ? "Correct" : "Wrong");
      setIsResolving(true);
      if (resultTimeoutRef.current !== null) {
        window.clearTimeout(resultTimeoutRef.current);
      }
      resultTimeoutRef.current = window.setTimeout(() => {
        setResult(null);
        setSelectedAnswer(null);
        setIsResolving(false);
        resultTimeoutRef.current = null;

        if (nextRound > 8) {
          setActive(false);
          setRound(8);
          setStatus(
            isCorrect ? "Correct. Score recorded." : "Wrong. Score recorded.",
          );
          onComplete(
            "stroop",
            nextScore,
            `Stroop Focus completed with ${nextScore} / 8 correct.`,
          );
          return;
        }

        setRound(nextRound);
        setStatus("Choose the text color");
        nextQuestion();
      }, isCorrect ? 480 : 720);
    },
    [active, isResolving, nextQuestion, onComplete, question, round, score],
  );

  const panelFeedbackClass =
    result === "correct"
      ? "border-green-600/28 bg-green-50/50"
      : result === "wrong"
        ? "border-red-600/28 bg-red-50/50"
        : "border-black/[0.06] bg-white/[0.18]";

  return (
    <section>
      <GameHeader
        title="Stroop Focus"
        description="Ignore the word content. Select the color the word is drawn in."
      />

      <div
        className={`grid min-h-32 place-items-center rounded-[16px] border p-4 text-center shadow-[0_1px_10px_rgba(0,0,0,0.025)] transition duration-200 sm:min-h-48 sm:rounded-[20px] sm:p-8 ${panelFeedbackClass}`}
      >
        <div>
          <p
            className="text-4xl font-semibold uppercase tracking-[0.02em] sm:text-7xl"
            style={{ color: question?.inkColor.value ?? "#151515" }}
          >
            {question?.wordText.label ?? "Ready"}
          </p>
          <p className="mt-2 text-[11px] tracking-[0.1em] text-black/38 sm:mt-5 sm:text-xs sm:tracking-[0.14em]">
            <span className="sm:hidden">Choose the text color.</span>
            <span className="hidden sm:inline">
              Choose the text color, not the word.
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4 sm:gap-3">
        {(question?.options ??
          stroopColors.slice(0, 4).map((color) => ({
            name: color.name,
            label: color.label,
            textColor: color,
          }))
        ).map((option) => {
          const isSelected = selectedAnswer === option.name;
          const isCorrectAnswer = question?.correctAnswer === option.name;
          const optionFeedbackClass =
            result === "correct" && isSelected
              ? "border-green-600/45 bg-green-50/65"
              : result === "wrong" && isSelected
                ? "border-red-600/45 bg-red-50/65"
                : result === "wrong" && isCorrectAnswer
                  ? "border-green-600/34 bg-green-50/45"
                  : "border-black/[0.08] bg-white/[0.2] hover:border-black/[0.16] hover:bg-white/[0.34]";

          return (
            <button
              key={option.name}
              type="button"
              disabled={!active || isResolving}
              onClick={() => answer(option.name)}
              className={`inline-flex min-h-11 items-center justify-center rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition duration-300 hover:-translate-y-px disabled:cursor-not-allowed sm:min-h-12 sm:px-4 sm:tracking-[0.14em] ${
                !active ? "opacity-45" : ""
              } ${optionFeedbackClass}`}
              style={{ color: option.textColor.value }}
            >
              {option.label}
            </button>
          );
        })}
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

      <div className="mb-3 grid grid-cols-3 gap-2 text-[11px] text-black/48 sm:mb-5 sm:flex sm:flex-wrap sm:gap-3 sm:text-sm">
        <span className="rounded-full border border-black/[0.06] bg-white/[0.14] px-2.5 py-1.5 text-center sm:px-4 sm:py-2">
          Next {next <= 25 ? next : "done"}
        </span>
        <span className="rounded-full border border-black/[0.06] bg-white/[0.14] px-2.5 py-1.5 text-center sm:px-4 sm:py-2">
          {elapsed.toFixed(1)}s
        </span>
        <span className="rounded-full border border-black/[0.06] bg-white/[0.14] px-2.5 py-1.5 text-center sm:px-4 sm:py-2">
          Errors {errors}
        </span>
      </div>

      <div className="mx-auto max-w-[320px] rounded-[16px] border border-black/[0.045] bg-white/[0.12] p-2 sm:max-w-none sm:rounded-[20px] sm:p-4">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
          {numbers.map((number) => {
            const isDone = doneNumbers.includes(number);

            return (
              <button
                key={number}
                type="button"
                onClick={() => handleClick(number)}
                className={`aspect-square rounded-[10px] border text-base font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:rounded-[12px] sm:text-2xl ${
                  isDone
                    ? "border-black/[0.045] bg-white/[0.12] text-black/22"
                    : "border-black/[0.105] bg-white/[0.52] text-black/64 shadow-[0_1px_8px_rgba(0,0,0,0.035)] hover:-translate-y-px hover:border-black/[0.18] hover:bg-white/[0.68]"
                }`}
              >
                {number}
              </button>
            );
          })}
        </div>
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
    <footer className="mt-4 flex flex-row flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-3 sm:mt-7 sm:gap-4 sm:pt-5">
      <div className="min-w-0 space-y-0.5 sm:space-y-1">
        <p className="max-w-[11rem] truncate text-xs text-black/58 sm:max-w-none sm:text-sm">
          {status}
        </p>
        <p className="text-[10px] uppercase tracking-[0.1em] text-black/34 sm:text-xs sm:tracking-[0.14em]">
          {stats}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {secondaryLabel && onSecondary ? (
          <button
            type="button"
            onClick={onSecondary}
            className="min-h-10 rounded-full border border-black/[0.07] px-4 text-[10px] font-medium uppercase tracking-[0.13em] text-black/42 transition duration-300 hover:border-black/[0.13] hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:min-h-11 sm:px-5 sm:text-[11px] sm:tracking-[0.16em]"
          >
            {secondaryLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={primaryDisabled}
          onClick={onPrimary}
          className="min-h-10 rounded-full border border-black/[0.085] bg-white/[0.2] px-4 text-[10px] font-medium uppercase tracking-[0.13em] text-black/58 transition duration-300 hover:border-black/[0.15] hover:bg-white/[0.36] hover:text-black/74 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:min-h-11 sm:px-5 sm:text-[11px] sm:tracking-[0.16em]"
        >
          {primaryLabel}
        </button>
      </div>
    </footer>
  );
}
