import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AlertContext } from "./AlertContext";
import { Alert, AlertContextValue, ConnectionStatus, ProcessedReport, ReportResponse, ServerError } from "../types";

const API_URL = import.meta.env.VITE_SERVER_APP_URL as string;

interface AlertProviderProps {
	children: React.ReactNode;
}

const AlertProvider = ({ children }: AlertProviderProps) => {
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [alerts, setAlerts] = useState<Alert[]>([]);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
	const [serverError, setServerError] = useState<ServerError | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const sirenRef = useRef<HTMLAudioElement | null>(null);
	const isUnlockedRef = useRef<boolean>(false);
	const alertCounter = useRef<number>(0);
	const alertsRef = useRef<Alert[]>([]);

	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [reportData, setReportData] = useState<ProcessedReport[]>([]);
	const [formError, setFormError] = useState("");
	const [formLoading, setFormLoading] = useState(false);
	const [excelData, setExcelData] = useState<ReportResponse>({
		success: false,
		data: [],
		counts: {
			total_count: 0,
			calling_count: 0,
			emergency_count: 0,
			code_blue_count: 0,
			cancel_count: 0,
			acknowledged_count: 0,
			bed_count: 0,
			toilet_count: 0,
		},
	});

	const priorityMap: Record<string, number> = {
		"code blue": 1,
		emergency: 2,
		calling: 3,
	};

	const enableAudio = (): void => {
		if (isUnlockedRef.current) return;

		isUnlockedRef.current = true;
		setIsUnlocked(true);

		const readyAudio = new Audio("/System Ready.mp3");

		readyAudio.onended = () => {
			const currentAlerts = alertsRef.current;

			if (currentAlerts.length > 0) {
				playAlertSound(currentAlerts[0]);
			}
		};

		readyAudio.play().catch(() => {});
	};

	useEffect(() => {
		const unlockAudio = () => {
			enableAudio();
		};

		window.addEventListener("click", unlockAudio, { once: true });

		return () => {
			window.removeEventListener("click", unlockAudio);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const stopCurrentAudio = (): void => {
		if (audioRef.current) {
			audioRef.current.onended = null;
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}

		if (sirenRef.current) {
			sirenRef.current.onended = null;
			sirenRef.current.pause();
			sirenRef.current.currentTime = 0;
		}
	};

	const playAlertSound = (alert: Alert): void => {
		if (!isUnlockedRef.current || !alert) return;

		const url = `${API_URL}${alert.audio}`;
		stopCurrentAudio();

		const playVoice = () => {
			if (!audioRef.current) {
				audioRef.current = new Audio();
			}

			const audio = audioRef.current;

			audio.onended = null;
			audio.src = url;
			audio.currentTime = 0;
			audio.onended = () => {
				if (!alertsRef.current.length) return;

				const nextAlert = alertsRef.current[0];

				if (nextAlert.callType?.toLowerCase() === "emergency") {
					playSiren();
					return;
				}

				playAlertSound(nextAlert);
			};
			audio.play().catch(() => {});
		};

		const playSiren = () => {
			if (!sirenRef.current) {
				sirenRef.current = new Audio("/sirensound.mp3");
			}

			const siren = sirenRef.current;

			siren.onended = null;
			siren.currentTime = 0;

			siren.onended = () => {
				if (!alertsRef.current.length) return;
				playVoice();
			};

			siren.play().catch(() => {});
		};

		playVoice();
	};

	const handleNewAlert = (data: Alert): void => {
		const callType = data.callType?.toLowerCase();

		if (callType === "cancel" || callType === "acknowledged") {
			setAlerts((prev) => {
				const updated = prev.filter(
					(a) =>
						!(
							a.room === data.room &&
							a.device_type.toLowerCase() === data.device_type.toLowerCase()
						)
				);

				alertsRef.current = updated;

				if (updated.length > 0) {
					playAlertSound(updated[0]);
				} else {
					stopCurrentAudio();
				}

				return updated;
			});

			return;
		}

		data.order = alertCounter.current++;
		const newPriority = priorityMap[data.callType?.toLowerCase()] || 99;

		const currentAlert = alertsRef.current[0];

		const currentPriority = priorityMap[currentAlert?.callType?.toLowerCase()] || 99;

		if (newPriority < currentPriority) {
			stopCurrentAudio();
		}

		setAlerts((prev) => {
			const filtered = prev.filter(
				(a) => !(a.room === data.room && a.device_type.toLowerCase() === data.device_type.toLowerCase())
			);

			const updated = [...filtered, data];

			updated.sort((a, b) => {
				const pa = priorityMap[a.callType?.toLowerCase()] || 99;
				const pb = priorityMap[b.callType?.toLowerCase()] || 99;

				if (pa !== pb) return pa - pb;

				if (a.room === b.room) {
					return (b.order ?? 0) - (a.order ?? 0);
				}

				return b.id - a.id;
			});
			alertsRef.current = updated;

			if (newPriority <= currentPriority || alertsRef.current.length === 1) {
				playAlertSound(data);
			}
			return updated;
		});
	};

	useEffect(() => {
		socketRef.current = io(API_URL, {
			transports: ["websocket"],
		});

		const socket = socketRef.current;

		socket.on("new-alert", handleNewAlert);

		socket.on("existing-alerts", (data: Alert[]) => {
			if (!data || data.length === 0) return;

			const sorted = [...data].map((a) => ({
				...a,
				order: alertCounter.current++,
			}));

			sorted.sort((a, b) => {
				const pa = priorityMap[a.callType?.toLowerCase()] || 99;
				const pb = priorityMap[b.callType?.toLowerCase()] || 99;

				if (pa !== pb) return pa - pb;

				return b.id - a.id;
			});
			alertsRef.current = sorted;
			setAlerts(sorted);

			if (sorted.length > 0 && isUnlockedRef.current) {
				playAlertSound(sorted[0]);
			}
		});

		socket.on("connect", () => {
			setConnectionStatus("connected");
			setServerError(null);
		});

		socket.on("disconnect", () => {
			setConnectionStatus("disconnected");
		});

		socket.on("connect_error", () => {
			setConnectionStatus("disconnected");
		});

		socket.on("server-error", (data: { message: ServerError["message"]; time: string }) => {
			setServerError({
				message: data.message,
				time: new Date(data.time),
			});

			setTimeout(() => setServerError(null), 6000);
		});

		return () => {
			socket.off("new-alert", handleNewAlert);
			socket.off("existing-alerts");
			socket.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const contextValue: AlertContextValue = {
		alerts,
		setAlerts,
		isUnlocked,
		setIsUnlocked,
		connectionStatus,
		setConnectionStatus,
		serverError,
		setServerError,
		socketRef: socketRef as React.RefObject<any>,
		audioRef,
		sirenRef,
		isUnlockedRef,
		alertCounter,
		alertsRef,
		enableAudio,
		from,
		setFrom,
		to,
		setTo,
		reportData,
		setReportData,
		formError,
		setFormError,
		formLoading,
		setFormLoading,
		excelData,
		setExcelData,
	};

	return (
		<AlertContext.Provider value={contextValue}>
			{children}
		</AlertContext.Provider>
	);
};

export default AlertProvider;
