import { Request, Response } from "express";
import { pool } from "../config/db";
import reportGenerate from "../utils/reportGenerate";
import { ProcessedReport, ReportCounts } from "../types";

interface ReportQuery {
	fromDate?: string;
	toDate?: string;
}

const getAllReports = async (req: Request<unknown, unknown, unknown, ReportQuery>, res: Response): Promise<void> => {
	try {
		const { fromDate, toDate } = req.query;

		if (!fromDate || !toDate) {
			res.status(400).json({ message: "Dates required" });
			return;
		}

		const query = `
      SELECT *
      FROM ncb_esp
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC, time DESC, sno DESC
    `;

		const [reports] = await pool.query(query, [fromDate, toDate]);
		const processedReports = reportGenerate(reports as any);

		const counts: ReportCounts = {
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

		for (let i = 0; i < processedReports.length; i++) {
			const item = processedReports[i];

			counts.total_count++;

			const startType = item.callType?.toLowerCase();
			const hasEmergency = item.emergency === "emergency";
			const hasCodeBlue = item.codeBlue === "code blue";
			const deviceType = item?.device_type?.toLowerCase().trim() || "";
			const isBed = ["bed", "bed module"];
			const isToilet = [
				"toilet",
				"rest room",
				"restroom",
				"wash room",
				"washroom",
				"bath room",
				"bathroom",
				"rest",
			];

			if (deviceType) {
				if (isBed.some((k) => deviceType.includes(k))) {
					counts.bed_count++;
				} else if (isToilet.some((k) => deviceType.includes(k))) {
					counts.toilet_count++;
				}
			}

			if (startType === "calling") {
				counts.calling_count++;
			} else if (startType === "emergency") {
				counts.emergency_count++;
			} else if (startType === "code blue") {
				counts.code_blue_count++;
			}

			if (hasCodeBlue && startType !== "code blue") {
				counts.code_blue_count++;
			}

			if (hasEmergency && startType !== "emergency") {
				counts.emergency_count++;
			}

			if (item.status === "Cancelled") {
				counts.cancel_count++;
			} else if (item.status === "Acknowledged") {
				counts.acknowledged_count++;
			} else if (item.status === "Reset") {
				counts.reset_count++;
			}
		}

		res.json({
			success: true,
			data: processedReports,
			counts,
		});
	} catch (error) {
		console.error("Report API Error:", error);

		if (error instanceof RangeError) {
			res.status(500).json({
				message: "Too much data to process. Please select a smaller date range",
			});
			return;
		}

		const err = error as Error;
		res.status(500).json({ message: err.message || "server Error" });
	}
};

export { getAllReports };
