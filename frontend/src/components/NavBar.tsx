import { ChartPie, ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LOGO from "../assets/TamsenLogo.png";
import useAlert from "../context/useAlert";
import FullscreenToggle from "./FullscreenToggle";
import ThemeToggle from "./ThemeToggle";

const NavBar = () => {
	const navigate = useNavigate();

	const { connectionStatus, alerts } = useAlert();

	const isDashboard = useLocation().pathname;

	const handleNavigate = (): void => {
		if (isDashboard === "/") {
			navigate("/dashboard");
		} else if (isDashboard === "/dashboard") {
			navigate("/");
		} else if (isDashboard === "/reports") {
			navigate("/");
		} else {
			navigate(-1);
		}
	};

	const locationName = alerts[0]?.location || localStorage.getItem("lastLocation");

	useEffect(() => {
		if (alerts.length > 0 && alerts[0]?.location) {
			localStorage.setItem("lastLocation", alerts[0].location);
		}
	}, [alerts]);

	return (
		<div id="#topbar" className="topbar w-full ">
			<div className="topbar-left sm:gap-0 ">
				<div className="tamsen">
					<img src={LOGO} alt="LOGO" />
				</div>
				<span className="topbar-title">Live Alerts</span>
			</div>

			<div className="topbar-right">
				<div className="status-bar">
					<div className={`status-dot ${connectionStatus}`} />
					<span className={`status-text ${connectionStatus}`}>
						{connectionStatus.toUpperCase()}
					</span>
				</div>

				<span className="topbar-badge">
					{alerts.length === 0 ? (
						`NO ACTIVE ALERTS    `
					) : (
						<span className="">{alerts.length} ACTIVE</span>
					)}
				</span>

				{locationName && <span className="location-badge">{locationName}</span>}

				<div onClick={handleNavigate} className={isDashboard === "/" ? "reports-badge" : "nav-back"}>
					{isDashboard === "/" ? (
						<>
							<ChartPie size={18} />
							Dashboard
						</>
					) : (
						<>
							<ChevronLeft size={15} />
							<span className="relative right-1.5">Back</span>
						</>
					)}
				</div>

				<FullscreenToggle />
				<ThemeToggle />
			</div>
		</div>
	);
};

export default NavBar;
