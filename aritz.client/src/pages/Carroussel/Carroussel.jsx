import { NavLink } from "react-router-dom";
import styles from "./Carroussel.module.css";
import cremaImg from "../../assets/images/portada.jpg";

function Carroussel() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>Cosmética Natural</h1>
        <p className={styles.subtitle}>
          Lo mejor para cuidar tu piel y estilo de vida
        </p>
        <NavLink className={styles.shopBtn} to="/product">
          Shop
        </NavLink>
      </div>

      <div className={styles.visual}>
        <img src={cremaImg} className={styles.productImage} alt="Producto" />
      </div>
    </section>
  );
}

export default Carroussel;
