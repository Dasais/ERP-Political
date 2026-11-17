import { useEffect } from "react";
import { useRevealAll } from "@/hooks/useReveal";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/smooth-scroll";
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import Leadership from "@/sections/Leadership";
import Program from "@/sections/Program";
import Statute from "@/sections/Statute";
import Members from "@/sections/Members";
import JoinForm from "@/sections/JoinForm";
import News from "@/sections/News";
import Footer from "@/sections/Footer";

export default function Home() {
  const rootRef = useRevealAll<HTMLDivElement>();

  useEffect(() => {
    initSmoothScroll();
    return () => destroySmoothScroll();
  }, []);

  return (
    <div ref={rootRef} className="min-h-[100dvh] bg-ink-950 text-paper">
      <Header />
      <main>
        <Hero />
        <Leadership />
        <Program />
        <Statute />
        <Members />
        <JoinForm />
        <News />
      </main>
      <Footer />
    </div>
  );
}
