// AZERTY French keyboard, colored by finger (méthode des 10 doigts).
// The color of a key matches the color of the finger that should strike it.

export const FINGER = {
  pinky: "#8FD3E8",     // auriculaires (bleu ciel)
  ring: "#B8D74A",      // annulaires (vert)
  middle: "#FBE94A",    // majeurs (jaune)
  indexL: "#F18A3F",    // index gauche (orange)
  indexR: "#B084A6",    // index droit (mauve)
  thumb: "#C8C8C8",     // pouces (gris)
} as const;

type FingerKey = keyof typeof FINGER;

type Key = {
  // top label (shifted), bottom label (default), optional altgr label
  top?: string;
  bot: string;
  alt?: string;
  finger: FingerKey;
  w?: number; // width units (1 = base)
  cls?: string; // extra classes
  id?: string; // canonical id used for highlighting (e.g. "a", "shift", " ")
};

const W = 44; // base key width in px
const GAP = 6;

const rows: Key[][] = [
  // Row 1: digits
  [
    { bot: "²", finger: "pinky" },
    { top: "1", bot: "&", finger: "pinky", id: "1" },
    { top: "2", bot: "é", alt: "~", finger: "pinky", id: "2" },
    { top: "3", bot: '"', alt: "#", finger: "ring", id: "3" },
    { top: "4", bot: "'", alt: "{", finger: "middle", id: "4" },
    { top: "5", bot: "(", alt: "[", finger: "indexL", id: "5" },
    { top: "6", bot: "-", alt: "|", finger: "indexL", id: "6" },
    { top: "7", bot: "è", alt: "`", finger: "indexR", id: "7" },
    { top: "8", bot: "_", alt: "\\", finger: "indexR", id: "8" },
    { top: "9", bot: "ç", alt: "^", finger: "middle", id: "9" },
    { top: "0", bot: "à", alt: "@", finger: "ring", id: "0" },
    { top: "°", bot: ")", finger: "pinky" },
    { top: "+", bot: "=", alt: "}", finger: "pinky" },
    { bot: "⌫", finger: "pinky", w: 1.6, id: "backspace" },
  ],
  // Row 2: AZERTY
  [
    { bot: "⇥", finger: "pinky", w: 1.4, id: "tab" },
    { bot: "A", finger: "pinky", id: "a" },
    { bot: "Z", finger: "ring", id: "z" },
    { bot: "E", alt: "€", finger: "middle", id: "e" },
    { bot: "R", finger: "indexL", id: "r" },
    { bot: "T", finger: "indexL", id: "t" },
    { bot: "Y", finger: "indexR", id: "y" },
    { bot: "U", finger: "indexR", id: "u" },
    { bot: "I", finger: "middle", id: "i" },
    { bot: "O", finger: "ring", id: "o" },
    { bot: "P", finger: "pinky", id: "p" },
    { top: "¨", bot: "^", finger: "pinky" },
    { top: "£", bot: "$", alt: "¤", finger: "pinky" },
    { bot: "↵", finger: "pinky", w: 1.4, id: "enter" },
  ],
  // Row 3: QSDFGHJKLM
  [
    { bot: "⇪", finger: "pinky", w: 1.7, id: "caps" },
    { bot: "Q", finger: "pinky", id: "q" },
    { bot: "S", finger: "ring", id: "s" },
    { bot: "D", finger: "middle", id: "d" },
    { bot: "F", finger: "indexL", id: "f" },
    { bot: "G", finger: "indexL", id: "g" },
    { bot: "H", finger: "indexR", id: "h" },
    { bot: "J", finger: "indexR", id: "j" },
    { bot: "K", finger: "middle", id: "k" },
    { bot: "L", finger: "ring", id: "l" },
    { bot: "M", finger: "pinky", id: "m" },
    { top: "%", bot: "ù", finger: "pinky" },
    { top: "µ", bot: "*", finger: "pinky", w: 1.3 },
  ],
  // Row 4: shift WXCVBN
  [
    { bot: "⇧", finger: "pinky", w: 1.2, id: "lshift" },
    { top: ">", bot: "<", finger: "pinky" },
    { bot: "W", finger: "pinky", id: "w" },
    { bot: "X", finger: "ring", id: "x" },
    { bot: "C", finger: "middle", id: "c" },
    { bot: "V", finger: "indexL", id: "v" },
    { bot: "B", finger: "indexL", id: "b" },
    { bot: "N", finger: "indexR", id: "n" },
    { top: "?", bot: ",", finger: "indexR", id: "," },
    { top: ".", bot: ";", finger: "middle", id: ";" },
    { top: "/", bot: ":", finger: "ring", id: ":" },
    { top: "§", bot: "!", finger: "pinky", id: "!" },
    { bot: "⇧", finger: "pinky", w: 2.1, id: "rshift" },
  ],
  // Row 5: ctrl/alt/space
  [
    { bot: "Ctrl", finger: "pinky", w: 1.4 },
    { bot: "⊞", finger: "pinky", w: 1.2 },
    { bot: "Alt", finger: "thumb", w: 1.2 },
    { bot: "", finger: "thumb", w: 6.2, id: " " },
    { bot: "Alt Gr", finger: "thumb", w: 1.4 },
    { bot: "⊞", finger: "pinky", w: 1.2 },
    { bot: "≡", finger: "pinky", w: 1.2 },
    { bot: "Ctrl", finger: "pinky", w: 1.4 },
  ],
];

function rowOffset(i: number) {
  // small visual stagger like a real keyboard
  return [0, 4, 8, 0, 0][i] ?? 0;
}

export type KeyboardFRProps = {
  highlight?: string | null; // id of key to highlight (e.g. "a", " ")
  showHands?: boolean;
  size?: "sm" | "md" | "lg";
};

export function KeyboardFR({ highlight, showHands = true, size = "md" }: KeyboardFRProps) {
  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.1 : 1;
  const unit = W * scale;

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="img"
      aria-label="Clavier AZERTY français colorié par doigt : chaque touche est associée au doigt qui doit la frapper selon la méthode des 10 doigts."
    >
      <div
        className="rounded-2xl bg-card p-4 shadow-[0_1px_0_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(0,0,0,0.35)]"
        style={{ border: "1px solid var(--rule)" }}
      >

        <div className="flex flex-col" style={{ gap: GAP * scale }}>
          {rows.map((row, ri) => (
            <div
              key={ri}
              className="flex"
              style={{ gap: GAP * scale, paddingLeft: rowOffset(ri) * scale }}
            >
              {row.map((k, ki) => {
                const w = (k.w ?? 1) * unit;
                const isHi = !!k.id && !!highlight && k.id === highlight;
                return (
                  <div
                    key={ki}
                    className="relative grid select-none place-items-center rounded-[10px] text-ink"
                    style={{
                      width: w,
                      height: unit,
                      backgroundColor: FINGER[k.finger],
                      boxShadow: isHi
                        ? "0 0 0 3px var(--ink), 0 0 0 6px var(--copper)"
                        : "inset 0 -2px 0 rgba(0,0,0,0.08)",
                      transition: "box-shadow .15s ease",
                    }}
                  >
                    {k.top && (
                      <span
                        className="absolute left-1.5 top-1 font-medium text-ink/85"
                        style={{ fontSize: 10 * scale }}
                      >
                        {k.top}
                      </span>
                    )}
                    {k.alt && (
                      <span
                        className="absolute bottom-1 right-1.5 font-medium text-ink/70"
                        style={{ fontSize: 10 * scale }}
                      >
                        {k.alt}
                      </span>
                    )}
                    <span
                      className="font-semibold"
                      style={{ fontSize: (k.bot.length > 2 ? 11 : 16) * scale }}
                    >
                      {k.bot}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showHands && <Hands scale={scale} />}
    </div>
  );
}

function Hands({ scale }: { scale: number }) {
  const w = 320 * scale;
  return (
    <div className="flex gap-24" style={{ paddingTop: 4 }}>
      <Hand mirror={false} width={w} />
      <Hand mirror width={w} />
    </div>
  );
}

function Hand({ mirror, width }: { mirror: boolean; width: number }) {
  // fingers left-to-right: pinky, ring, middle, index, thumb (left hand).
  // right hand mirrored: thumb, index, middle, ring, pinky.
  const order = mirror
    ? (["thumb", "indexR", "middle", "ring", "pinky"] as FingerKey[])
    : (["pinky", "ring", "middle", "indexL", "thumb"] as FingerKey[]);
  const heights = mirror ? [55, 85, 100, 90, 70] : [70, 90, 100, 85, 55];

  return (
    <svg viewBox="0 0 200 160" width={width} aria-hidden>
      {/* palm */}
      <path
        d="M30 150 Q30 100 50 90 L150 90 Q170 100 170 150 Z"
        fill="#ffffff"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      {order.map((f, i) => {
        const x = 30 + i * 28 + (f === "thumb" ? (mirror ? -8 : 8) : 0);
        const h = heights[i];
        return (
          <rect
            key={i}
            x={x}
            y={150 - h}
            width={22}
            height={h + 10}
            rx={12}
            fill={FINGER[f]}
            stroke="#1a1a1a"
            strokeWidth="3"
          />
        );
      })}
      {/* palm overlay to hide finger bases */}
      <path
        d="M28 152 Q28 110 50 100 L150 100 Q172 110 172 152 Z"
        fill="#ffffff"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
    </svg>
  );
}

export const FINGER_LEGEND: { label: string; color: string }[] = [
  { label: "auriculaires", color: FINGER.pinky },
  { label: "annulaires", color: FINGER.ring },
  { label: "majeurs", color: FINGER.middle },
  { label: "index gauche", color: FINGER.indexL },
  { label: "index droit", color: FINGER.indexR },
  { label: "pouces", color: FINGER.thumb },
];
