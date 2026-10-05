import { Request, Response } from "express";
import { pool } from "../config/db";
import { DemoRequest } from "../types/demo.types";

const ALLOWED_CALL_TYPES = ["calling", "emergency", "code blue", "cancel", "acknowledged"];

const createDemoAlert = async (req: Request<unknown, unknown, DemoRequest>, res: Response): Promise<void> => {
  try {
    const { room, floor, callType, device_type, card_number, location, tower, placeType, attended, date, time, emp_no, name, designation } =
      req.body;

    const requiredValues = [room, floor, callType, device_type, card_number, location, tower, placeType, attended, date, time, emp_no, name, designation];
    if (requiredValues.some((value) => typeof value !== "string" || value.trim() === "")) {
      res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      res.status(400).json({ success: false, message: "date and time must use YYYY-MM-DD and HH:mm:ss." });
      return;
    }

    if (!ALLOWED_CALL_TYPES.includes(callType.toLowerCase())) {
      res.status(400).json({
        success: false,
        message: "Invalid call type.",
      });
      return;
    }

    const sql = `
        INSERT INTO ncb_esp(
            room,
            floor,
            callType,
            device_type,
            card_number,
            location,
            tower,
            placeType,
            attended,
            date,
            time,
            emp_no,
            name,
            designation
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    await pool.execute(sql, [
      room,
      floor,
      callType,
      device_type,
      card_number,
      location,
      tower,
      placeType,
      attended,
      date,
      time,
      emp_no,
      name,
      designation,
    ]);

    res.status(201).json({
      success: true,
      message: "Alert Created Successfully",
    });
  } catch (error) {
   console.error("Create Demo Alert Error:", error);

    res.status(500).json({
      success: false,
      message: "Database Error",
    });
  }
};

export { createDemoAlert };
