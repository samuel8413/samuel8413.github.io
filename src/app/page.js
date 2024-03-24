import Age from "@/components/Age";
import Church from "@/components/Church";
import HeadSection from "@/components/HeadSection";
import Location from "@/components/Location";

import "./globals.css";

export default function Home() {
  return (
    <main>
      <HeadSection />
      <Age />
      <Location />
      <Church />
    </main>
  );
}
