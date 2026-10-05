import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RootLayout from "./Layouts/RootLayout";
import AlertProvider from "./context/AlertProvider";
import ThemeProvider from "./context/Theme/ThemeProvider";

const base = import.meta.env.BASE_URL;
const basename = base === "/" ? undefined : base.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BrowserRouter basename={basename} >
      <AlertProvider>
        <RootLayout />
      </AlertProvider>
    </BrowserRouter>
  </ThemeProvider>,
);
