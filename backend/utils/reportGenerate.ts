import { NcbEspRow, ProcessedReport } from "../types";

interface ActiveCall {
	sno: number;
	room: string;
	floor: string;
	device_type: string;
	callType: string;
	card_number: string;
	location: string;
	tower: string;
	placeType: string;
	attended: string;
	date: string;
	time: string;
	time_of_DB: string;
	emp_no: string;
	name: string;
	designation: string;
	startTime: string;
	callRaised: string;
	emergency: string;
	emergencyTime: string;
	codeBlue: string;
	codeBlueTime: string;
}

const eventDateTime = (item: Pick<NcbEspRow, "date" | "time">): string => `${item.date}T${item.time}`;

// Empty values and display placeholders are absent; zero is a supplied value.
const hasMetadata = (value: unknown): boolean =>
	value !== null && value !== undefined && String(value).trim() !== "" && String(value).trim() !== "-";

const reportGenerate = (data: NcbEspRow[]): ProcessedReport[] => {
	const START_TYPES = ["calling", "emergency", "code blue"];
	const END_TYPES = ["cancel", "acknowledged", "reset"];

	const sorted = [...data].sort((a, b) => eventDateTime(a).localeCompare(eventDateTime(b)) || a.sno - b.sno);

	const result: ProcessedReport[] = [];
	const activeCalls: Record<string, ActiveCall> = {};

	for (let i = 0; i < sorted.length; i++) {
		const item = sorted[i];
		const key = `${item.room}_${item.device_type}`;
		const type = item.callType?.toLowerCase();
		const itemDateTime = eventDateTime(item);

		if (START_TYPES.includes(type)) {
			if (!activeCalls[key]) {
				activeCalls[key] = {
					sno: item.sno,
					room: item.room,
					floor: item.floor,
					device_type: item.device_type,
					callType: item.callType,
					card_number: item.card_number,
					location: item.location,
					tower: item.tower,
					placeType: item.placeType,
					attended: item.attended,
					date: item.date,
					time: item.time,
					time_of_DB: item.time_of_DB,
					emp_no: "",
					name: "",
					designation: "",
					// emp_no: item.emp_no,
					// name: item.name,
					// designation: item.designation,
					startTime: itemDateTime,
					callRaised: type === "calling" ? "calling" : type,
					emergency: type === "emergency" ? "emergency" : "-",
					emergencyTime: type === "emergency" ? itemDateTime : "-",
					codeBlue: type === "code blue" ? "code blue" : "-",
					codeBlueTime: type === "code blue" ? itemDateTime : "-",
				};
			} else {
				if (type === "emergency") {
					activeCalls[key].emergency = "emergency";
					activeCalls[key].emergencyTime = itemDateTime;
				}

				if (type === "code blue") {
					activeCalls[key].codeBlue = "code blue";
					activeCalls[key].codeBlueTime = itemDateTime;
				}
			}
		}

		if (END_TYPES.includes(type)) {
			const active = activeCalls[key];

			if (active) {
				const endTime = itemDateTime;

				const duration = Math.floor((new Date(endTime).getTime() - new Date(active.startTime).getTime()) / 1000);
				// Cancel / Reset reports must never show employee identity.
				const isReset = type === "reset";
				const isCancel = type === "cancel";
				const hideEmployee = isReset || isCancel;
				// Select one identity snapshot rather than mixing different employees' fields.
				const employee = !hideEmployee && [item.emp_no, item.name, item.designation].some(hasMetadata) ? item : active;
				const attended = !hideEmployee && hasMetadata(item.attended) ? item.attended : active.attended;

				result.push({
					sno: active.sno,
					room: active.room,
					floor: active.floor,
					device_type: active.device_type,
					callType: active.callRaised,
					card_number: active.card_number,
					location: active.location,
					tower: active.tower,
					placeType: active.placeType,
					attended,
					date: active.date,
					time: active.time,
					time_of_DB: active.time_of_DB,
					emp_no: hideEmployee ? "" : employee.emp_no,
					name:  hideEmployee ? "" : employee.name,
					designation: hideEmployee ? "" : employee.designation,
					emergency: active.emergency,
					emergencyTime: active.emergencyTime,
					codeBlue: active.codeBlue,
					codeBlueTime: active.codeBlueTime,
					duration,
					status: type === "cancel" ? "Cancelled" : type === "acknowledged" ? "Acknowledged" : "Reset",
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
			sno: active.sno,
			room: active.room,
			floor: active.floor,
			device_type: active.device_type,
			callType: active.callRaised,
			card_number: active.card_number,
			location: active.location,
			tower: active.tower,
			placeType: active.placeType,
			attended: active.attended,
			date: active.date,
			time: active.time,
			time_of_DB: active.time_of_DB,
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
