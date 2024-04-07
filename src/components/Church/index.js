import styles from "./styles.module.css";

const Church = () => {
  return (
    <div className={styles.container}>
      <div className={styles.contentMobile}>
        <p className={styles.title}>Lugar de la misa:</p>
        <p className={styles.label}>Ex Convento De San Agustín</p>
        <p className={styles.label}>Lic. Jorge Viesca Palma S, Centro</p>
        <p className={styles.label}>Atotonilco el Grande, Hidalgo</p>
        <p className={styles.label}>CP: 43300</p>
        <p className={styles.time}>Hora de la misa: 13:00 p.m.</p>
      </div>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14969.51634811539!2d-98.67394920885957!3d20.284570198956853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d10ff251acf843%3A0x5d6b4b7c43690dfd!2sEx%20Convento%20De%20San%20Agust%C3%ADn!5e0!3m2!1ses-419!2smx!4v1711186846249!5m2!1ses-419!2smx"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className={styles.content}>
        <p className={styles.title}>Lugar de la misa:</p>
        <p className={styles.label}>Ex Convento De San Agustín</p>
        <p className={styles.label}>Lic. Jorge Viesca Palma S, Centro</p>
        <p className={styles.label}>Atotonilco el Grande, Hidalgo</p>
        <p className={styles.label}>CP: 43300</p>
        <p className={styles.time}>Hora de la misa: 13:00 p.m.</p>
      </div>
    </div>
  );
};

export default Church;
