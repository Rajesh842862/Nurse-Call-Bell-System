import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
	const navigate = useNavigate();
	const [countdown, setCountdown] = useState(10);
	const [glitch, setGlitch] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					navigate("/");
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, [navigate]);

	useEffect(() => {
		const glitchInterval = setInterval(() => {
			setGlitch(true);
			setTimeout(() => setGlitch(false), 200);
		}, 3000);
		return () => clearInterval(glitchInterval);
	}, []);

	return (
		<div style={styles.wrapper}>
			<div style={styles.grid} />

			<div style={{ ...styles.orb, ...styles.orb1 }} />
			<div style={{ ...styles.orb, ...styles.orb2 }} />

			<div style={styles.container}>
				<div style={styles.codeWrap}>
					<span style={{ ...styles.bigCode, ...(glitch ? styles.bigCodeGlitch : {}) }}>404</span>
					<span style={styles.bigCodeShadow}>404</span>
				</div>

				<div style={styles.divider}>
					<div style={styles.dividerLine} />
					<span style={styles.dividerDot} />
					<div style={styles.dividerLine} />
				</div>

				<h1 style={styles.title}>Page Not Found</h1>
				<p style={styles.subtitle}>The page you are looking for does not exist or has been moved.</p>

				<div style={styles.countdownWrap}>
					<div style={styles.countdownTrack}>
						<div
							style={{
								...styles.countdownFill,
								width: `${(countdown / 10) * 100}%`,
								transition: "width 1s linear",
							}}
						/>
					</div>
					<p style={styles.countdownText}>
						You will be redirected to the home page in {countdown}s.
					</p>
				</div>

				<div style={styles.btnRow}>
					<button style={styles.btnPrimary} onClick={() => navigate("/")}>
						<span style={styles.btnIcon}>⌂</span> Home
					</button>
					<button style={styles.btnSecondary} onClick={() => navigate(-1)}>
						<span style={styles.btnIcon}>←</span> Back
					</button>
				</div>
			</div>

			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-30px) scale(1.04); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(20px) scale(0.97); }
        }
        @keyframes fillBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes glitchClip {
          0%  { clip-path: inset(0 0 95% 0); transform: translate(-4px, 0); }
          20% { clip-path: inset(30% 0 50% 0); transform: translate(4px, 0); }
          40% { clip-path: inset(60% 0 20% 0); transform: translate(-2px, 0); }
          60% { clip-path: inset(80% 0 5% 0);  transform: translate(3px, 0); }
          80% { clip-path: inset(10% 0 80% 0); transform: translate(-3px, 0); }
          100%{ clip-path: inset(0 0 95% 0);  transform: translate(0, 0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.35; }
        }

        button:hover {
          transform: translateY(-2px) !important;
          filter: brightness(1.12) !important;
        }
        button:active {
          transform: translateY(0px) !important;
        }
      `}</style>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	wrapper: {
		position: "relative",
		minHeight: "100vh",
		background: "#0a0c14",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		fontFamily: "'DM Sans', sans-serif",
	},

	grid: {
		position: "absolute",
		inset: 0,
		backgroundImage:
			"linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)",
		backgroundSize: "48px 48px",
		zIndex: 0,
	},

	orb: {
		position: "absolute",
		borderRadius: "50%",
		filter: "blur(80px)",
		zIndex: 0,
		pointerEvents: "none",
	},
	orb1: {
		width: 420,
		height: 420,
		background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
		top: "-80px",
		left: "-80px",
		animation: "floatA 8s ease-in-out infinite",
	},
	orb2: {
		width: 360,
		height: 360,
		background: "radial-gradient(circle, rgba(244,63,94,0.14) 0%, transparent 70%)",
		bottom: "-60px",
		right: "-60px",
		animation: "floatB 10s ease-in-out infinite",
	},

	container: {
		position: "relative",
		zIndex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		textAlign: "center",
		padding: "48px 32px",
		animation: "fadeUp 0.7s ease both",
		maxWidth: 520,
		width: "100%",
	},

	codeWrap: {
		position: "relative",
		lineHeight: 1,
		marginBottom: 8,
		userSelect: "none",
	},

	bigCode: {
		display: "block",
		fontFamily: "'Space Mono', monospace",
		fontSize: "clamp(96px, 18vw, 160px)",
		fontWeight: 700,
		color: "#fff",
		letterSpacing: "-4px",
		position: "relative",
		zIndex: 2,
	},

	bigCodeGlitch: {
		animation: "glitchClip 0.2s steps(1) both",
		color: "#f43f5e",
		textShadow: "3px 0 #6366f1, -3px 0 #f43f5e",
	},

	bigCodeShadow: {
		display: "block",
		fontFamily: "'Space Mono', monospace",
		fontSize: "clamp(96px, 18vw, 160px)",
		fontWeight: 700,
		color: "transparent",
		WebkitTextStroke: "1px rgba(99,102,241,0.25)",
		letterSpacing: "-4px",
		position: "absolute",
		top: 6,
		left: 6,
		zIndex: 1,
		pointerEvents: "none",
		animation: "pulse 3s ease-in-out infinite",
	},

	divider: {
		display: "flex",
		alignItems: "center",
		gap: 10,
		width: "100%",
		maxWidth: 320,
		marginBottom: 28,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)",
	},
	dividerDot: {
		width: 6,
		height: 6,
		borderRadius: "50%",
		background: "#6366f1",
		display: "block",
		boxShadow: "0 0 8px #6366f1",
	},

	title: {
		fontFamily: "'DM Sans', sans-serif",
		fontSize: "clamp(22px, 4vw, 30px)",
		fontWeight: 500,
		color: "#f1f5f9",
		margin: "0 0 10px",
		letterSpacing: "-0.5px",
	},

	subtitle: {
		fontSize: 15,
		color: "rgba(148,163,184,0.85)",
		margin: "0 0 36px",
		lineHeight: 1.65,
		fontWeight: 300,
	},

	countdownWrap: {
		width: "100%",
		maxWidth: 360,
		marginBottom: 36,
	},
	countdownTrack: {
		width: "100%",
		height: 3,
		background: "rgba(99,102,241,0.15)",
		borderRadius: 99,
		overflow: "hidden",
		marginBottom: 10,
	},
	countdownFill: {
		height: "100%",
		background: "linear-gradient(90deg, #6366f1, #f43f5e)",
		borderRadius: 99,
		boxShadow: "0 0 8px rgba(99,102,241,0.5)",
	},
	countdownText: {
		fontSize: 12,
		color: "rgba(148,163,184,0.55)",
		margin: 0,
		fontFamily: "'Space Mono', monospace",
		letterSpacing: "0.02em",
	},

	btnRow: {
		display: "flex",
		gap: 14,
		flexWrap: "wrap",
		justifyContent: "center",
	},
	btnPrimary: {
		display: "flex",
		alignItems: "center",
		gap: 8,
		padding: "12px 28px",
		background: "linear-gradient(135deg, #6366f1, #818cf8)",
		color: "#fff",
		border: "none",
		borderRadius: 10,
		fontSize: 15,
		fontWeight: 500,
		fontFamily: "'DM Sans', sans-serif",
		cursor: "pointer",
		transition: "transform 0.18s ease, filter 0.18s ease",
		boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
		letterSpacing: "0.01em",
	},
	btnSecondary: {
		display: "flex",
		alignItems: "center",
		gap: 8,
		padding: "12px 28px",
		background: "rgba(255,255,255,0.05)",
		color: "#cbd5e1",
		border: "1px solid rgba(255,255,255,0.1)",
		borderRadius: 10,
		fontSize: 15,
		fontWeight: 400,
		fontFamily: "'DM Sans', sans-serif",
		cursor: "pointer",
		transition: "transform 0.18s ease, filter 0.18s ease",
		backdropFilter: "blur(4px)",
		letterSpacing: "0.01em",
	},
	btnIcon: {
		fontSize: 16,
	},
};
