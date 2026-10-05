import { EdgeTTS } from "node-edge-tts";
import path from "path";
import fs from "fs/promises";
import { audioDir } from "../config/paths";

const sanitizeFilenameSegment = (value: string): string => {
	return value
		.replace(/[\\/]/g, "_")
		.replace(/\.\./g, "")
		.replace(/\s+/g, " ")
		.trim();
};

export function generateAudioFilename<T extends { toString: () => string }>(
	roomNumber: T,
	device_type: T,
	call_type: T
): string {
	const room = sanitizeFilenameSegment(roomNumber.toString());
	const device = sanitizeFilenameSegment(device_type.toString());
	const call = sanitizeFilenameSegment(call_type.toString());

	return `${room}_${device}_${call}.mp3`;
}

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

		const filename = generateAudioFilename(roomNumber, device_type, call_type);
		const filePath = path.join(audioDir, filename);

		await fs.mkdir(audioDir, { recursive: true });

		const fileExists = await fs
			.access(filePath)
			.then(() => true)
			.catch(() => false);

		if (fileExists) {
			const stat = await fs.stat(filePath);

			if (stat.size > 0) {
				console.log(`File already exists. Skipping TTS for ${roomNumber} ${call_type}`);
				return filePath;
			}

			console.warn(`Existing audio file is empty (0 bytes). Regenerating for ${roomNumber} ${call_type}`);
			await fs.rm(filePath, { force: true });
		}

		const tts = new EdgeTTS({
			voice: "en-IN-NeerjaNeural",
			outputFormat: "audio-24khz-96kbitrate-mono-mp3",
			pitch: "+2%",
			rate: "-10%",
			volume: "100%",
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

		const stat = await fs.stat(filePath);

		if (stat.size === 0) {
			throw new Error(`TTS produced an empty MP3 for ${roomNumber} ${call_type}`);
		}

		console.log(`MP3 Generated Successfully ${roomNumber} -> ${filename} (${stat.size} bytes)`);

		return filePath;
	} catch (error) {
		console.error("TTS Error:", error);
		throw error;
	}
}

export default generate;
