export interface Alert {
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

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export type Theme = "dark" | "light";

export interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

export interface ServerErrorMessage {
	type: string;
	message: string;
	error?: string;
}

export interface ServerError {
	message: ServerErrorMessage;
	time: Date;
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
	emergency: string;
	emergencyTime: string;
	codeBlue: string;
	codeBlueTime: string;
	duration: number | null;
	status: string;
	statusTime: string;
}

export interface ReportResponse {
	success: boolean;
	data: ProcessedReport[];
	counts: ReportCounts;
}

export interface GraphDataPoint {
	date: string;
	total_calls: number;
	bed_count: number;
	toilet_count: number;
}

export interface WeeklyReportResponse {
	success: boolean;
	range: { fromDate: string; toDate: string };
	graphData: GraphDataPoint[];
	todayCounts: ReportCounts;
}

export interface AlertContextValue {
	alerts: Alert[];
	setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
	isUnlocked: boolean;
	setIsUnlocked: React.Dispatch<React.SetStateAction<boolean>>;
	connectionStatus: ConnectionStatus;
	setConnectionStatus: React.Dispatch<React.SetStateAction<ConnectionStatus>>;
	serverError: ServerError | null;
	setServerError: React.Dispatch<React.SetStateAction<ServerError | null>>;
	socketRef: React.RefObject<any>;
	audioRef: React.RefObject<HTMLAudioElement | null>;
	sirenRef: React.RefObject<HTMLAudioElement | null>;
	isUnlockedRef: React.RefObject<boolean>;
	alertCounter: React.RefObject<number>;
	alertsRef: React.RefObject<Alert[]>;
	enableAudio: () => void;
	from: string;
	setFrom: React.Dispatch<React.SetStateAction<string>>;
	to: string;
	setTo: React.Dispatch<React.SetStateAction<string>>;
	reportData: ProcessedReport[];
	setReportData: React.Dispatch<React.SetStateAction<ProcessedReport[]>>;
	formError: string;
	setFormError: React.Dispatch<React.SetStateAction<string>>;
	formLoading: boolean;
	setFormLoading: React.Dispatch<React.SetStateAction<boolean>>;
	excelData: ReportResponse;
	setExcelData: React.Dispatch<React.SetStateAction<ReportResponse>>;
}
