import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import AnimatedWaveBackground from "./utils/AnimatedWaveBackground.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AnimatedWaveBackground />
    <App />
  </BrowserRouter>
);
