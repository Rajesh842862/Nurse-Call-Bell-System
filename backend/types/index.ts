import { RowDataPacket } from "mysql2";

export interface NcbEspRow extends RowDataPacket {
	id: number;
	room: string;
	device_type: string;
	callType: string;
	location: string;
	timestamp: string;
	emp_no?: string;
	name?: string;
	designation?: string;
}

export interface ActiveAlert {
	id: number;
	room: string;
	device_type: string;
	callType: string;
	location: string;
	timestamp: string;
	emp_no?: string;
	name?: string;
	designation?: string;
	audio: string;
	order?: number;
}

export interface AlertData {
	id: number;
	room: string;
	device_type: string;
	callType: string;
	location: string;
	timestamp: string;
	emp_no?: string;
	name?: string;
	designation?: string;
	audio: string;
}

export interface ProcessedReport {
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
	duration: number | null;
	status: string;
	statusTime: string;
}

export interface ReportCounts {
	total_count: number;
	calling_count: number;
	emergency_count: number;
	code_blue_count: number;
	cancel_count: number;
	acknowledged_count: number;
	bed_count: number;
	toilet_count: number;
}

export interface DailyCallData {
	total_calls: number;
	bed_count: number;
	toilet_count: number;
}

export interface GraphDataPoint {
	date: string;
	total_calls: number;
	bed_count: number;
	toilet_count: number;
}

export interface ReportResponse {
	success: boolean;
	data: ProcessedReport[];
	counts: ReportCounts;
}

export interface WeeklyReportResponse {
	success: boolean;
	range: { fromDate: string; toDate: string };
	graphData: GraphDataPoint[];
	todayCounts: ReportCounts;
}

export interface ServerErrorPayload {
	type: string;
	message: string;
	error?: string;
}

export interface SocketErrorPayload {
	success: false;
	message: ServerErrorPayload;
	time: Date;
}
