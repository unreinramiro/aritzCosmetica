import { AiOutlineDoubleRight } from "react-icons/ai";
import styles from "./TimelapseCheckout.module.css";
import { useLocation } from "react-router-dom";

function TimeLapseCheckout() {
    const location = useLocation();
    console.log(location.pathname);

  return (
      <div className={`${styles.timeLapseContainer} d-flex justify-content-center gap-3 align-items-center`}>
          <p className={`${location.pathname === "/cart" ? styles.pathBlack : styles.pathNormal} d-flex align-items-center`}>Carrito</p><AiOutlineDoubleRight className={styles.doubleArrow} />
          <p className={`${location.pathname === "/checkout/shipping-info" ? styles.pathBlack : styles.pathNormal} d-flex align-items-center`}>Envio</p><AiOutlineDoubleRight className={styles.doubleArrow} />
          <p className={`${location.pathname === "/checkout/payment-method" ? styles.pathBlack : styles.pathNormal} d-flex align-items-center`}>Pago</p><AiOutlineDoubleRight className={styles.doubleArrow}/>
          <p className={`${location.pathname === "/checkout/pay" ? styles.pathBlack : styles.pathNormal} d-flex align-items-center`}>Finalizar</p>
      </div>
  );
}

export default TimeLapseCheckout;