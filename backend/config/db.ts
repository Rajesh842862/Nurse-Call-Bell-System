import mysql from "mysql2/promise";
import mysql2Callback from "mysql2";
import EventEmitter from "events";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER,
	password: process.env.DB_PASS || "",
	database: process.env.DB_NAME,
	dateStrings: true,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callbackPool: any = mysql2Callback.createPool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER,
	password: process.env.DB_PASS || "",
	database: process.env.DB_NAME,
	dateStrings: true,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

(pool as unknown as EventEmitter).on("error", (err: Error) => {
	console.error("Unexpected MySQL pool error:", err.message);
});

async function testConnection(): Promise<void> {
	try {
		const connection = await pool.getConnection();
		console.log("DB Connected Successfully");
		connection.release();
	} catch (err) {
		const error = err as Error;
		console.error("DB Connection Failed:", error.message);
	}
}

testConnection();

export { pool, callbackPool };
