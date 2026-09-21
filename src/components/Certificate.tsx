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
      const sigPixels = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
      const d = sigPixels.data;
      for (let i = 0; i < d.length; i += 4) {
        // If pixel is near-white (R>220, G>220, B>220), make transparent
        if (d[i] > 220 && d[i + 1] > 220 && d[i + 2] > 220) {
          d[i + 3] = 0; // set alpha to 0
        }
      }
      tmpCtx.putImageData(sigPixels, 0, 0);
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

  const shareText = `🎉 J'ai obtenu le certificat ${config.label} ${config.medal} de dactylographie sur Les 10 Doigts ! ${avgMpm} MPM avec ${avgAccuracy}% de précision.`;
  const shareUrl = "https://www.les10doigts.com";

  return (
    <div className="flex flex-wrap items-center gap-3">
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

      {/* Social share buttons */}
      <div className="flex items-center gap-1.5">
        <span className="mr-1 text-xs text-ink-soft">Partager :</span>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          title="Partager sur WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 place-items-center rounded-full bg-[#1877F2] text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          title="Partager sur Facebook"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 place-items-center rounded-full bg-[#0A66C2] text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          title="Partager sur LinkedIn"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 place-items-center rounded-full bg-[#1DA1F2] text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          title="Partager sur X"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      </div>
    </div>
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
