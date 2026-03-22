import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { captureReferralCode } from "@/hooks/useReferral";

// Capture referral code from URL on first load
captureReferralCode();

createRoot(document.getElementById("root")!).render(<App />);
