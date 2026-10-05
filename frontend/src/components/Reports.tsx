import { useVirtualizer } from "@tanstack/react-virtual";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";
import useTheme from "../context/Theme/useTheme";
import useAlert from "../context/useAlert";
import AlertCounts from "./AlertCounts";
import NavBar from "./NavBar";

import noDataImg from "../assets/dataNotFound.png";

const Reports = () => {
	const { isUnlocked, reportData, alerts, enableAudio, formError, from, to, formLoading } = useAlert();
	const [selectedRow, setSelectedRow] = useState<number | null>(null);

	const { theme } = useTheme();

	const formatTime = (sec: number | null): string => {
		if (sec === null) return "Running \u23F3";

		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;

		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	};

	const formatDate = (date: string): string => {
		return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "numeric",
			year: "numeric",
		});
	};

	const codeBlue = alerts.filter((a) => a.callType?.toLowerCase() === "code blue").sort((a, b) => (b.order ?? 0) - (a.order ?? 0))[0];

	const navigate = useNavigate();

	useEffect(() => {
		if (codeBlue) {
			navigate("/");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [codeBlue]);

	const getCallColor = (type: string): string => {
		switch (type?.toLowerCase()) {
			case "emergency":
				return "text-(--count-danger)";
			case "code blue":
				return "text-(--count-info)";
			case "calling":
				return "text-(--count-success)";
			case "acknowledged":
				return "text-(--count-purple)";
			case "cancelled":
				return "text-(--count-warning)";
			case "reset":
				return "text-cyan-500";
			default:
				return "";
		}
	};

	const roomNumberFormat = (room: string): string => {
		const cleanRoom = room.replace(/^[A-Za-z]+/, "");
		const noLeadingZero = cleanRoom.replace(/^0+/, "") || "0";
		return noLeadingZero;
	};

	const downloadCSV = (): void => {
		if (!reportData || reportData.length === 0) return;
		try {
			const formatDateCSV = (value: string): string => {
				const d = new Date(`${value}T00:00:00`);
				return value && !isNaN(d.getTime()) ? d.toLocaleDateString("en-GB") : "-";
			};

			const formatTimeCSV = (value: string): string => {
				const d = new Date(value);
				return value && !isNaN(d.getTime()) ? d.toLocaleTimeString("en-IN") : "-";
			};

			const formatDuration = (seconds: number | null): string => {
				if (!seconds || isNaN(seconds)) return "-";

				const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
				const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
				const secs = String(seconds % 60).padStart(2, "0");

				return `${hrs}:${mins}:${secs}`;
			};

			const formattedData = reportData.map((item, index) => ({
				"S.No": index + 1,
				Date: formatDateCSV(item.date),
				Location: item.location,
				Room: roomNumberFormat(item?.room) || "-",
				DeviceType: item.device_type || "-",
			/* ------------------------- Card Number Hide ----------------------------- */
			/* 	"Card Number": item.card_number || "-", */
			/* ------------------------- Attended Hide ----------------------------- */
			/* 	Attended: item.attended || "-", */
				"Call Raised": item.callType || "-",
				"Call Raised Time": formatTimeCSV(item.startTime),

				Emergency: item.emergency || "-",
				"Emergency Time": formatTimeCSV(item.emergencyTime),

				"Code Blue": item.codeBlue || "-",
				"Code Blue Time": formatTimeCSV(item.codeBlueTime),

				"Ack / Canceled / Reset": item.status || "-",
				"Ack / Cancel /Reset Time": formatTimeCSV(item.statusTime),

				Duration: formatDuration(item.duration),
				"Emp No": item.emp_no || "-",
				"Employee Name": item.name || "-",
				Designation: item.designation || "-",
			}));

			const csv = Papa.unparse(formattedData, {
				quotes: true,
				skipEmptyLines: true,
			});

			const blob = new Blob(["\uFEFF" + csv], {
				type: "text/csv;charset=utf-8;",
			});

			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `Tamsen Alert Reports - ( ${formatDateCSV(from)} - ${formatDateCSV(to)} ).csv`;
			link.click();

			URL.revokeObjectURL(url);

			toast.success("CSV download started", {
				position: "top-right",
				autoClose: 5000,
				pauseOnFocusLoss: true,
				pauseOnHover: true,
				draggable: true,

				toastId: "server-error",
				transition: Bounce,
				style: { zIndex: 99, width: "300px", fontSize: "13px", top: "100px", left: "-30px" },
			});
		} catch (error) {
			console.error("CSV Export Error:", error);
		}
	};

	const gridStyle: React.CSSProperties = {
	  display: "grid",
	gridTemplateColumns: `
    60px
    repeat(14, minmax(150px, 1fr))
    minmax(240px, 1.5fr)
    minmax(240px, 1.6fr)
  `,
	};

	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: reportData?.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 53,
		overscan: 5,
	});

	return (
		<div className="app-root h-screen">
			<NavBar />

			{!isUnlocked ? (
				<div className="idle-container  fade-animation">
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
				<div className="flex justify-center items-center h-screen">
					<p className="text-center fade-animation text-xl text-[clamp(14px,3vw,2rem)] uppercase animate-pulse text-red-500">
						<span className="  relative -top-0.5">{"\u26A0\uFE0F"}</span> {formError}
					</p>
				</div>
			) : formLoading ? (
				<div className="flex flex-col gap-8 justify-center items-center h-full">
					<span className="loader"></span>
					<span className="animate-pulse text-[clamp(20px,2.8vw,20px)] font-[Roboto_Condensed] uppercase tracking-widest font-semibold">
						Loading Report...
					</span>
				</div>
			) : reportData?.length === 0 ? (
				<div className="flex justify-center fade-animation flex-col gap-7 items-center h-screen ">
					<img
						src={noDataImg}
						className="w-full max-w-2xl saturate-110 mx-auto fade-animation"
						alt="No Data Found"
					/>

					<span className="uppercase tracking-wider text-[clamp(18px,2.8vw,22px)] fade-animation text-center animate-pulse">
						No records found for the selected date range!
					</span>
					<button
						onClick={() => navigate("/form")}
						className="
            fade-animation
    px-[clamp(12px,4vw,20px)]
    py-[clamp(8px,2.5vw,12px)]
    text-[clamp(15px,2.8vw,18px)]
    
    border border-(--neon-purple)
    text-(--neon-purple)
    bg-(--neon-purple-bg)

    uppercase cursor-pointer rounded

    hover:bg-(--neon-purple)
    hover:text-white
    hover:shadow-[0_0_12px_var(--neon-purple)]   

    transition-all duration-300 ease-in-out
    active:scale-95
  ">
						Try selecting a different date range
					</button>
				</div>
			) : (
				<div className="flex flex-col   sm:max-h-[calc(130vh-100px)] [@media(min-width:1537px)]:max-h-[calc(100vh-100px)] ">
					<div className="text-center mt-6 font-[Roboto_Condensed] font-bold  flex justify-center  items-center gap-10  shrink-0">
						<span className="text-[clamp(20px,3vw,25px)]  table-report  tracking-wide uppercase text-(--text)">
							System-generated report for the selected period : {formatDate(from)} {"\u2013"}{" "}
							{formatDate(to)}
						</span>
					</div>
					<AlertCounts />

					<button
						onClick={downloadCSV}
						className="
    flex items-center gap-2 self-end fade-animation px-5 py-2 z-10  my-5
        relative -left-6
    border  font-[Roboto_Condensed]
    rounded-lg font-medium tracking-wide cursor-pointer border-(--csv)
  text-(--csv)
  bg-(--csv-bg)

  hover:bg-(--csv)
  hover:text-white
  hover:shadow-[0_0_10px_var(--csv)]
    active:scale-90
  ">
						<Download size={16} />
						CSV
					</button>

					<div
						ref={parentRef}
						className="mx-4 mb-8 border border-(--table-border) fade-animation bg-(--table-bg)  overflow-auto max-h-200 "
						style={{
							scrollbarWidth: "thin",
							scrollbarColor: "var(--table-border) var(--table-bg)",
						}}>
						<div className="min-w-350 table-report font-[Roboto_Condensed] font-bold">
							<div
								style={gridStyle}
								className="sticky top-0 z-50 bg-(--table-header) border-(--table-border) uppercase text-lg text-center">
								<div className="border-l border-r text-white border-b bg-(--table-header) border-(--table-border) py-3">
									S.No
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Date
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Location
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Room
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Device
								</div>
								{/* ------------------ Card Number Hide ---------------------- */}
								{/* <div className="border-r border-b text-white py-3 bg-(--table-header) border-(--table-border)">
									Card Number
								</div> */}
								{/* ------------------ Attended Hide ---------------------- */}
								{/* <div className="border-r border-b text-white py-3 bg-(--table-header) border-(--table-border)">
									Attended
								</div> */}
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Call Raised
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Time
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Emg
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Emg.Time
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									C.B
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									C.B Time
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Status
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Time
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Duration
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Emp No
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Name
								</div>
								<div className="border-r border-b text-white  py-3 bg-(--table-header) border-(--table-border)">
									Designation
								</div>
							</div>

							<div
								style={{
									height: `${rowVirtualizer.getTotalSize()}px`,
									position: "relative",
								}}>
								{rowVirtualizer.getVirtualItems().map((virtualRow) => {
									const item = reportData[virtualRow.index];

									return (
										<div
											key={virtualRow.key}
											style={{
												...gridStyle,
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: "53px",
												transform: `translateY(${virtualRow.start}px)`,
											}}
											onClick={() =>
												setSelectedRow(
													selectedRow === virtualRow.index
														? null
														: virtualRow.index
												)
											}
											className="group text-lg text-center  border-(--table-border) cursor-pointer">
											<div
												className={`border-l border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{virtualRow.index + 1}.
											</div>

											<div
												className={`border-r border-b uppercase border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
								{formatDate(item.date)}
											</div>
											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.location}
											</div>
											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{roomNumberFormat(item.room)}
											</div>

											<div
												className={` border-r capitalize border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.device_type || "-"}
											</div>
											{/* ------------------ Card Number Hide ---------------------- */}
											{/* <div className={`uppercase border-r border-b border-(--table-border) py-3 transition ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.card_number || "-"}
											</div> */}
											{/* ------------------ Attended Hide ---------------------- */}
											{/* <div className={`uppercase border-r border-b border-(--table-border) py-3 transition ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.attended || "-"}
											</div> */}

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"} 
              ${getCallColor(item.callType)}`}>
												{item.callType || "-"}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
								{new Date(item.startTime).toLocaleTimeString("en-IN")}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 text-red-500 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.emergency}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.emergencyTime === "-"
													? "-"
													: new Date(item.emergencyTime).toLocaleTimeString("en-IN")}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 text-(--count-info) transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.codeBlue}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.codeBlueTime === "-"
													? "-"
													: new Date(item.codeBlueTime).toLocaleTimeString("en-IN")}
											</div>

											<div
												className={`border-r ${getCallColor(item.status)} uppercase border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.status}
											</div>

											<div
												className={`border-r border-b uppercase border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.statusTime === "-"
													? "-"
													: new Date(item.statusTime).toLocaleTimeString("en-IN")}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{formatTime(item.duration)}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.emp_no || "-"}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.name || "-"}
											</div>

											<div
												className={`uppercase border-r border-b border-(--table-border) py-3 transition 
              ${selectedRow === virtualRow.index ? "bg-(--table-hover)" : "group-hover:bg-(--table-hover)"}`}>
												{item.designation || "-"}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			)}
			<ToastContainer
				position="top-right"
				autoClose={3000}
				theme={theme}
				pauseOnFocusLoss={true}
				pauseOnHover={true}
				limit={3}
				draggable={true}
				transition={Bounce}
			/>
		</div>
	);
};

export default Reports;
