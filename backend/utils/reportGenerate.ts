import { NcbEspRow, ProcessedReport } from "../types";

interface ActiveCall {
	id: number;
	room: string;
	device_type: string;
	callType: string;
	location: string;
	timestamp: string;
	emp_no?: string;
	name?: string;
	designation?: string;
	startTime: string;
	callRaised: string;
	emergency: string;
	emergencyTime: string;
	codeBlue: string;
	codeBlueTime: string;
}

const reportGenerate = (data: NcbEspRow[]): ProcessedReport[] => {
	const START_TYPES = ["calling", "emergency", "code blue"];
	const END_TYPES = ["cancel", "acknowledged"];

	const sorted = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

	const result: ProcessedReport[] = [];
	const activeCalls: Record<string, ActiveCall> = {};

	for (let i = 0; i < sorted.length; i++) {
		const item = sorted[i];
		const key = `${item.room}_${item.device_type}`;
		const type = item.callType?.toLowerCase();

		if (START_TYPES.includes(type)) {
			if (!activeCalls[key]) {
				activeCalls[key] = {
					id: item.id,
					room: item.room,
					device_type: item.device_type,
					callType: item.callType,
					location: item.location,
					timestamp: item.timestamp,
					emp_no: item.emp_no,
					name: item.name,
					designation: item.designation,
					startTime: item.timestamp,
					callRaised: type === "calling" ? "calling" : type,
					emergency: type === "emergency" ? "emergency" : "-",
					emergencyTime: type === "emergency" ? item.timestamp : "-",
					codeBlue: type === "code blue" ? "code blue" : "-",
					codeBlueTime: type === "code blue" ? item.timestamp : "-",
				};
			} else {
				if (type === "emergency") {
					activeCalls[key].emergency = "emergency";
					activeCalls[key].emergencyTime = item.timestamp;
				}

				if (type === "code blue") {
					activeCalls[key].codeBlue = "code blue";
					activeCalls[key].codeBlueTime = item.timestamp;
				}
			}
		}

		if (END_TYPES.includes(type)) {
			const active = activeCalls[key];

			if (active) {
				const endTime = item.timestamp;

				const duration = Math.floor((new Date(endTime).getTime() - new Date(active.startTime).getTime()) / 1000);

				result.push({
					id: active.id,
					room: active.room,
					device_type: active.device_type,
					callType: active.callRaised,
					location: active.location,
					timestamp: active.startTime,
					emp_no: active.emp_no,
					name: active.name,
					designation: active.designation,
					emergency: active.emergency,
					emergencyTime: active.emergencyTime,
					codeBlue: active.codeBlue,
					codeBlueTime: active.codeBlueTime,
					duration,
					status: type === "cancel" ? "Cancelled" : "Acknowledged",
					statusTime: endTime,
					startTime: active.startTime,
					callRaised: active.callRaised,
				});

				delete activeCalls[key];
			}
		}
	}

	Object.values(activeCalls).forEach((active) => {
		result.push({
			id: active.id,
			room: active.room,
			device_type: active.device_type,
			callType: active.callRaised,
			location: active.location,
			timestamp: active.startTime,
			emp_no: active.emp_no,
			name: active.name,
			designation: active.designation,
			emergency: active.emergency,
			emergencyTime: active.emergencyTime,
			codeBlue: active.codeBlue,
			codeBlueTime: active.codeBlueTime,
			duration: null,
			status: "Running \u23F3",
			statusTime: "-",
			startTime: active.startTime,
			callRaised: active.callRaised,
		});
	});

	return result;
};

export default reportGenerate;
