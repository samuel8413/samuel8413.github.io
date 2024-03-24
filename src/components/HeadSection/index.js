import styles from "./styles.module.css";
import pinkPillow from "../../assets/images/pink-pillow.svg";

const HeadSection = () => {
  return (
    <section
      className={styles.sectionWrapper}
      style={{
        backgroundImage: `url(${pinkPillow.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className={styles.goldenDustLeft} />
      <div className={styles.goldenDustRight} />
      <div className={styles.container}>
        <div className={styles.congratulation} />
        <h2 className={styles.primaryText}>Diana Lara</h2>
        <p className={styles.secondaryText}>
          Te invito a celebrar con nosotros.
        </p>
        <div className={styles.tableWrapper}>
          <span className={styles.secondaryText} style={{ margin: "0 12px" }}>
            Hora por confirmar
          </span>
          <span
            className={styles.secondaryText}
            style={{
              alignContent: "center",
              borderLeft: "3px solid #bca459",
              borderRight: "3px solid #bca459",
              height: "100%",
              margin: "12px",
              width: "100%",
            }}
          >
            <div className={styles.bgCircle}>Junio 29</div>
          </span>
          <span className={styles.secondaryText} style={{ margin: "0 12px" }}>
            Atotonilco el Grande, Hidalgo
          </span>
        </div>
        <p className={styles.secondaryText}>
          Confirmar asistencia al <a href="tel:+525565049317">5565049317</a>.
        </p>
      </div>
    </section>
  );
};

export default HeadSection;
