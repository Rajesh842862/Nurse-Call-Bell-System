import axios from "axios";
import { Bath, BedDouble, DoorOpen, MapPin } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { toast, Toaster } from "sonner";
import LOGO from "../assets/logo/CurovoxPlusLogo.png";
import NavBar from "../components/NavBar";
import useTheme from "../context/Theme/useTheme";
import useAlert from "../context/useAlert";
import "../style/demopage.css";
const devices = [
  {
    id: 1,
    room: "A0201",
    floor: "2",
    tower: "Tower 1",
    location: "Ward A",
    device_type: "Bed Module",
    uid: "UID201",
    callType: "calling",
    attended: 0,
    emp_no: "EMP001",
    name: "Rajesh",
    designation: "Staff Nurse",
    status: "active",
  },
  {
    id: 2,
    room: "A0201",
    floor: "2",
    tower: "Tower 1",
    location: "Ward A",
    device_type: "Toilet Module",
    uid: "UID202",
    callType: "emergency",
    attended: 0,
    emp_no: "EMP002",
    name: "Chandru",
    designation: "Staff Nurse",
    status: "active",
  },
  {
    id: 3,
    room: "A0202",
    floor: "2",
    tower: "Tower 1",
    location: "Ward B",
    device_type: "Bed Module",
    uid: "UID203",
    callType: "acknowledged",
    attended: 1,
    emp_no: "EMP003",
    name: "Chandru",
    designation: "Staff Nurse",
    status: "active",
  },
  {
    id: 4,
    room: "A0203",
    floor: "2",
    tower: "Tower 1",
    location: "Ward C",
    device_type: "Bed Module",
    uid: "UID204",
    callType: "cancel",
    attended: 1,
    emp_no: "EMP004",
    name: "Suresh",
    designation: "Duty Doctor",
    status: "active",
  },
  {
    id: 5,
    room: "A0204",
    floor: "2",
    tower: "Tower 1",
    location: "Ward B",
    device_type: "Bed Module",
    uid: "UID205",
    callType: "code",
    attended: 0,
    emp_no: "EMP005",
    name: "Senthil",
    designation: "Staff Nurse",
    // status: "inactive",
    status: "active",
  },
];

const STORAGE_KEY = "demo-devices";

type ButtonStyle = CSSProperties & {
  "--from": string;
  "--to": string;
  "--glow": string;
  "--text": string;
};

const buttons = [
  { id: "calling", label: "CALL", from: "#43a047", to: "#1b5e20", glow: "rgba(46,125,50,0.5)", text: "#fff" },
  { id: "emergency", label: "EMERGENCY", from: "#e53935", to: "#8e0000", glow: "rgba(198,40,40,0.5)", text: "#fff" },
  { id: "code blue", label: "CODE BLUE", from: "#42a5f5", to: "#0d47a1", glow: "rgba(21,101,192,0.5)", text: "#fff" },
  { id: "acknowledged", label: "ACK", from: "#9d4edd", to: "#5a189a", glow: "rgba(124,58,237,0.5)", text: "#fff" },
  { id: "cancel", label: "CANCEL", from: "#fb923c", to: "#c2410c", glow: "rgba(251,146,60,0.55)", text: "#ffffff" },
];

const DemoMode = () => {
  const { isUnlocked, enableAudio } = useAlert();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { theme } = useTheme();

  // =========================================
  // Create Demo Alert
  // =========================================
  const handleButtonClick = async (device: (typeof devices)[number], callType: string) => {
    try {
      // Prevent multiple clicks
      setLoadingId(device.id);

      const payload = {
        room: device.room,
        floor: device.floor,
        tower: device.tower,
        location: device.location,
        device_type: device.device_type,
        uid: device.uid,
        callType,
        attended: device.attended,
        emp_no: device.emp_no,
        name: device.name,
        designation: device.designation,

        // Static for demo
        placeType: "Patient Room",
      };
      
      toast.promise(axios.post(`${import.meta.env.VITE_SERVER_APP_URL}/api/demo`, payload), {
        loading: "Sending demo alert...",

        success: () => `${device.room.replace(/^[A-Za-z]0*/, "")} ${device.device_type} ${callType.toLocaleUpperCase()}. `,
        error: "Failed to send demo alert",
      });
   
      // Later toast.success(data.message)
    } catch (error) {
      console.error("Demo Alert Error", error);

      // Later toast.error(...)
    } finally {
      setLoadingId(null);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="app-root h-screen">
        <NavBar />

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
      </div>
    );
  }

  return (
    <div className="app-root h-screen">
      <NavBar />
      {/* Heading */}
      <div className="my-5 flex justify-center">
        <div className="inline-flex items-center rounded-sm border demoModeCard  px-5 py-2.5 ">
          {/* LED */}
          <span className="relative mr-3 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60"></span>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-40 [animation-delay:0.2s]"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e]"></span>
          </span>

          <span className="font-mono text-sm font-bold tracking-[5px] uppercase ">Demo Mode</span>
        </div>
      </div>
      {/* Heading */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 ">
        {devices.map((device) => (
          <div key={device.id} className="flex justify-center items-center flex-1 ">
            <div className="panel-container rounded-3xl p-5 w-162.5">
              {/* Display */}
              {/* -------------------------------- Panel Header ------------------------------- */}
              <div className="panel-header">
                <div>
                  <h3 className="panel-room">{device.room}</h3>

                  <p className="panel-device">{device.device_type}</p>
                </div>
                {/*  Logo */}
                <div>
                  <img src={LOGO} alt="CUROVOX+" className="h-[clamp(1.75rem,3vw,3rem)] w-auto  object-contain" />
                </div>
                {/*  Logo */}
                <span className={`panel-status ${device.status} `}>{device.status}</span>
              </div>

              {/* -------------------------------- Panel Header ------------------------------- */}
              <div className="panel-display rounded-xl p-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6    md:gap-8     place-items-center   ">
                  {buttons.map((btn) => {
                    const style: ButtonStyle = {
                      "--from": btn.from,
                      "--to": btn.to,
                      "--glow": btn.glow,
                      "--text": btn.text,
                    };

                    return (
                      <button
                        key={btn.id}
                        disabled={loadingId === device.id}
                        onClick={() => handleButtonClick(device, btn.id)}
                        className="panel-btn relative  w-23 h-23 sm:w-28 sm:h-28  lg:w-30 lg:h-30 rounded-full overflow-hidden select-none disabled:opacity-60 disabled:cursor-not-allowed"
                        style={style}
                      >
                        {/* Top glossy reflection */}
                        <span className="absolute top-[10%] left-[18%] w-[64%] h-[28%] rounded-full bg-white/30 blur-[2px]" />

                        {/* Inner ring */}
                        <span className="absolute inset-1.75 rounded-full border border-white/20" />

                        {/* Label */}
                        <span
                          className={`relative z-10 flex h-full w-full items-center justify-center text-center font-extrabold tracking-wide ${
                            btn.id === "emergency" || btn.id === "code" ? "text-[13px]" : "text-sm"
                          }`}
                          style={{
                            color: btn.text,
                            textShadow: "0 1px 2px rgba(0,0,0,.35)",
                          }}
                        >
                          {btn.label}
                        </span>
                      </button>
                    );
                  })}
                  {/* Display */}
                  {/* RFID */}
                  <div className={`rfid ${device.status} `}>
                    <div className="led"></div>
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13a10 10 0 0 1 14 0" />
                      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
                      <path d="M2 8.82a15 15 0 0 1 20 0" />
                      <line x1="12" x2="12.01" y1="20" y2="20" />
                    </svg>
                    <span className="rfid-label">RFID</span>
                    <div className="scanline"></div>
                  </div>
                </div>
              </div>
              {/* -------------------------------- StatusIndicators  ------------------------------- */}
              <div className="device-status-legend">
                <div className="device-status-item">
                  <span className="status-dots wifi"></span>
                  <span className="status-label">WIFI CONNECTED</span>
                </div>

                <div className="device-status-item">
                  <span className="status-dots no-wifi"></span>
                  <span className="status-label">NO WIFI</span>
                </div>

                <div className="device-status-item">
                  <span className="status-dots ap-mode"></span>
                  <span className="status-label">AP MODE</span>
                </div>
                <div className="device-status-item">
                  <span className="status-dots accessed"></span>
                  <span className="status-label">CARD ACCESSED</span>
                </div>

                <div className="device-status-item">
                  <span className="status-dots sync"></span>
                  <span className="status-label">DATA SYNC</span>
                </div>
              </div>
              {/* -------------------------------- StatusIndicators  ------------------------------- */}
              {/* RFID */}
              {/* Device Details */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Location */}
                <div className="device-card">
                  <MapPin size={22} className="device-icon location" />

                  <div>
                    <p className="device-title">Location</p>

                    <p className="device-value">{device.location}</p>
                  </div>
                </div>

                {/* Room */}
                <div className="device-card">
                  <DoorOpen size={22} className="device-icon room" />

                  <div>
                    <p className="device-title">Room</p>

                    <p className="device-value">{device.room}</p>
                  </div>
                </div>

                {/* Device */}
                <div className="device-card">
                  {device.device_type === "Toilet Module" ? (
                    <Bath size={22} className="device-icon toilet" />
                  ) : (
                    <BedDouble size={22} className="device-icon bed" />
                  )}

                  <div>
                    <p className="device-title">Device</p>
                    <p className="device-value">{device.device_type}</p>
                  </div>
                </div>
              </div>
              {/* Device Details */}
            </div>
          </div>
        ))}
      </div>
      <Toaster theme={theme} richColors position="top-right" />
    </div>
  );
};

export default DemoMode;
