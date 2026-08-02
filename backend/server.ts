import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { pool } from "./config/db";
import weeklyReportRoutes from "./routes/weeklyReportRoute";
import reportRoutes from "./routes/reportRoute";
import demoRoutes from "./routes/demoRoute";
import generate from "./service/ttsService";
import { ActiveAlert, AlertData, ServerErrorPayload } from "./types";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.static("public"));

app.get("/", (_req, res) => {
	res.status(200).json({
		success: true,
	});
});

app.use("/api/report", reportRoutes);
app.use("/api", weeklyReportRoutes);
app.use("/api/demo", demoRoutes);

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

let lastId = 0;
let isChecking = false;
let pollingStarted = false;

const initializeLastId = async (): Promise<void> => {
	try {
		const [rows] = await pool.query("SELECT id FROM ncb_esp ORDER BY id DESC LIMIT 1");

		const typedRows = rows as { id: number }[];

		if (typedRows.length > 0) {
			lastId = typedRows[0].id;
		}

		console.log("Starting lastId:", lastId);

		if (!pollingStarted) {
			pollingStarted = true;
			setInterval(checkNewEntry, 1000);
			console.log("Polling started");
		}
	} catch (err) {
		console.error("Initialization Error:", "Database Connection failed");

		setTimeout(initializeLastId, 500);
	}
};

initializeLastId();

const checkNewEntry = async (): Promise<void> => {
	if (isChecking) return;
	isChecking = true;

	try {
		const [rows] = await pool.query("SELECT * FROM ncb_esp WHERE id > ? ORDER BY id ASC", [lastId]);

		const typedRows = rows as any[];

		for (const row of typedRows) {
			const callType = row.callType?.toLowerCase();

			if (callType !== "cancel" && callType !== "acknowledged") {
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
				audio: `/audio/${row.room}_${row.device_type.toLowerCase()}_${row.callType.toLowerCase()}.mp3`,
			};

			if (callType === "cancel" || callType === "acknowledged") {
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

			lastId = row.id;
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

		return b.id - a.id;
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
