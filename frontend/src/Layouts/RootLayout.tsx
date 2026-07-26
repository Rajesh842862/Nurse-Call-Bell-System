import { Route, Routes } from "react-router-dom";
import App from "../App";
import DashBoard from "../components/DashBoard";
import Form from "../components/Form";
import NotFound from "../components/NotFound";
import Reports from "../components/Reports";

const RootLayout = () => {
	return (
		<Routes>
			<Route element={<App />} path="/" />
			<Route element={<Form />} path="/form" />
			<Route element={<Reports />} path="/reports" />
			<Route element={<DashBoard />} path="/dashboard" />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};

export default RootLayout;
