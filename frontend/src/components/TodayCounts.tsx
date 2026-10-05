import type { MouseEvent } from "react";
import { Bath, BedDouble, CheckCircle, PhoneCall, RotateCcw, Siren, XCircle } from "lucide-react";

import heartBeat from "../assets/wired-outline-1249-heart-beat-loop-cycle2.gif";
import useTheme from "../context/Theme/useTheme";
import { WeeklyReportResponse } from "../types";

interface TodayCountsProps {
	data: WeeklyReportResponse;
}

const TodayCounts = ({ data }: TodayCountsProps) => {
	const counts = data?.todayCounts;

	const { theme } = useTheme();

	if (!counts) return <div className="text-center my-4 font-[Roboto_Condensed] text-red-500">No Data Found</div>;

	const trackSpotlight = (event: MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
		event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
	};

	const card = `today-count-card flex flex-col items-center justify-center w-48 h-48 gap-3 rounded-2xl shadow-md ${theme === "dark" && "bg-[var(--count-bg)] border border-[var(--count-border)]"} `;

	return (
		<div className="flex flex-wrap justify-center fade-animation gap-6 mt-2 text-center font-[Roboto_Condensed]">
			<div id="card" className="flex flex-col  items-center gap-2">
				<div className={` ${card} bg-(--pastel-success) `} onMouseMove={trackSpotlight}>
					<PhoneCall className="text-(--count-success) mb-1" size={30} />
					<p className="text-lg font-bold text-(--count-success) uppercase">Total Calls</p>
					<p className="text-3xl font-bold text-(--count-success)">{counts.total_count}</p>
				</div>
			</div>
			<div
				id="card"
				className={`today-count-card flex gap-4 items-center justify-center fade-animation w-auto min-w-48 h-48 rounded-2xl shadow-md bg-(--pastel-bed) ${theme === "dark" && " bg-(--count-bg)! border-(--count-border) border"}`}
				onMouseMove={trackSpotlight}>
				<div className="flex flex-col gap-3 items-center ">
					<BedDouble className="text-(--count-bed)" size={30} />
					<p className="text-lg font-bold text-(--text)/50 uppercase">Bed</p>
					<p className="font-bold text-(--count-bed) text-3xl">{counts.bed_count}</p>
				</div>

				<div className="h-10 w-px bg-(--count-border)"></div>

				<div className="flex flex-col gap-3 items-center">
					<Bath className="text-(--count-toilet)" size={30} />
					<p className="text-lg font-bold text-(--text)/50 uppercase">Toilet</p>
					<p className="font-bold text-(--count-toilet) text-3xl">{counts.toilet_count}</p>
				</div>
			</div>

			<div id="card" className={` ${card} bg-(--pastel-danger) `} onMouseMove={trackSpotlight}>
				<Siren className="text-(--count-danger) mb-1" size={30} />
				<p className="text-lg font-bold text-(--count-danger) uppercase">Emergency</p>
				<p className="text-3xl font-bold text-(--count-danger)">{counts.emergency_count}</p>
			</div>

			<div id="card" className={` ${card} bg-(--pastel-info) `} onMouseMove={trackSpotlight}>
				<img src={heartBeat} alt="blue" className="size-10 mb-1" />
				<p className="text-lg font-bold text-(--count-info) uppercase">Code Blue</p>
				<p className="text-3xl font-bold text-(--count-info)">{counts.code_blue_count}</p>
			</div>

			<div id="card" className={` ${card} bg-(--pastel-warning) `} onMouseMove={trackSpotlight}>
				<XCircle className="text-(--count-warning) mb-1" size={30} />
				<p className="text-lg font-bold text-(--count-warning) uppercase">Cancelled</p>
				<p className="text-3xl font-bold text-(--count-warning)">{counts.cancel_count}</p>
			</div>

			<div id="card" className={` ${card} bg-(--pastel-purple) `} onMouseMove={trackSpotlight}>
				<CheckCircle className="text-(--count-purple) mb-1" size={30} />
				<p className="text-lg font-bold text-(--count-purple) uppercase">Ack</p>
				<p className="text-3xl font-bold text-(--count-purple)">{counts.acknowledged_count}</p>
			</div>

			<div id="card" className={` ${card} bg-(--pastel-reset) `} onMouseMove={trackSpotlight}>
				<RotateCcw className="text-(--count-reset) mb-1" size={30} />
				<p className="text-lg font-bold text-(--count-reset) uppercase">Reset</p>
				<p className="text-3xl font-bold text-(--count-reset)">{counts.reset_count}</p>
			</div>
		</div>
	);
};

export default TodayCounts;
