import axios from "axios";
import { CalendarDays } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import NurseWorkingLaptop from "../assets/png/NurseWorkingLaptop.png";
import useTheme from "../context/Theme/useTheme";
import useAlert from "../context/useAlert";
import NavBar from "./NavBar";
import { ReportResponse } from "../types";

const Form = () => {
	const {
		isUnlocked,
		enableAudio,
		alerts,
		from,
		setFrom,
		to,
		setTo,
		setReportData,
		setFormError,
		formLoading,
		setFormLoading,
		setExcelData,
	} = useAlert();

	const { theme } = useTheme();

	const BASE_URL = import.meta.env.VITE_SERVER_APP_URL as string;

	const getReport = async (): Promise<void> => {
		try {
			if (!from || !to) {
				toast.error("From Date and To Date are Required !", {
					position: "top-right",
					autoClose: 5000,
					pauseOnFocusLoss: true,
					pauseOnHover: true,
					draggable: true,
					theme: theme === "light" ? "light" : "dark",
					transition: Bounce,
					style: {
						zIndex: 99,
						width: "300px",
						fontSize: "13px",
						top: "50px",
						left: "-30px",
					},
					toastId: "date-error",
				});
				return;
			}
			navigate("/reports");
			setFormError("");
			setFormLoading(true);

			const res = await axios.get<ReportResponse>(`${BASE_URL}/api/report`, {
				params: {
					fromDate: from,
					toDate: to,
				},
			});

			setExcelData(res.data);

			const result = res.data.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

			setReportData(result);
		} catch (err) {
			console.error(err || "Server error");
			setFormError(`Failed to fetch report`);
		} finally {
			setFormLoading(false);
		}
	};

	const codeBlue = alerts.filter((a) => a.callType?.toLowerCase() === "code blue").sort((a, b) => (b.order ?? 0) - (a.order ?? 0))[0];
	const navigate = useNavigate();
	useEffect(() => {
		if (codeBlue) {
			navigate("/");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [codeBlue]);

	const handleClear = (): void => {
		setFrom("");
		setTo("");
	};

	return (
		<div className="app-root h-screen  overflow-auto! ">
			<NavBar />

			{!isUnlocked ? (
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
			) : (
				<div className="mt-4">
					<h3 className="text-[clamp(1.7rem,4vw,2.2rem)] fade-animation font-medium tracking-widest  uppercase text-(--accent) text-center mt-4 font-[Roboto_Condensed] leading-tight ">
						Call Activity Reports
					</h3>

					<p className="text-[clamp(0.8rem,2.5vw,1.1rem)] fade-animation text-center uppercase mt-1 font-[Roboto_Condensed] tracking-wide text-(--text-muted)  italic ">
						Select a date range to generate reports
					</p>

					<div className=" flex-wrap gap-18 my-4   max-w-6xl mx-auto fade-animation table-report font-[Roboto_Condensed] lg:flex-row px-4 py-13 items-center justify-around  h-[calc(100vh-42%)]   font-bold flex ">
						<div className="w-full max-w-md flex justify-center fade-animation">
							<img
								className="w-full h-auto object-contain rounded-xl"
								src={NurseWorkingLaptop}
								alt="Calendar"
							/>
						</div>

						<div className=" bg-(--form-bg) border border-(--form-transparent)   rounded-xl  flex flex-col w-full max-w-xl    rajesh-shadow  ">
							<div className="flex items-center gap-3 px-4 py-3 border-b border-(--form-border) ">
								<CalendarDays size={26} />
								<span className="text-[clamp(20px,2.5vw,1.5rem)] tracking-wider text-center">
									SELECT REPORT PERIOD
								</span>
							</div>

							<div className="p-1 sm:p-4 sm:py-4 flex flex-col mt-4  w-full sm:flex-row gap-4 md:gap-10 ">
								<div className="flex flex-col gap-3 md:gap-8 flex-1 ">
									<label
										onClick={() =>
											(document.getElementById("from") as HTMLInputElement)?.showPicker()
										}
										htmlFor="from"
										className="text-center text-[clamp(19px,2.5vw,1.3rem)] cursor-pointer">
										FROM DATE
									</label>
									<input
										id="from"
										value={from}
										onChange={(e) => setFrom(e.target.value)}
										type="date"
										className="border flex justify-center items-center border-(--form-input-border) text-[clamp(17px,2.5vw,1.2rem)]  bg-(--form-input-bg) selection:bg-blue-100 text-(--text) table-report py-4 mx-auto sm:mx-0    rounded p-2  uppercase   focus:outline-2  cursor-pointer "
									/>
								</div>

								<div className="flex flex-col gap-3 md:gap-8 flex-1 ">
									<label
										onClick={() =>
											(document.getElementById("to") as HTMLInputElement)?.showPicker()
										}
										htmlFor="to"
										className="text-center text-[clamp(19px,2.5vw,1.3rem)] cursor-pointer">
										TO DATE
									</label>
									<input
										id="to"
										value={to}
										onChange={(e) => setTo(e.target.value)}
										type="date"
										className="flex justify-center items-center border border-(--form-input-border) text-[clamp(17px,2.5vw,1.2rem)]  bg-(--form-input-bg) text-(--text) uppercase py-4  mx-auto sm:mx-0  rounded p-2 table-report focus:outline-2 cursor-pointer"
									/>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-3 p-4 my-4">
								<button
									onClick={handleClear}
									className="w-full py-4 order-2 sm:order-0  text-[clamp(15px,2.5vw,1.1rem)] px-2  sm:w-1/2 uppercase cursor-pointer tracking-widest text-sm  
                  text-(--form-danger)
                  border border-(--form-danger)

                  bg-(--form-danger-bg)

                    hover:bg-(--form-danger)
                 hover:text-white
                 active:scale-95 transition-all hover:shadow-[0_0_12px_var(--form-danger)]   duration-200">
									Clear Dates
								</button>
								<button
									onClick={getReport}
									disabled={formLoading}
									className="
                   py-4
                 text-[clamp(15px,2.5vw,1.1rem)] 
                  px-2 sm:w-1/2 uppercase cursor-pointer tracking-widest
                  w-full
                  text-(--form-success)
                  border border-(--form-success)
                  bg-(--form-success-bg)

                  hover:bg-(--form-success)
                  hover:shadow-[0_0_12px_var(--form-success)]
                  hover:text-white

                  active:scale-95 transition-all duration-200

                  disabled:bg-(--btn-disabled-bg)
                  disabled:text-(--btn-disabled-text)
                  disabled:border-(--btn-disabled-border)
                  disabled:cursor-not-allowed
                  disabled:shadow-none
                         ">
									{formLoading ? "Loading..." : "Generate Report"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<ToastContainer limit={3} />
		</div>
	);
};

export default Form;
