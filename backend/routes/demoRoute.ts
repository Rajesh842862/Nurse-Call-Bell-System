import express from "express";
import { createDemoAlert } from "../controllers/demoController";

const router = express.Router();

router.post("/", createDemoAlert);

export default router;