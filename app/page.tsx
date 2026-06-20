import { CinematicPreloader } from "@/components/cinematic-preloader";
import { FilmRollHero } from "@/components/film-roll-hero";
import { ReelSection } from "@/components/reel-section";
import { About } from "@/components/sections/about";
import { Process } from "@/components/sections/process";
import { Metrics } from "@/components/sections/metrics";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <CinematicPreloader />
      <main id="main-content" className="relative">
        <FilmRollHero />
        <ReelSection />
        <About />
        <Process />
        <Metrics />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
