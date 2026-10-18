import { TopBar } from "./components/TopBar";
import { Hero } from "./components/Hero";
import { Steps } from "./components/Steps";
import { Story } from "./components/Story";
import { FeatureGrid } from "./components/FeatureGrid";
import { WhoFor } from "./components/WhoFor";
import { Agencies } from "./components/Agencies";
import { Closing } from "./components/Closing";
import { Footer } from "./components/Footer";
import { useReveal } from "./useReveal";
import { lazy, Suspense } from "react";

const LegalRoute = lazy(() => import("./components/LegalRoute"));

export default function App() {
  useReveal();
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path === "/privacy" || path === "/terms")
    return (
      <Suspense fallback={null}>
        <LegalRoute which={path === "/privacy" ? "privacy" : "terms"} />
      </Suspense>
    );
  return (
    <>
      <TopBar />
      <main>
        <Hero />
        <Steps />
        <Story />
        <FeatureGrid />
        <WhoFor />
        <Agencies />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
