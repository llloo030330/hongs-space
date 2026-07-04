"use client";

export type AnimationKey = "idle" | "walk" | "stumble" | "reach";

const animationDefinitions: Array<{
  key: AnimationKey;
  label: string;
  patterns: RegExp[];
}> = [
  { key: "idle", label: "Idle", patterns: [/idle/i, /stand/i, /standing/i] },
  { key: "walk", label: "Walk", patterns: [/walk/i, /walking/i] },
  {
    key: "stumble",
    label: "Stumble",
    patterns: [/stumble/i, /fall/i, /trip/i, /react/i],
  },
  {
    key: "reach",
    label: "Reach",
    patterns: [/reach/i, /push/i, /touch/i, /wall/i],
  },
];

type AnimationControlsProps = {
  clipNames: string[];
  currentAnimation: string | null;
  onSelectClip: (clipName: string) => void;
  onStop: () => void;
};

export function AnimationControls({
  clipNames,
  currentAnimation,
  onSelectClip,
  onStop,
}: AnimationControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {animationDefinitions.map((definition) => {
        const clipName = resolveAnimationClip(clipNames, definition.key);
        const isActive = Boolean(clipName && currentAnimation === clipName);

        return (
          <button
            key={definition.key}
            type="button"
            disabled={!clipName}
            onClick={() => {
              if (clipName) onSelectClip(clipName);
            }}
            className={`rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition duration-300 ${
              isActive
                ? "border-black/18 bg-black/75 text-white"
                : clipName
                  ? "border-black/10 bg-white/55 text-black/58 hover:bg-white/85 hover:text-black/78"
                  : "cursor-not-allowed border-black/5 bg-white/28 text-black/24"
            }`}
          >
            {definition.label}
            {!clipName && <span className="ml-1 normal-case">(missing)</span>}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onStop}
        className="rounded-full border border-black/10 bg-white/55 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/58 transition duration-300 hover:bg-white/85 hover:text-black/78"
      >
        Stop
      </button>
    </div>
  );
}

export function resolveAnimationClip(
  clipNames: string[],
  animationKey: AnimationKey,
) {
  const definition = animationDefinitions.find(
    (candidate) => candidate.key === animationKey,
  );

  if (!definition) return undefined;

  return clipNames.find((clipName) =>
    definition.patterns.some((pattern) => pattern.test(clipName)),
  );
}

export function getAnimationAvailability(clipNames: string[]) {
  return animationDefinitions.map((definition) => ({
    key: definition.key,
    label: definition.label,
    clipName: resolveAnimationClip(clipNames, definition.key),
  }));
}
