import React from "react";
import { useCheckout } from "../../context/CheckoutContext";
import PrincipalContainer from "../ContainerCheckout/PrincipalContainer";
import SubContainer from "../ContainerCheckout/SubContainer";
import styles from "./CheckoutSteps.module.css";
import TimeLapseCheckout from "../CheckoutSteps/Timelapse/TimelapseCheckout";
import { useNavigate } from "react-router-dom";
import MercadoPagoIcon from "../../assets/icons/mercadopago.svg";
import CreditCardIcon from "../../assets/icons/creditcard.svg";
import { AiFillBank } from "react-icons/ai";
import { useLocation } from "react-router";
import { useSession } from "../../context/SessionContext";
import { useCart } from "../../context/CartContext";

function PaymentInfo() {
  const { paymentMethod, setPaymentMethod } = useCheckout();
  const { setPageCheckout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalSumCart } = useCart();

  //if (totalSumCart < 20000) {
  //    navigate('/cart');
  //}

  setPageCheckout(location);

  const handleSelectMethod = (method) => {
    setPaymentMethod(method);
    //alert("Pedido completado con �xito!"); // Aqu� ir�as a la l�gica de confirmaci�n
  };
  console.log(paymentMethod);

  const next = () => {
    if (paymentMethod === "") {
      alert("Debe seleccionar una forma de pago para continuar");
    } else {
      navigate("/checkout/pay");
    }
  };

  const back = () => {
    navigate("/checkout/shipping-info");
  };

  return (
    <PrincipalContainer>
      <SubContainer>
        <TimeLapseCheckout />
        <div className={styles.payMethodContainer}>
          <h3>Elija la forma de pago</h3>
          <div className={styles.containerPayments}>
            <button
              className={`${styles.buttonsPayments}
                          ${paymentMethod === 2 ? styles.selected : ""}`}
              style={{ backgroundColor: "#F5F5DC", color: "#000" }}
              onClick={() => {
                handleSelectMethod(2);
              }}
            >
              <AiFillBank size="6rem" />
              Transferencia bancaria
            </button>
            <button
              className={`${styles.buttonsPayments}
                          ${paymentMethod === 1 ? styles.selected : ""}`}
              style={{ backgroundColor: "#00B1EA", color: "#fff" }}
              onClick={() => handleSelectMethod(1)}
            >
              <img src={MercadoPagoIcon} className={styles.imgMp} />
            </button>
          </div>
          <label className={`d-flex gap-3 ${styles.shippingLabels} ${styles.payMethodLabels}`}>
            <button onClick={back} className={styles.btnShippingBack}>
              Volver
            </button>
            <button
              onClick={next}
              className={styles.btnShippingNext}
              type="submit"
            >
              Siguiente
            </button>
          </label>
        </div>
      </SubContainer>
    </PrincipalContainer>
  );
}

export default PaymentInfo;
