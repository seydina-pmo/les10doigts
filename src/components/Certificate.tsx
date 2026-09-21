import { useRef, useState } from "react";

type CertificateProps = {
  userName: string;
  tier: "bronze" | "argent" | "or";
  avgMpm: number;
  avgAccuracy: number;
  levelsValidated: number;
  totalLevels: number;
};

const TIER_CONFIG = {
  bronze: {
    label: "Bronze",
    accent: "#A0714F",
    accentLight: "#C49A6C",
    bg: "#FFFDF8",
    border: "#C49A6C",
    ribbon: "linear-gradient(135deg, #C49A6C 0%, #8B6240 100%)",
    medal: "🥉",
  },
  argent: {
    label: "Argent",
    accent: "#6B7B8D",
    accentLight: "#9BAAB8",
    bg: "#F9FAFB",
    border: "#9BAAB8",
    ribbon: "linear-gradient(135deg, #B0BEC5 0%, #607D8B 100%)",
    medal: "🥈",
  },
  or: {
    label: "Or",
    accent: "#A68523",
    accentLight: "#D4A843",
    bg: "#FFFEF5",
    border: "#D4A843",
    ribbon: "linear-gradient(135deg, #F5D060 0%, #A68523 100%)",
    medal: "🥇",
  },
};

export function CertificateDownloadButton({
  tier,
  userName,
  avgMpm,
  avgAccuracy,
  levelsValidated,
  totalLevels,
}: CertificateProps) {
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = TIER_CONFIG[tier];

  async function downloadCertificate() {
    setGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      const W = 2480; // A4 landscape 300dpi
      const H = 1754;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // ── Background ──
      ctx.fillStyle = config.bg;
      ctx.fillRect(0, 0, W, H);

      // ── Outer border ──
      ctx.strokeStyle = config.border;
      ctx.lineWidth = 6;
      roundRect(ctx, 40, 40, W - 80, H - 80, 12);
      ctx.stroke();

      // ── Inner border (double line effect) ──
      ctx.strokeStyle = config.border + "60";
      ctx.lineWidth = 2;
      roundRect(ctx, 56, 56, W - 112, H - 112, 8);
      ctx.stroke();

      // ── Corner flourishes ──
      drawCornerFlourish(ctx, 50, 50, 1, 1, config.accent);
      drawCornerFlourish(ctx, W - 50, 50, -1, 1, config.accent);
      drawCornerFlourish(ctx, 50, H - 50, 1, -1, config.accent);
      drawCornerFlourish(ctx, W - 50, H - 50, -1, -1, config.accent);

      // ── Top decorative line ──
      const cx = W / 2;
      ctx.strokeStyle = config.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 300, 160);
      ctx.lineTo(cx + 300, 160);
      ctx.stroke();
      // Diamond center
      ctx.fillStyle = config.accent;
      ctx.save();
      ctx.translate(cx, 160);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-6, -6, 12, 12);
      ctx.restore();

      // ── Organization name ──
      ctx.fillStyle = "#1A1A2E";
      ctx.font = "bold 64px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.fillText("LES 10 DOIGTS", cx, 240);

      ctx.fillStyle = "#666666";
      ctx.font = "18px 'Helvetica Neue', Arial, sans-serif";
      ctx.letterSpacing = "8px";
      ctx.fillText("LA  MÉTHODE  DE  DACTYLOGRAPHIE  PROFESSIONNELLE", cx, 280);

      // ── Decorative line under header ──
      ctx.strokeStyle = config.accent + "80";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 400, 310);
      ctx.lineTo(cx + 400, 310);
      ctx.stroke();

      // ── "CERTIFICAT DE MAÎTRISE" ──
      ctx.fillStyle = config.accent;
      ctx.font = "24px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText("CERTIFICAT  DE  MAÎTRISE", cx, 380);

      // ── Tier name (large) ──
      ctx.fillStyle = config.accent;
      ctx.font = "bold 96px Georgia, 'Times New Roman', serif";
      ctx.fillText(`Niveau ${config.label}`, cx, 490);

      // ── Medal emoji ──
      ctx.font = "72px serif";
      ctx.fillText(config.medal, cx, 570);

      // ── "Ce certificat est décerné à" ──
      ctx.fillStyle = "#555555";
      ctx.font = "italic 28px Georgia, 'Times New Roman', serif";
      ctx.fillText("Ce certificat est décerné à", cx, 660);

      // ── User name ──
      ctx.fillStyle = "#1A1A2E";
      ctx.font = "bold 72px Georgia, 'Times New Roman', serif";
      ctx.fillText(userName, cx, 740);

      // ── Underline under name ──
      const nameWidth = ctx.measureText(userName).width;
      ctx.strokeStyle = config.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - nameWidth / 2 - 40, 755);
      ctx.lineTo(cx + nameWidth / 2 + 40, 755);
      ctx.stroke();

      // ── Description ──
      ctx.fillStyle = "#555555";
      ctx.font = "24px Georgia, 'Times New Roman', serif";
      ctx.fillText(
        "pour avoir complété avec succès le programme de formation",
        cx,
        820
      );
      ctx.fillText(
        `à la dactylographie professionnelle — Niveau ${config.label}`,
        cx,
        855
      );

      // ── Stats boxes ──
      const statsY = 960;
      const statSpacing = 350;
      const stats = [
        { value: `${avgMpm}`, label: "MOTS / MIN" },
        { value: `${avgAccuracy}%`, label: "PRÉCISION" },
        { value: `${levelsValidated}/${totalLevels}`, label: "NIVEAUX VALIDÉS" },
      ];

      stats.forEach((s, i) => {
        const sx = cx + (i - 1) * statSpacing;

        // Stat box background
        ctx.fillStyle = config.accent + "10";
        roundRect(ctx, sx - 120, statsY - 45, 240, 110, 10);
        ctx.fill();
        ctx.strokeStyle = config.accent + "30";
        ctx.lineWidth = 1;
        roundRect(ctx, sx - 120, statsY - 45, 240, 110, 10);
        ctx.stroke();

        // Value
        ctx.fillStyle = config.accent;
        ctx.font = "bold 52px Georgia, 'Times New Roman', serif";
        ctx.fillText(s.value, sx, statsY + 15);

        // Label
        ctx.fillStyle = "#888888";
        ctx.font = "14px 'Helvetica Neue', Arial, sans-serif";
        ctx.fillText(s.label, sx, statsY + 50);
      });

      // ── Bottom section: Date | Seal | Signature ──
      const bottomY = H - 220;

      // Date (left)
      const dateStr = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      ctx.fillStyle = "#1A1A2E";
      ctx.font = "28px Georgia, 'Times New Roman', serif";
      ctx.fillText(dateStr, 350, bottomY);
      // Line under date
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(200, bottomY + 12);
      ctx.lineTo(500, bottomY + 12);
      ctx.stroke();
      ctx.fillStyle = "#888";
      ctx.font = "14px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText("DATE  DE  DÉLIVRANCE", 350, bottomY + 40);

      // Seal (center)
      ctx.strokeStyle = config.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, bottomY - 10, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, bottomY - 10, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = config.accent;
      ctx.font = "bold 14px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText("CERTIFIÉ", cx, bottomY - 25);
      ctx.font = "36px serif";
      ctx.fillText("⑩", cx, bottomY + 5);
      ctx.font = "bold 12px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText("AUTHENTIQUE", cx, bottomY + 30);

      // Signature (right) — load real signature image and remove white bg
      const sigImg = await loadImage("/signature-dg.jpeg");
      const sigW = 280;
      const sigH = (sigImg.height / sigImg.width) * sigW;
      // Remove white background by making white pixels transparent
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = sigImg.width;
      tmpCanvas.height = sigImg.height;
      const tmpCtx = tmpCanvas.getContext("2d")!;
      tmpCtx.drawImage(sigImg, 0, 0);
      const imgData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        // If pixel is near-white (R>220, G>220, B>220), make transparent
        if (d[i] > 220 && d[i + 1] > 220 && d[i + 2] > 220) {
          d[i + 3] = 0; // set alpha to 0
        }
      }
      tmpCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(tmpCanvas, W - 350 - sigW / 2, bottomY - sigH - 10, sigW, sigH);
      // "Le Directeur Général" text under signature
      ctx.fillStyle = "#1A1A2E";
      ctx.font = "italic 24px Georgia, 'Times New Roman', serif";
      ctx.fillText("Le Directeur Général", W - 350, bottomY - 5);
      // Line under signature
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W - 550, bottomY + 12);
      ctx.lineTo(W - 150, bottomY + 12);
      ctx.stroke();
      ctx.fillStyle = "#888";
      ctx.font = "14px 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText("SIGNATURE", W - 350, bottomY + 40);

      // ── Bottom decorative line ──
      ctx.strokeStyle = config.accent + "80";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 400, H - 100);
      ctx.lineTo(cx + 400, H - 100);
      ctx.stroke();
      // Diamond center
      ctx.fillStyle = config.accent;
      ctx.save();
      ctx.translate(cx, H - 100);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();

      // ── Reference number ──
      ctx.fillStyle = "#BBBBBB";
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText(
        `Réf: L10D-${tier.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        cx,
        H - 65
      );

      // ── Download as PDF ──
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const imgData = canvas.toDataURL("image/png", 1.0);
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      pdf.save(`Certificat_${config.label}_Les10Doigts.pdf`);
    } catch (err) {
      console.error("Certificate generation error:", err);
      alert("Erreur lors de la génération du certificat. Veuillez réessayer.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={downloadCertificate}
      disabled={generating}
      className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
      style={{ background: config.ribbon }}
    >
      {generating ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Génération en cours…
        </>
      ) : (
        <>📜 Télécharger mon certificat {config.label}</>
      )}
    </button>
  );
}

// ── Helpers ──

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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

function drawCornerFlourish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  const len = 50;
  // L shape
  ctx.beginPath();
  ctx.moveTo(x, y + dy * len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + dx * len, y);
  ctx.stroke();
  // Inner L
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + dx * 6, y + dy * 35);
  ctx.lineTo(x + dx * 6, y + dy * 6);
  ctx.lineTo(x + dx * 35, y + dy * 6);
  ctx.stroke();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
