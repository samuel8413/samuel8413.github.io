import styles from "./styles.module.css";

const Location = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.contentTitle}>Lugar de la celebración:</p>
        <p className={styles.contentLabel}>
          Carretera Huejutla de Reyes - Pachuca, KM 36.
        </p>
        <p className={styles.contentLabel}>Atotonilco el Grande, Hidalgo</p>
        <p className={styles.contentLabel}>CP: 43320</p>
      </div>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1870.981047950136!2d-98.6805451525773!3d20.301835998705545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjDCsDE4JzA2LjYiTiA5OMKwNDAnNDcuNSJX!5e0!3m2!1ses-419!2smx!4v1711186750718!5m2!1ses-419!2smx"
        style={{ border: 0 }}
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default Location;
