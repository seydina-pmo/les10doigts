import { useRef } from "react";
import type { ExamTier } from "@/lib/exam";
import { EXAM_CONFIGS } from "@/lib/exam";

interface CertificateProps {
  userName: string;
  tier: ExamTier;
  mpm: number;
  accuracy: number;
  date: string; // ISO string
}

const TIER_COLORS: Record<ExamTier, { bg: string; border: string; accent: string }> = {
  bronze: { bg: "#FDF6EE", border: "#CD7F32", accent: "#CD7F32" },
  silver: { bg: "#F5F5F8", border: "#A8A9AD", accent: "#71727A" },
  gold: { bg: "#FFF9E6", border: "#FFD700", accent: "#B8860B" },
};

const TIER_EMOJI: Record<ExamTier, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
};

/**
 * Certificate — a printable, downloadable certification card.
 * Uses canvas to generate a PNG image.
 */
export function Certificate({ userName, tier, mpm, accuracy, date }: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = EXAM_CONFIGS[tier];
  const colors = TIER_COLORS[tier];
  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function drawCertificate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 1200;
    const h = 850;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Inner border
    ctx.strokeStyle = colors.border + "40";
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, w - 90, h - 90);

    // Corner decorations
    const corners = [
      [55, 55],
      [w - 55, 55],
      [55, h - 55],
      [w - 55, h - 55],
    ];
    ctx.fillStyle = colors.accent;
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Header
    ctx.fillStyle = colors.accent;
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("LA MÉTHODE DES 10 DOIGTS", w / 2, 100);

    // Title
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "bold 48px Georgia, serif";
    ctx.fillText("CERTIFICAT DE DACTYLOGRAPHIE", w / 2, 170);

    // Tier badge
    ctx.fillStyle = colors.accent;
    ctx.font = "28px Georgia, serif";
    ctx.fillText(`Niveau ${config.label}`, w / 2, 230);

    // Horizontal line
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 260);
    ctx.lineTo(w - 200, 260);
    ctx.stroke();

    // "Décerné à"
    ctx.fillStyle = "#666";
    ctx.font = "18px Georgia, serif";
    ctx.fillText("Ce certificat est décerné à", w / 2, 310);

    // User name
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "bold 42px Georgia, serif";
    ctx.fillText(userName, w / 2, 380);

    // Underline name
    const nameWidth = ctx.measureText(userName).width;
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo((w - nameWidth) / 2 - 20, 395);
    ctx.lineTo((w + nameWidth) / 2 + 20, 395);
    ctx.stroke();

    // Achievement text
    ctx.fillStyle = "#444";
    ctx.font = "16px Georgia, serif";
    ctx.fillText(
      `Pour avoir réussi l'examen de certification ${config.label}`,
      w / 2,
      450,
    );
    ctx.fillText(
      `de la Méthode des 10 Doigts avec les résultats suivants :`,
      w / 2,
      475,
    );

    // Stats boxes
    const boxY = 520;
    const boxW = 200;
    const boxH = 80;
    const gap = 40;
    const startX = w / 2 - boxW - gap / 2;

    // Speed box
    ctx.fillStyle = colors.bg;
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    roundRect(ctx, startX, boxY, boxW, boxH, 8);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = "#666";
    ctx.font = "12px monospace";
    ctx.fillText("VITESSE", startX + boxW / 2, boxY + 25);
    ctx.fillStyle = colors.accent;
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText(`${mpm} MPM`, startX + boxW / 2, boxY + 58);

    // Accuracy box
    const box2X = startX + boxW + gap;
    ctx.fillStyle = colors.bg;
    roundRect(ctx, box2X, boxY, boxW, boxH, 8);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = "#666";
    ctx.font = "12px monospace";
    ctx.fillText("PRÉCISION", box2X + boxW / 2, boxY + 25);
    ctx.fillStyle = colors.accent;
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText(`${accuracy}%`, box2X + boxW / 2, boxY + 58);

    // Date
    ctx.fillStyle = "#888";
    ctx.font = "14px Georgia, serif";
    ctx.fillText(`Délivré le ${formattedDate}`, w / 2, 660);

    // Signature line
    ctx.strokeStyle = "#CCC";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 120, 720);
    ctx.lineTo(w / 2 + 120, 720);
    ctx.stroke();

    ctx.fillStyle = "#888";
    ctx.font = "12px monospace";
    ctx.fillText("www.les10doigts.com", w / 2, 745);

    // ID watermark
    ctx.fillStyle = "#DDD";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`ID: ${Date.now().toString(36).toUpperCase()}`, w - 60, h - 50);
  }

  function download() {
    drawCertificate();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `certificat-${tier}-${userName.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="grid gap-4">
      <canvas
        ref={canvasRef}
        className="mx-auto w-full max-w-2xl rounded-xl border border-rule shadow-lg"
        style={{ aspectRatio: "1200/850" }}
      />

      <div className="flex justify-center gap-3">
        <button
          onClick={() => { drawCertificate(); }}
          className="rounded-md border border-rule px-4 py-2 text-sm transition hover:bg-paper-deep"
        >
          Prévisualiser
        </button>
        <button
          onClick={download}
          className="flex items-center gap-2 rounded-md bg-copper px-4 py-2 text-sm font-medium text-paper transition hover:bg-copper-deep"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger le certificat
        </button>
      </div>
    </div>
  );
}

/** Helper to draw rounded rectangles on canvas */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
