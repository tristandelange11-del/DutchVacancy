import { cn } from "@/lib/utils";

/**
 * The DutchVacancy mark: an orange D speech bubble (the student) and a navy V
 * bubble (the employer). Modes animate it — the keyframes are the .dv-logo
 * rules in index.css, and prefers-reduced-motion always shows the still mark.
 *
 * - still: the plain mark
 * - talk: D types and asks "EN?", V types and answers with a check (plays once)
 * - load: the bubbles take turns typing, for pending actions
 * - done: the V turns into a check, for a completed action
 */
export type LogoMode = "still" | "talk" | "load" | "done";

/** light: on white or light surfaces. dark: on navy. primary: inside an orange button. */
export type LogoTone = "light" | "dark" | "primary";

const TONES: Record<LogoTone, { d: string; dInk: string; v: string; vInk: string; gap: string; check: string }> = {
  light: { d: "#ea580c", dInk: "#ffffff", v: "#0f172a", vInk: "#ffffff", gap: "#ffffff", check: "#fb923c" },
  dark: { d: "#ea580c", dInk: "#ffffff", v: "#ffffff", vInk: "#0f172a", gap: "#0f172a", check: "#c2410c" },
  primary: { d: "#ffffff", dInk: "#c2410c", v: "#0f172a", vInk: "#ffffff", gap: "#c2410c", check: "#fb923c" },
};

const D_BUBBLE = "M15 6 H26 A12 12 0 0 1 38 18 V26 A12 12 0 0 1 26 38 H16 L8 46 V37 A12 12 0 0 1 3 26 V18 A12 12 0 0 1 15 6 Z";
const V_BUBBLE = "M38 18 H49 A12 12 0 0 1 61 30 V38 A12 12 0 0 1 56 47.8 V57 L48 50 H38 A12 12 0 0 1 26 38 V30 A12 12 0 0 1 38 18 Z";

function Dots({ cx, cy, r, fill, className }: { cx: number; cy: number; r: number; fill: string; className: string }) {
  return (
    <g className={className}>
      {[0, 1, 2].map((i) => (
        <circle key={i} className={`dv-logo__dot dv-logo__dot--${i + 1}`} cx={cx + i * 6} cy={cy} r={r} fill={fill} />
      ))}
    </g>
  );
}

export default function LogoMark({
  size = 36,
  mode = "still",
  tone = "light",
  gap,
  className,
}: {
  size?: number;
  mode?: LogoMode;
  tone?: LogoTone;
  /** Colour of the thin outline between the bubbles: the surface behind the mark (a colour or a CSS variable). */
  gap?: string;
  className?: string;
}) {
  const c = TONES[tone];
  const dotR = size < 32 ? 2.6 : 2.2;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("dv-logo shrink-0 overflow-visible", `dv-logo--${mode}`, className)}
    >
      <g className="dv-logo__d">
        <path d={D_BUBBLE} fill={c.d} />
        <path className="dv-logo__letter-d" d="M11 14 V30 H15 A8 8 0 0 0 15 14 Z" fill="none" stroke={c.dInk} strokeWidth="4.5" strokeLinejoin="round" />
        {(mode === "talk" || mode === "load") && <Dots className="dv-logo__dots-d" cx={11.5} cy={22} r={dotR} fill={c.dInk} />}
        {mode === "talk" && (
          <text className="dv-logo__ask" x="15" y="25.2" textAnchor="middle" fontFamily="'Outfit Variable', sans-serif" fontWeight="800" fontSize="9" fill={c.dInk}>
            EN?
          </text>
        )}
      </g>
      <g className="dv-logo__v">
        {/* A style, not the attribute, so `gap` may be a CSS variable. */}
        <path d={V_BUBBLE} fill={c.v} strokeWidth="3" style={{ stroke: gap ?? c.gap }} />
        <path className="dv-logo__letter-v" d="M37 27 L43.5 41 L50 27" fill="none" stroke={c.vInk} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        {(mode === "talk" || mode === "load") && <Dots className="dv-logo__dots-v" cx={37.5} cy={34} r={dotR} fill={c.vInk} />}
        {(mode === "talk" || mode === "done") && (
          <path
            className="dv-logo__check"
            d="M36.5 34.5 L41.5 39.5 L50.5 29.5"
            fill="none"
            stroke={c.check}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
          />
        )}
      </g>
    </svg>
  );
}
