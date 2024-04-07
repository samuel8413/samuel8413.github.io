import styles from "./styles.module.css";

const Amajac = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.title}>Balneario Amajac</p>
        <p className={styles.label}>
          El balneario cuenta con aguas termales de 46°, toboganes, áreas
          verdes, áreas para acampar, hoteleria, restaurant, bar, spa, comida
          gastronómica.
        </p>
        <p className={styles.label}>
          <a href="https://maps.app.goo.gl/7kyG4VuhJaSXzmjBA">
            Balneario Amajac, Huejutla de Reyes - Pachuca, Santa María Amajac,
            Hgo, CP: 43300.
          </a>
        </p>
        <p className={styles.label}>
          Whatsapp:{" "}
          <a href="https://api.whatsapp.com/send?phone=+5217717038279&text=Hola! Quisiera pedir informes acerca del Hotel">
            771 703 8279
          </a>
          .
        </p>
        <p className={styles.label}>
          Reservaciones con 20 días de anticipación o bien puedes consultar
          disponibilidad de hospedaje directamente en sus instalaciones.
        </p>
      </div>
      <div className={styles.image} />
    </div>
  );
};

export default Amajac;
