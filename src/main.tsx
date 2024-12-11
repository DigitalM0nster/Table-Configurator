import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./CSS/fonts.scss";
import "./CSS/index.scss";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
