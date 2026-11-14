// =============================================================================
// ANIMATED MESH BACKGROUND — ALL REPAIR (ALLCODE ECOSYSTEM)
// =============================================================================

export function AnimatedMeshBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#060a12]">
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0">
        {/* Orb 1 — Blue, top left */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-25 blur-[130px]"
          style={{
            background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
            top: "-20%",
            left: "-10%",
            animation: "meshMove1 22s ease-in-out infinite",
          }}
        />
        {/* Orb 2 — Indigo, bottom right */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-20 blur-[110px]"
          style={{
            background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
            bottom: "-15%",
            right: "-5%",
            animation: "meshMove2 26s ease-in-out infinite",
          }}
        />
        {/* Orb 3 — Cyan, center */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[90px]"
          style={{
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            top: "35%",
            left: "35%",
            animation: "meshMove3 19s ease-in-out infinite",
          }}
        />
        {/* Orb 4 — Sky blue, top right */}
        <div
          className="absolute w-[450px] h-[450px] rounded-full opacity-10 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)",
            top: "10%",
            right: "20%",
            animation: "meshMove4 24s ease-in-out infinite",
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <style>{`
        @keyframes meshMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 80px) scale(1.1); }
        }
        @keyframes meshMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-70px, -60px) scale(1.08); }
        }
        @keyframes meshMove3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 60px) scale(0.95); }
        }
        @keyframes meshMove4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -50px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}

