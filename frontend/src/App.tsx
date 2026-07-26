import { Phone, TriangleAlert } from "lucide-react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "./index.css";

import BlueCodeBed from "./assets/BlueCodeBed.png";
import BlueCodeToilet from "./assets/BlueCodeToilet.png";
import CallingBed from "./assets/CallingBed.png";
import CallingToilet from "./assets/CallingToilet.png";
import EmergencyBed from "./assets/EmergencyBed.png";
import EmergencyToilet from "./assets/EmergencyToilet.png";

import { useEffect, useState } from "react";
import heartBeat from "./assets/wired-outline-1249-heart-beat-loop-cycle.gif";
import NavBar from "./components/NavBar";
import Slider from "./components/Slider";
import useTheme from "./context/Theme/useTheme";
import useAlert from "./context/useAlert";

function App() {
	const { alerts, enableAudio, isUnlocked, connectionStatus, serverError } = useAlert();
	const { theme } = useTheme();
	const [isMobile, setIsMobile] = useState(window.innerWidth < 740);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 740);
		};

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const roomNumberFormat = (room: string): string => {
		const cleanRoom = room.replace(/^[A-Za-z]+/, "");
		const noLeadingZero = cleanRoom.replace(/^0+/, "") || "0";
		return noLeadingZero;
	};

	useEffect(() => {
		if (serverError?.message?.message) {
			toast.error(serverError.message.message, {
				position: "top-right",
				autoClose: 5000,
				pauseOnFocusLoss: true,
				pauseOnHover: true,
				draggable: true,
				theme: theme === "light" ? "light" : "dark",
				toastId: "server-error",
				transition: Bounce,
				style: { zIndex: 99, width: "300px", fontSize: "13px", top: "100px", left: "-30px" },
			});
		}
	}, [serverError, theme]);

	const codeBlue = alerts.filter((a) => a.callType?.toLowerCase() === "code blue").sort((a, b) => (b.order ?? 0) - (a.order ?? 0))[0];

	const isToilet = ["toilet", "rest room", "restroom", "wash room", "washroom", "bath room", "bathroom", "rest"];

	if (codeBlue && isUnlocked) {
		return (
			<div className="bluecode-screen relative  ">
				<img className="size-28" src={heartBeat} alt="beat" />
				<div className="bluecode-title  flex justify-center items-center">CODE BLUE </div>
				<div className="bluecode-room ">ROOM {roomNumberFormat(codeBlue.room)}</div>
				<span className=" text-[#ffffff99] bluecode-timeStamp font-sans tracking-widest uppercase">
					{new Date(codeBlue?.timestamp)
						.toLocaleString("en-GB", {
							month: "2-digit",
							day: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
							hour12: true,
						})
						.replace(/\//g, "-")
						.replace(",", "")}
				</span>
				{codeBlue?.device_type.toLowerCase().includes("bed") && <img className="w-25" src={BlueCodeBed} alt="Bed" />}
				{isToilet.some((r) => codeBlue?.device_type.toLowerCase().includes(r)) && (
					<img className="w-27" src={BlueCodeToilet} alt="Toilet" />
				)}
				<div className="bluecode-location">{codeBlue?.device_type} </div>

				<div className="flex items-center gap-4  absolute top-6 right-6">
					<div className="border w-4 h-4 flex justify-center items-center rounded-full  animate-ping">
						<div className="w-2 h-2 bg-blue-100    rounded-full " />
					</div>
					<span className="text-[#ffffff99] text-sm  tracking-[5px]">ACTIVE</span>
				</div>
			</div>
		);
	}

	const total = alerts.length;

	const cols = isMobile
		? 1
		: Math.ceil(Math.sqrt(total));
	const rows = Math.ceil(total / cols);

	return (
		<div className="app-root h-screen ">
			<NavBar />
			{connectionStatus === "disconnected" ? (
				<div className="disconnected-screen">
					<div className="disconnected-icon">{"\u26A1"}</div>
					<div className="disconnected-title">SERVER DISCONNECTED</div>
					<div className="disconnected-sub">
						CONNECTION LOST
						<br />
						ATTEMPTING TO RECONNECT...
					</div>
				</div>
			) : !isUnlocked ? (
				<div className="idle-container fade-animation">
					<div className="idle-text">
						AUDIO LOCKED
						<br />
						CLICK TO ENABLE ALERT
					</div>

					<button className="enable-btn" onClick={enableAudio}>
						ENABLE AUDIO
					</button>
				</div>
			) : alerts.length === 0 ? (
				<Slider />
			) : (
				<div
					className="alerts-grid"
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(${cols}, 1fr)`,
						gridTemplateRows: isMobile ? "auto" : `repeat(${rows}, 1fr)`,
						overflowY: isMobile ? "auto" : "hidden",
					}}
				>
					{alerts?.map((alert) => {
						const id = alert?.id;

						return (
							<div
								key={id}
								className={`alert-card  h-full ${isMobile && "min-h-125"} w-full ${alert.callType?.toLowerCase().replace(" ", "-")}`}
							>
								<div className="alert-type flex justify-center  gap-2 items-center">
									<span>
										{alert?.callType.toLowerCase() === "calling" && (
											<Phone className="w-[clamp(10px,2cqw,22px)] h-[clamp(10px,2cqw,22px)]" />
										)}
										{alert?.callType.toLowerCase() === "emergency" && (
											<TriangleAlert className="w-[clamp(10px,2cqw,22px)] h-[clamp(10px,2cqw,22px)]" />
										)}
									</span>
									{alert?.callType}
								</div>

								<div className="alert-location">{alert?.location}</div>
								<div className="alert-room">ROOM {roomNumberFormat(alert?.room)}</div>

								<div className="alert-location">
									<span className="block mb-3 ">
										{new Date(alert?.timestamp)
											.toLocaleString("en-GB", {
												month: "2-digit",
												day: "2-digit",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
												second: "2-digit",
												hour12: true,
											})
											.replace(/\//g, "-")
											.replace(",", "")}
									</span>
									{alert?.device_type?.toLowerCase().includes("bed") &&
										(theme === "light" ? (
											<img
												className="w-[clamp(20px,10cqw,100px)] h-auto object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
												src={`${alert?.callType.toLowerCase() === "calling" ? BlueCodeBed : BlueCodeBed}`}
												alt="Bed"
											/>
										) : (
											<img
												className="w-[clamp(20px,10cqw,100px)] h-auto object-contain"
												src={`${alert?.callType.toLowerCase() === "calling" ? CallingBed : EmergencyBed}`}
												alt="Bed"
											/>
										))}
									{isToilet.some((k) => alert?.device_type?.toLowerCase().includes(k)) &&
										(theme === "light" ? (
											<img
												className="w-[clamp(20px,10cqw,100px)] h-auto object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
												src={`${alert?.callType.toLowerCase() === "calling" ? BlueCodeToilet : BlueCodeToilet}`}
												alt="Toilet"
											/>
										) : (
											<img
												className="w-[clamp(20px,10cqw,100px)] h-auto object-contain"
												src={`${alert?.callType.toLowerCase() === "calling" ? CallingToilet : EmergencyToilet}`}
												alt="Toilet"
											/>
										))}
									{alert?.device_type}
								</div>
							</div>
						);
					})}
				</div>
			)}
			<ToastContainer limit={3} />
		</div>
	);
}

export default App;
