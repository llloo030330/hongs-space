"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RpsMove = "Rock" | "Paper" | "Scissors";
type RpsOutcome = "Win" | "Draw" | "Lose";

type RpsQuestion = {
  opponentMove: RpsMove;
  targetOutcome: RpsOutcome;
  correctMove: RpsMove;
};

const moves: RpsMove[] = ["Rock", "Paper", "Scissors"];
const outcomes: RpsOutcome[] = ["Win", "Draw", "Lose"];
const winningMoveAgainst: Record<RpsMove, RpsMove> = {
  Rock: "Paper",
  Paper: "Scissors",
  Scissors: "Rock",
};
const losingMoveAgainst: Record<RpsMove, RpsMove> = {
  Rock: "Scissors",
  Paper: "Rock",
  Scissors: "Paper",
};
const moveImages: Record<RpsMove, string> = {
  Rock: "/experiments/rps/rock.png",
  Paper: "/experiments/rps/paper.png",
  Scissors: "/experiments/rps/scissors.png",
};

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

export function getCorrectMove(
  opponentMove: RpsMove,
  targetOutcome: RpsOutcome,
) {
  if (targetOutcome === "Draw") return opponentMove;
  if (targetOutcome === "Win") return winningMoveAgainst[opponentMove];
  return losingMoveAgainst[opponentMove];
}

function createQuestion(): RpsQuestion {
  const opponentMove = moves[randomIndex(moves.length)];
  const targetOutcome = outcomes[randomIndex(outcomes.length)];

  return {
    opponentMove,
    targetOutcome,
    correctMove: getCorrectMove(opponentMove, targetOutcome),
  };
}

function RpsMoveImage({
  move,
  className = "",
}: {
  move: RpsMove;
  className?: string;
}) {
  return (
    <span
      className={`grid place-items-center rounded-[16px] border border-black/[0.045] bg-white/[0.48] ${className}`}
    >
      <img
        src={moveImages[move]}
        alt=""
        width={72}
        height={72}
        aria-hidden="true"
        draggable={false}
        loading="eager"
        sizes="72px"
        className="h-[78%] w-[78%] object-contain opacity-95"
      />
    </span>
  );
}

export function RpsLogicGame({
  onComplete,
}: {
  onComplete: (value: number, label: string) => void;
}) {
  const feedbackTimeoutRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<RpsQuestion | null>(null);
  const [selectedMove, setSelectedMove] = useState<RpsMove | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const clearFeedback = useCallback(() => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }

    setSelectedMove(null);
    setResult(null);
  }, []);

  const start = useCallback(() => {
    clearFeedback();
    setActive(true);
    setRound(1);
    setScore(0);
    setQuestion(createQuestion());
    setStatus("Choose the move for the target outcome.");
  }, [clearFeedback]);

  const answer = useCallback(
    (move: RpsMove) => {
      if (!active || !question || result) return;

      const isCorrect = move === question.correctMove;
      const nextScore = isCorrect ? score + 1 : score;
      const nextRound = round + 1;

      setSelectedMove(move);
      setResult(isCorrect ? "correct" : "wrong");
      setScore(nextScore);
      setStatus(isCorrect ? "Correct" : "Try again");

      feedbackTimeoutRef.current = window.setTimeout(
        () => {
          setSelectedMove(null);
          setResult(null);
          feedbackTimeoutRef.current = null;

          if (nextRound > 8) {
            setActive(false);
            setRound(8);
            setStatus("Complete. Score recorded.");
            onComplete(
              nextScore,
              `RPS Logic completed with ${nextScore} / 8 correct.`,
            );
            return;
          }

          setRound(nextRound);
          setQuestion(createQuestion());
          setStatus("Choose the move for the target outcome.");
        },
        isCorrect ? 480 : 720,
      );
    },
    [active, onComplete, question, result, round, score],
  );

  const panelFeedbackClass =
    result === "correct"
      ? "border-green-600/24 bg-green-50/45"
      : result === "wrong"
        ? "border-red-600/24 bg-red-50/45"
        : "border-black/[0.06] bg-white/[0.18]";

  return (
    <section>
      <div className="mb-4 border-b border-black/[0.045] pb-3 sm:mb-7 sm:pb-6">
        <p className="mb-2 hidden text-[10px] font-medium uppercase tracking-[0.22em] text-black/34 sm:block">
          Practice
        </p>
        <h2 className="text-xl font-medium text-black/78 sm:text-3xl">
          RPS Logic
        </h2>
        <p className="mt-2 text-xs leading-5 text-black/48 sm:mt-4 sm:max-w-2xl sm:text-sm sm:leading-7">
          <span className="sm:hidden">Match the goal.</span>
          <span className="hidden sm:inline">
            Choose the move that matches the target outcome.
          </span>
        </p>
      </div>

      <div
        className={`grid grid-cols-2 gap-2 rounded-[16px] border p-2.5 shadow-[0_1px_10px_rgba(0,0,0,0.025)] transition duration-200 sm:gap-4 sm:rounded-[20px] sm:p-5 ${panelFeedbackClass}`}
      >
        <div className="rounded-[13px] border border-black/[0.055] bg-white/[0.2] p-3 sm:rounded-[16px] sm:p-5">
          <p className="text-[8.5px] font-medium uppercase tracking-[0.16em] text-black/34 sm:text-[10px] sm:tracking-[0.2em]">
            Opponent
          </p>
          {question ? (
            <div className="mt-2 flex items-center gap-2 text-black/74 sm:mt-4 sm:flex-col sm:items-start sm:gap-3">
              <RpsMoveImage
                move={question.opponentMove}
                className="size-11 sm:size-18"
              />
              <p className="text-base font-medium sm:text-3xl">
                {question.opponentMove}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xl font-medium text-black/38 sm:mt-4 sm:text-3xl">
              --
            </p>
          )}
        </div>

        <div className="rounded-[13px] border border-black/[0.055] bg-white/[0.2] p-3 sm:rounded-[16px] sm:p-5">
          <p className="text-[8.5px] font-medium uppercase tracking-[0.16em] text-black/34 sm:text-[10px] sm:tracking-[0.2em]">
            Goal
          </p>
          <p className="mt-3 text-xl font-medium text-black/76 sm:mt-4 sm:text-3xl">
            {question?.targetOutcome ?? "--"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
        {moves.map((move) => {
          const isSelected = selectedMove === move;
          const isCorrectAnswer = question?.correctMove === move;
          const feedbackClass =
            result === "correct" && isSelected
              ? "border-green-600/42 bg-green-50/58 text-black/74"
              : result === "wrong" && isSelected
                ? "border-red-600/42 bg-red-50/58 text-black/74"
                : result === "wrong" && isCorrectAnswer
                  ? "border-green-600/30 bg-green-50/42 text-black/68"
                  : "border-black/[0.08] bg-white/[0.2] text-black/58 hover:border-black/[0.16] hover:bg-white/[0.34]";

          return (
            <button
              key={move}
              type="button"
              disabled={!active || result !== null}
              onClick={() => answer(move)}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-[14px] border px-2 py-3 text-[10px] font-medium uppercase tracking-[0.12em] transition duration-300 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-36 sm:gap-3 sm:rounded-[18px] sm:px-5 sm:py-5 sm:text-[12px] sm:tracking-[0.16em] ${feedbackClass}`}
            >
              <RpsMoveImage move={move} className="size-11 sm:size-14" />
              <span>{move}</span>
            </button>
          );
        })}
      </div>

      <footer className="mt-4 flex flex-row flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-3 sm:mt-7 sm:gap-4 sm:pt-5">
        <div className="min-w-0 space-y-0.5 sm:space-y-1">
          <p className="max-w-[11rem] truncate text-xs text-black/58 sm:max-w-none sm:text-sm">
            {status}
          </p>
          <p className="text-[10px] uppercase tracking-[0.1em] text-black/34 sm:text-xs sm:tracking-[0.14em]">
            Round {active ? round : 0} / Score {score}
          </p>
        </div>

        <button
          type="button"
          disabled={active}
          onClick={start}
          className="min-h-10 rounded-full border border-black/[0.085] bg-white/[0.2] px-4 text-[10px] font-medium uppercase tracking-[0.13em] text-black/58 transition duration-300 hover:border-black/[0.15] hover:bg-white/[0.36] hover:text-black/74 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:min-h-11 sm:px-5 sm:text-[11px] sm:tracking-[0.16em]"
        >
          Start RPS
        </button>
      </footer>
    </section>
  );
}
