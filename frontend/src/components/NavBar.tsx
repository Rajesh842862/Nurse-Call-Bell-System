import { ChartPie, ChevronLeft, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LOGO from "../assets/logo/CurovoxPlusLogo.png";
import DarkLogo from "../assets/logo/DarkModeCurovoxPlusLogo.png"
import TamsenLogo from "../assets/logo/TamsenLogo.png";
import useAlert from "../context/useAlert";
import useDemoShortcut from "../hooks/useDemoShortcut";
import FullscreenToggle from "./FullscreenToggle";
import ResetConfirmModal from "./ResetConfirmModal";
import ThemeToggle from "./ThemeToggle";
import useTheme from "../context/Theme/useTheme";

const NavBar = () => {
  const navigate = useNavigate();

  const { isDemoMode } = useDemoShortcut();

    const { theme } = useTheme();

  const { connectionStatus, alerts, resetAlerts } = useAlert();
  const [showResetModal, setShowResetModal] = useState(false);

  const closeResetModal = useCallback((): void => {
    setShowResetModal(false);
  }, []);

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
        <div className="curovoxplusLogo">
          <img src={`${theme==="light"?LOGO:DarkLogo}`} className="rounded-sm" alt="LOGO" />
        </div>
        <span className="topbar-title">Wireless Nurse Call Bell</span>
      </div>

      <div className="topbar-right">
        <div className="status-bar">
          <div className={`status-dot ${connectionStatus}`} />
          <span className={`status-text ${connectionStatus}`}>{connectionStatus.toUpperCase()}</span>
        </div>

        <span className="topbar-badge">
          {alerts.length === 0 ? `NO ACTIVE ALERTS    ` : <span className="">{alerts.length} ACTIVE</span>}
        </span>

        {alerts.length > 0 && (
          <div className="reset-alerts-btn" onClick={() => setShowResetModal(true)}>
            <RotateCcw size={14} />
            Reset Alerts
          </div>
        )}

        <div>{isDemoMode && <span className="location-badge">Demo Mode</span>}</div>
        {(locationName && !isDemoMode ) && <span className="location-badge">{locationName}</span>}

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
      {/* Bottom Right Tamsen Logo */}
      {/* <div className="fixed bottom-5 right-7  z-50 pointer-events-none">
        <img src={TamsenLogo} alt="Tamsen" className="h-[clamp(1rem,4vw,2rem)] w-auto object-contain " />
      </div> */}

      <ResetConfirmModal
        isOpen={showResetModal}
        onConfirm={() => {
          setShowResetModal(false);
          resetAlerts();
        }}
        onCancel={closeResetModal}
      />
    </div>
  );
};

export default NavBar;
