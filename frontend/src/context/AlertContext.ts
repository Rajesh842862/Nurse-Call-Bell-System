import { createContext } from "react";
import { AlertContextValue } from "../types";

export const AlertContext = createContext<AlertContextValue | null>(null);
