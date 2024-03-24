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
      {/* <div className={styles.jumbotron}>
        <p className={styles.marckScriptLarge}>Ubicación</p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1870.981047950136!2d-98.6805451525773!3d20.301835998705545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjDCsDE4JzA2LjYiTiA5OMKwNDAnNDcuNSJX!5e0!3m2!1ses-419!2smx!4v1711186750718!5m2!1ses-419!2smx"
          width="600"
          height="450"
          style={{ border: 0 }}
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className={styles.jumbotron}>
        <p className={styles.marckScriptLarge}>Iglesia</p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14969.51634811539!2d-98.67394920885957!3d20.284570198956853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d10ff251acf843%3A0x5d6b4b7c43690dfd!2sEx%20Convento%20De%20San%20Agust%C3%ADn!5e0!3m2!1ses-419!2smx!4v1711186846249!5m2!1ses-419!2smx"
          width="600"
          height="450"
          style={{ border: 0 }}
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div> */}
    </main>
  );
}
