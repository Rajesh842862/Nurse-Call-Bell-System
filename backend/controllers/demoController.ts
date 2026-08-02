import { Request, Response } from "express";
import { pool } from "../config/db";
import { DemoRequest } from "../types/demo.types";

const ALLOWED_CALL_TYPES = ["calling", "emergency", "code blue", "cancel", "acknowledged"];

const createDemoAlert = async (req: Request<unknown, unknown, DemoRequest>, res: Response): Promise<void> => {
  try {
    const { room, floor, callType, device_type, uid, location, tower, placeType, attended, emp_no, name, designation } =
      req.body;

    if (
      !room?.trim() ||
      !floor?.trim() ||
      !callType?.trim() ||
      !device_type?.trim() ||
      !uid?.trim() ||
      !location?.trim() ||
      !tower?.trim() ||
      !placeType?.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
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
            uid,
            location,
            tower,
            placeType,
            attended,
            timestamp,
            emp_no,
            name,
            designation
        )
        VALUES(?,?,?,?,?,?,?,?,?,NOW(),?,?,?)
    `;

    await pool.execute(sql, [
      room,
      floor,
      callType,
      device_type,
      uid,
      location,
      tower,
      placeType,
      attended,
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
