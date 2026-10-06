import { TopBar } from "./components/TopBar";
import { Hero } from "./components/Hero";
import { Story } from "./components/Story";
import { FeatureGrid } from "./components/FeatureGrid";
import { WhoFor } from "./components/WhoFor";
import { Pitch } from "./components/Pitch";
import { Closing } from "./components/Closing";
import { Footer } from "./components/Footer";
import { useReveal } from "./useReveal";
import { LegalPage } from "./components/LegalPage";
import privacy from "./content/legal/privacy.md?raw";
import terms from "./content/legal/terms.md?raw";

export default function App() {
  useReveal();
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path === "/privacy") return <LegalPage title="Privacy Policy" source={privacy} />;
  if (path === "/terms") return <LegalPage title="Terms of Use" source={terms} />;
  return (
    <>
      <TopBar />
      <main>
        <Hero />
        <Story />
        <FeatureGrid />
        <WhoFor />
        <Pitch />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
