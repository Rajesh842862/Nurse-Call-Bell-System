import express from "express";
import { getWeeklyReports } from "../controllers/weeklyReportController";

const router = express.Router();

router.get("/weekly/report", getWeeklyReports);

export default router;
