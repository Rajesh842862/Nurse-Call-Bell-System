import { EdgeTTS } from "node-edge-tts";
import path from "path";
import fs from "fs/promises";

async function generate(roomNumber: string, call_type: string, device_type: string): Promise<string> {
	try {
		if (!roomNumber) {
			throw new Error("Room number is Missing!");
		}

		if (!call_type) {
			throw new Error("Call type is Missing!");
		}

		if (!device_type) {
			throw new Error("Device type is Missing!");
		}

		const filePath = path.join(__dirname, "..", "public", "audio", `${roomNumber}_${device_type}_${call_type}.mp3`);

		const audioDir = path.join(__dirname, "..", "public", "audio");
		await fs.mkdir(audioDir, { recursive: true });

		try {
			await fs.access(filePath);
			console.log(`File already exists. Skipping TTS for ${roomNumber} ${call_type}`);
			return filePath;
		} catch (_) {
			// File doesn't exist, proceed with generation
		}

		const tts = new EdgeTTS({
			voice: "en-IN-NeerjaNeural",
			outputFormat: "audio-24khz-96kbitrate-mono-mp3",
			pitch: "+2%",
			rate: "-10%",
			volume: "0%",
			timeout: 20000,
		});

		const cleanRoom = roomNumber.replace(/^[A-Za-z]+/, "");
		const noLeadingZero = cleanRoom.replace(/^0+/, "") || "0";
		const digits = noLeadingZero.split("").join(" ");

		if (call_type.toLowerCase() === "emergency") {
			await tts.ttsPromise(`${digits} ${device_type}`, filePath);
		} else {
			await tts.ttsPromise(`${digits} ${device_type} ${call_type}`, filePath);
		}

		console.log(`MP3 Generated Successfully ${roomNumber}`);

		return filePath;
	} catch (error) {
		console.error("TTS Error:", error);
		throw error;
	}
}

export default generate;
