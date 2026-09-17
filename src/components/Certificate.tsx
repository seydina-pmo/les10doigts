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
    color: "#CD7F32",
    gradientFrom: "#CD7F32",
    gradientTo: "#8B5E23",
    bg: "#FDF8F0",
    emoji: "🥉",
    borderColor: "#CD7F32",
  },
  argent: {
    label: "Argent",
    color: "#A8A9AD",
    gradientFrom: "#C0C0C0",
    gradientTo: "#808080",
    bg: "#F8F9FA",
    emoji: "🥈",
    borderColor: "#A8A9AD",
  },
  or: {
    label: "Or",
    color: "#C9A227",
    gradientFrom: "#FFD700",
    gradientTo: "#B8860B",
    bg: "#FFFDE7",
    emoji: "🥇",
    borderColor: "#C9A227",
  },
};

export function CertificateDownloadButton({ tier, userName, avgMpm, avgAccuracy, levelsValidated, totalLevels }: CertificateProps) {
  const [generating, setGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const config = TIER_CONFIG[tier];
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function downloadCertificate() {
    if (!certRef.current) return;
    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Make visible for capture
      certRef.current.style.position = "fixed";
      certRef.current.style.left = "0";
      certRef.current.style.top = "0";
      certRef.current.style.zIndex = "9999";
      certRef.current.style.opacity = "1";
      certRef.current.style.pointerEvents = "auto";

      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        width: 1120,
        height: 794,
      });

      // Hide again
      certRef.current.style.position = "absolute";
      certRef.current.style.left = "-9999px";
      certRef.current.style.opacity = "0";
      certRef.current.style.pointerEvents = "none";

      // A4 landscape
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const imgData = canvas.toDataURL("image/png");
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
    <>
      <button
        onClick={downloadCertificate}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
        }}
      >
        {generating ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Génération en cours…
          </>
        ) : (
          <>
            📜 Télécharger mon certificat {config.label}
          </>
        )}
      </button>

      {/* Hidden certificate template for capture */}
      <div
        ref={certRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "0",
          opacity: "0",
          pointerEvents: "none",
          width: "1120px",
          height: "794px",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          background: config.bg,
          overflow: "hidden",
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: "absolute",
            inset: "12px",
            border: `3px solid ${config.borderColor}`,
            borderRadius: "8px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "18px",
            border: `1px solid ${config.borderColor}40`,
            borderRadius: "6px",
          }}
        />

        {/* Corner ornaments */}
        {[
          { top: 20, left: 20 },
          { top: 20, right: 20 },
          { bottom: 20, left: 20 },
          { bottom: 20, right: 20 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: "40px",
              height: "40px",
              borderTop: i < 2 ? `3px solid ${config.borderColor}` : "none",
              borderBottom: i >= 2 ? `3px solid ${config.borderColor}` : "none",
              borderLeft: i % 2 === 0 ? `3px solid ${config.borderColor}` : "none",
              borderRight: i % 2 === 1 ? `3px solid ${config.borderColor}` : "none",
            } as React.CSSProperties}
          />
        ))}

        <div
          style={{
            padding: "50px 70px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                letterSpacing: "3px",
                color: "#1a1a2e",
                marginBottom: "4px",
              }}
            >
              ⑩ LES 10 DOIGTS
            </div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "6px",
                color: "#666",
                textTransform: "uppercase",
              }}
            >
              La Méthode de Dactylographie Professionnelle
            </div>
          </div>

          {/* Main title */}
          <div style={{ textAlign: "center", marginTop: "-10px" }}>
            <div
              style={{
                fontSize: "14px",
                letterSpacing: "8px",
                textTransform: "uppercase",
                color: config.color,
                marginBottom: "8px",
              }}
            >
              Certificat de Maîtrise
            </div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: "1.1",
              }}
            >
              Niveau {config.label} {config.emoji}
            </div>
          </div>

          {/* Recipient */}
          <div style={{ textAlign: "center", marginTop: "-5px" }}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
              Ce certificat est décerné à
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1a1a2e",
                borderBottom: `2px solid ${config.borderColor}`,
                paddingBottom: "4px",
                paddingLeft: "40px",
                paddingRight: "40px",
              }}
            >
              {userName}
            </div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "12px", maxWidth: "600px", lineHeight: "1.6" }}>
              pour avoir complété avec succès le programme de formation à la dactylographie
              professionnelle et satisfait aux exigences du niveau <strong>{config.label}</strong>.
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "50px",
              justifyContent: "center",
              marginTop: "-5px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: config.color }}>
                {avgMpm}
              </div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#888", textTransform: "uppercase" }}>
                Mots/min
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: config.color }}>
                {avgAccuracy}%
              </div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#888", textTransform: "uppercase" }}>
                Précision
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: config.color }}>
                {levelsValidated}/{totalLevels}
              </div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#888", textTransform: "uppercase" }}>
                Niveaux validés
              </div>
            </div>
          </div>

          {/* Footer — Date + Signature */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
              paddingBottom: "10px",
            }}
          >
            <div style={{ textAlign: "center", minWidth: "200px" }}>
              <div style={{ fontSize: "13px", color: "#1a1a2e" }}>{dateStr}</div>
              <div
                style={{
                  width: "180px",
                  borderTop: "1px solid #999",
                  marginTop: "4px",
                  paddingTop: "4px",
                  fontSize: "10px",
                  color: "#888",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Date de délivrance
              </div>
            </div>

            {/* Seal */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                border: `3px solid ${config.borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                letterSpacing: "1px",
                color: config.color,
                textTransform: "uppercase",
                textAlign: "center",
                lineHeight: "1.2",
                opacity: 0.7,
              }}
            >
              CERTIFIÉ
              <br />
              ⑩
              <br />
              AUTHENTIQUE
            </div>

            <div style={{ textAlign: "center", minWidth: "200px" }}>
              {/* Placeholder signature — will be replaced with real signature later */}
              <div
                style={{
                  fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                  fontSize: "22px",
                  color: "#1a1a2e",
                  marginBottom: "2px",
                }}
              >
                Le Directeur Général
              </div>
              <div
                style={{
                  width: "180px",
                  borderTop: "1px solid #999",
                  margin: "0 auto",
                  paddingTop: "4px",
                  fontSize: "10px",
                  color: "#888",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
