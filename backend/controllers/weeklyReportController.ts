import { Request, Response } from "express";
import { pool } from "../config/db";
import reportGenerate from "../utils/reportGenerate";
import { DailyCallData, GraphDataPoint, ReportCounts } from "../types";

const getWeeklyReports = async (req: Request, res: Response): Promise<void> => {
	try {
		const today = new Date();

		const last7Days = new Date();
		last7Days.setDate(today.getDate() - 6);

		const formatDate = (date: Date): string => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");

			return `${year}-${month}-${day}`;
		};

		const fromDate = formatDate(last7Days);
		const toDate = formatDate(today);

		const query = `
      SELECT *
      FROM ncb_esp
      WHERE date BETWEEN ? AND ?
      ORDER BY date ASC, time ASC, sno ASC
    `;

		const [reports] = await pool.query(query, [fromDate, toDate]);

		const processedReports = reportGenerate(reports as any);

		const dailyCalls: Record<string, DailyCallData> = {};

		const todayStr = formatDate(today);

		const todayCounts: ReportCounts = {
			total_count: 0,
			calling_count: 0,
			emergency_count: 0,
			code_blue_count: 0,
			cancel_count: 0,
			acknowledged_count: 0,
			reset_count: 0,
			bed_count: 0,
			toilet_count: 0,
		};

		const isBed = ["bed", "bed module"];
		const isToilet = ["toilet", "rest room", "restroom", "wash room", "washroom", "bath room", "bathroom", "rest"];

		for (let item of processedReports) {
			const date = item.date;

			if (!dailyCalls[date]) {
				dailyCalls[date] = {
					total_calls: 0,
					bed_count: 0,
					toilet_count: 0,
				};
			}

			dailyCalls[date].total_calls++;

			const deviceType = item?.device_type?.toLowerCase().trim() || "";

			const isBedDevice = isBed.some((k) => deviceType.includes(k));
			const isToiletDevice = isToilet.some((k) => deviceType.includes(k));

			const startType = item?.callType?.toLowerCase() || "";
			const hasEmergency = item?.emergency === "emergency";
			const hasCodeBlue = item?.codeBlue === "code blue";

			if (isBedDevice) {
				dailyCalls[date].bed_count++;
			} else if (isToiletDevice) {
				dailyCalls[date].toilet_count++;
			}

			if (date === todayStr) {
				todayCounts.total_count++;

				if (isBedDevice) {
					todayCounts.bed_count++;
				} else if (isToiletDevice) {
					todayCounts.toilet_count++;
				}

				if (startType === "calling") {
					todayCounts.calling_count++;
				} else if (startType === "emergency") {
					todayCounts.emergency_count++;
				} else if (startType === "code blue") {
					todayCounts.code_blue_count++;
				}

				if (hasCodeBlue && startType !== "code blue") {
					todayCounts.code_blue_count++;
				}

				if (hasEmergency && startType !== "emergency") {
					todayCounts.emergency_count++;
				}

				const status = item.status?.toLowerCase();

				if (status === "cancelled") {
					todayCounts.cancel_count++;
				} else if (status === "acknowledged") {
					todayCounts.acknowledged_count++;
				} else if (status === "reset") {
					todayCounts.reset_count++;
				}
			}
		}

		const graphData: GraphDataPoint[] = [];

		for (let i = 0; i < 7; i++) {
			const d = new Date(last7Days);
			d.setDate(d.getDate() + i);

			const dateStr = formatDate(d);

			graphData.push({
				date: dateStr,
				total_calls: dailyCalls[dateStr]?.total_calls || 0,
				bed_count: dailyCalls[dateStr]?.bed_count || 0,
				toilet_count: dailyCalls[dateStr]?.toilet_count || 0,
			});
		}

		res.json({
			success: true,
			range: { fromDate, toDate },
			graphData,
			todayCounts,
		});
	} catch (err) {
		console.error("Weekly Report Error:", "------------------Weeekly DataBase connection Failed");
		res.status(500).json({
			message: "Weeekly Reports DataBase connection Failed",
		});
	}
};

export { getWeeklyReports };
