import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RootLayout from "./Layouts/RootLayout";
import AlertProvider from "./context/AlertProvider";
import ThemeProvider from "./context/Theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
	<ThemeProvider>
		<BrowserRouter>
			<AlertProvider>
				<RootLayout />
			</AlertProvider>
		</BrowserRouter>
	</ThemeProvider>
);
