import { TopBar } from "./components/TopBar";
import { Hero } from "./components/Hero";
import { Story } from "./components/Story";
import { FeatureGrid } from "./components/FeatureGrid";
import { WhoFor } from "./components/WhoFor";
import { Trust } from "./components/Trust";
import { Closing } from "./components/Closing";
import { Footer } from "./components/Footer";
import { useReveal } from "./useReveal";

export default function App() {
  useReveal();
  return (
    <>
      <TopBar />
      <main>
        <Hero />
        <Story />
        <FeatureGrid />
        <WhoFor />
        <Trust />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
