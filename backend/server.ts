import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { pool } from "./config/db";
import weeklyReportRoutes from "./routes/weeklyReportRoute";
import reportRoutes from "./routes/reportRoute";
import demoRoutes from "./routes/demoRoute";
import generate, { generateAudioFilename } from "./service/ttsService";
import { publicDir } from "./config/paths";
import { ActiveAlert, AlertData, NcbEspRow, ServerErrorPayload } from "./types";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());
app.use(express.static(publicDir));

app.get("/", (_req, res) => {
	res.status(200).json({
		success: true,
	});
});

app.use("/api/report", reportRoutes);
app.use("/api", weeklyReportRoutes);
app.use("/api/demo", demoRoutes);

app.post("/api/reset-alerts", async (_req, res) => {
	try {
		const alertsToReset = [...activeAlerts];

		if (alertsToReset.length === 0) {
			res.json({ success: true, resetCount: 0 });
			return;
		}

		for (const alert of alertsToReset) {
			await pool.execute(
				`INSERT INTO ncb_esp
				 (room, floor, callType, device_type, card_number, location, tower, placeType, attended, date, time, emp_no, name, designation)
				 VALUES (?, ?, 'reset', ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?)`,
				[
					alert.room,
					alert.floor,
					alert.device_type,
					alert.card_number,
					alert.location,
					alert.tower,
					alert.placeType,
					alert.attended,
					alert.emp_no,
					alert.name,
					alert.designation,
				]
			);
		}

		const [maxRow] = await pool.query("SELECT sno FROM ncb_esp ORDER BY sno DESC LIMIT 1");
		const typed = maxRow as { sno: number }[];

		if (typed.length > 0) {
			lastSno = typed[0].sno;
		}

		activeAlerts = [];

		io.emit("reset-alerts");

		console.log(`Reset ${alertsToReset.length} alert(s)`);

		res.json({ success: true, resetCount: alertsToReset.length });
	} catch (error) {
		const err = error as Error;
		console.error("Reset Alerts Error:", err.message);

		res.status(500).json({ success: false, message: "Failed to reset alerts" });
	}
});

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: process.env.FRONTEND_URL,
		methods: ["GET", "POST"],
	},
});

let activeAlerts: ActiveAlert[] = [];

const sendErrorToFrontend = (message: ServerErrorPayload): void => {
	io.emit("server-error", {
		success: false,
		message,
		time: new Date(),
	});
};

let lastSno = 0;
let isChecking = false;
let pollingStarted = false;

const initializeLastId = async (): Promise<void> => {
	try {
		const [rows] = await pool.query("SELECT sno FROM ncb_esp ORDER BY sno DESC LIMIT 1");

		const typedRows = rows as { sno: number }[];

		if (typedRows.length > 0) {
			lastSno = typedRows[0].sno;
		}

		console.log("Starting lastSno:", lastSno);

		if (!pollingStarted) {
			pollingStarted = true;
			setInterval(checkNewEntry, 1000);
			console.log("Polling started");
		}
	} catch (err) {
		console.error("Initialization Error:", "Database Connection failed");

		sendErrorToFrontend({
			type: "DB_CONNECTION_ERROR",
			message: "Database connection failed. Retrying...",
			error: (err as Error).message,
		});

		setTimeout(initializeLastId, 500);
	}
};

initializeLastId();

const checkNewEntry = async (): Promise<void> => {
	if (isChecking) return;
	isChecking = true;

	try {
		const [rows] = await pool.query("SELECT * FROM ncb_esp WHERE sno > ? ORDER BY sno ASC", [lastSno]);

		const typedRows = rows as NcbEspRow[];

		for (const row of typedRows) {
			const callType = row.callType?.toLowerCase();

			if (callType !== "cancel" && callType !== "acknowledged" && callType !== "reset") {
				try {
					await generate(row.room, row.callType, row.device_type);
				} catch (error) {
					const err = error as Error;
					console.error("Audio generation failed:", err.message);
					if (err.message === "getaddrinfo ENOTFOUND speech.platform.bing.com") {
						sendErrorToFrontend({
							type: "Audio generation failed EDGE TTS ERROR",
							message: "Kindly check your internet , audio generate failed!",
							error: err.message,
						});
					} else {
						sendErrorToFrontend({
							type: "Audio generation failed EDGE TTS ERROR",
							message: err.message,
							error: err.message,
						});
					}
				}
			}

			const alertData: AlertData = {
				...row,
				audio: `/audio/${generateAudioFilename(row.room, row.device_type, row.callType)}`,
			};

			if (callType === "cancel" || callType === "acknowledged" || callType === "reset") {
				activeAlerts = activeAlerts.filter(
					(a) =>
						!(
							a.room === row.room &&
							a.device_type.toLowerCase() === row.device_type.toLowerCase()
						)
				);
			} else {
				activeAlerts = activeAlerts.filter(
					(a) =>
						!(
							a.room === row.room &&
							a.device_type.toLowerCase() === row.device_type.toLowerCase()
						)
				);
				activeAlerts.unshift(alertData);
			}

			io.emit("new-alert", alertData);

			lastSno = row.sno;
		}
	} catch (error) {
		const err = error as Error;
		console.error("Check Entry Error:", err.message);

		sendErrorToFrontend({
			type: "SERVER_ERROR",
			message: "Database connection  or Audio failed !",
			error: err.message,
		});

		setTimeout(initializeLastId, 1000);
	} finally {
		isChecking = false;
	}
};

io.on("connection", (socket) => {
	console.log("Client Connected:", socket.id);

	const priorityMap: Record<string, number> = {
		"code blue": 1,
		emergency: 2,
		calling: 3,
	};

	const sortedAlerts = [...activeAlerts].sort((a, b) => {
		const pa = priorityMap[a.callType?.toLowerCase()] || 99;
		const pb = priorityMap[b.callType?.toLowerCase()] || 99;

		if (pa !== pb) return pa - pb;

		if (a.room !== b.room) {
			return a.room.localeCompare(b.room);
		}

		return b.sno - a.sno;
	});

	socket.emit("existing-alerts", sortedAlerts);

	socket.on("disconnect", () => {
		console.log("Client Disconnected:", socket.id);
	});
});

process.on("unhandledRejection", (err) => {
	console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
