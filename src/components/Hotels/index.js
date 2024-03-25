import styles from "./styles.module.css";

const Hotel = () => {
  return (
    <li className={styles.hotel}>
      <h4>Hotel name</h4>
      <p>Location</p>
      <p>Phone number</p>
    </li>
  );
};

const Hotels = () => {
  return (
    <ul className={styles.container}>
      {[0, 1, 2].map((id) => (
        <Hotel key={id} />
      ))}
    </ul>
  );
};

export default Hotels;
