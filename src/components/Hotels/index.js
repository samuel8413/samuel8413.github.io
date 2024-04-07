import styles from "./styles.module.css";
import hotels from "./hotels.json";

const Hotel = ({ hotel }) => {
  const { classes, location, name, phone, price, roomDetails } = hotel;

  return (
    <li className={styles.hotel}>
      <div className={styles.churchImageWrapper}>
        <div className={styles[classes]} />
      </div>
      <h4 className={styles.text}>{name}</h4>
      <a className={styles.location} href={location}>
        Ver ubicación en Google Maps
      </a>
      <p className={styles.text}>{phone}</p>
      <p className={styles.text}>{price}</p>
      <p className={styles.text}>{roomDetails}</p>
    </li>
  );
};

const Hotels = () => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Hoteles cercanos y precios aproximados</h2>
      <ul className={styles.container}>
        {hotels.map((hotel, id) => (
          <Hotel key={id} hotel={hotel} />
        ))}
      </ul>
    </div>
  );
};

export default Hotels;
