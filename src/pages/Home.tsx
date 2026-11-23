import { useEffect } from "react";
import { useRevealAll } from "@/hooks/useReveal";
import { useSpotlight } from "@/hooks/useSpotlight";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/smooth-scroll";
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import Leadership from "@/sections/Leadership";
import Program from "@/sections/Program";
import Statute from "@/sections/Statute";
import Members from "@/sections/Members";
import JoinForm from "@/sections/JoinForm";
import News from "@/sections/News";
import Stats from "@/sections/Stats";
import Footer from "@/sections/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  const rootRef = useRevealAll<HTMLDivElement>();
  useSpotlight();

  useEffect(() => {
    initSmoothScroll();
    return () => destroySmoothScroll();
  }, []);

  return (
    <div ref={rootRef} className="min-h-[100dvh] bg-ink-950 text-paper">
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Stats />
        <Leadership />
        <Program />
        <Statute />
        <Members />
        <JoinForm />
        <News />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
