import { useCallback, useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

const FullscreenToggle = () => {
	const [isFullscreen, setIsFullscreen] = useState<boolean>(() => document.fullscreenElement !== null);

	const syncState = useCallback(() => {
		setIsFullscreen(document.fullscreenElement !== null);
	}, []);

	const toggle = useCallback(async () => {
		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
			} else {
				await document.documentElement.requestFullscreen();
			}
		} catch (err) {
			console.warn("Fullscreen toggle failed:", err);
		}
	}, []);

	useEffect(() => {
		document.addEventListener("fullscreenchange", syncState);
		return () => document.removeEventListener("fullscreenchange", syncState);
	}, [syncState]);

	const tooltip = isFullscreen ? "Exit Full Screen" : "Enter Full Screen";

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={tooltip}
			title={tooltip}
			className="fullscreen-btn"
		>
			{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
		</button>
	);
};

export default FullscreenToggle;
