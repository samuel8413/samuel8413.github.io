import Age from "@/components/Age";
import Amajac from "@/components/Amajac";
import Church from "@/components/Church";
import HeadSection from "@/components/HeadSection";
import Hotels from "@/components/Hotels";
import Location from "@/components/Location";

import "./globals.css";

export default function Home() {
  return (
    <main>
      <HeadSection />
      <Age />
      <Location />
      <Church />
      <Hotels />
      <Amajac />
    </main>
  );
}
