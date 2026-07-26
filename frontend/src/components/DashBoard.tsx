import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../context/Theme/useTheme";
import useAlert from "../context/useAlert";
import "../index.css";
import NavBar from "./NavBar";
import TodayCounts from "./TodayCounts";
import WeeklyChart from "./WeeklyChart";
import { WeeklyReportResponse } from "../types";

const DashBoard = () => {
	const { isUnlocked, enableAudio, alerts } = useAlert();
	const [graphData, setGraphData] = useState<WeeklyReportResponse>({} as WeeklyReportResponse);
	const [data, setData] = useState<WeeklyReportResponse>({} as WeeklyReportResponse);
	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState("");

	const { theme } = useTheme();

	const codeBlue = alerts.filter((a) => a.callType?.toLowerCase() === "code blue").sort((a, b) => (b.order ?? 0) - (a.order ?? 0))[0];

	const navigate = useNavigate();

	useEffect(() => {
		if (codeBlue) {
			navigate("/");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [codeBlue]);

	useEffect(() => {
		const fetchData = async () => {
			const BASE_URL = import.meta.env.VITE_SERVER_APP_URL as string;

			try {
				setLoading(true);
				const res = await fetch(`${BASE_URL}/api/weekly/report`);

				if (!res.ok) {
					const errData = await res.json();
					throw new Error(errData.message);
				}

				const data: WeeklyReportResponse = await res?.json();

				setGraphData(data);
				setData(data);
			} catch (error) {
				console.error("API Error:", error);
				setFormError(`Failed to Fetch Data`);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="app-root h-screen  items-center overflow-x-hidden  scroll-smooth ">
			<NavBar />
			{!isUnlocked ? (
				<div className="idle-container overflow-hidden  fade-animation">
					<div className="idle-text">
						AUDIO LOCKED
						<br />
						CLICK TO ENABLE ALERT
					</div>

					<button className="enable-btn" onClick={enableAudio}>
						ENABLE AUDIO
					</button>
				</div>
			) : formError ? (
				<div className="flex justify-center items-center flex-1">
					<p className="text-center fade-animation text-xl text-[clamp(14px,3vw,2rem)] uppercase animate-pulse text-red-500">
						<span className="  relative -top-0.5"></span> {formError}
					</p>
				</div>
			) : loading ? (
				<div className="flex flex-col gap-8 justify-center items-center flex-1">
					<span className="loader"></span>
					<span className="animate-pulse text-[clamp(20px,2.8vw,20px)] font-[Roboto_Condensed] uppercase tracking-widest font-semibold">
						Loading Report...
					</span>
				</div>
			) : (
				<div className="flex justify-center items-center flex-col flex-1 ">
					<div>
						<h3 className="text-[clamp(1.5rem,2vw,2rem)] font-medium flex fade-animation flex-col  tracking-widest uppercase text-(--accent) text-center mb-2  font-[Roboto_Condensed]">
							Today's Call Summary
						</h3>
						<TodayCounts data={data} />
					</div>

					<WeeklyChart graphData={graphData} theme={theme} />
				</div>
			)}
		</div>
	);
};

export default DashBoard;
