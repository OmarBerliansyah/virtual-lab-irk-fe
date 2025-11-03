import { createRoot } from "react-dom/client";
import { ClerkProvider } from '@clerk/clerk-react';
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);
