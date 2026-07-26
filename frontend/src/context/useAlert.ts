import { useContext } from "react";
import { AlertContext } from "./AlertContext";
import { AlertContextValue } from "../types";

const useAlert = (): AlertContextValue => {
	const context = useContext(AlertContext);

	if (!context) {
		console.log("useAlert must be used within AlertProvider");
		throw new Error("useAlert must be used within AlertProvider");
	}

	return context;
};

export default useAlert;
