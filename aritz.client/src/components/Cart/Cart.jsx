import React from "react";
import { useCart } from "../../context/CartContext";
import styles from "./Cart.module.css";
import PrincipalContainer from "../ContainerCheckout/PrincipalContainer";
import SubContainer from "../ContainerCheckout/SubContainer";
import { useNavigate } from "react-router-dom";
import TimeLapseCheckout from "../CheckoutSteps/Timelapse/TimelapseCheckout";
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { useSession } from "../../context/SessionContext";
import Swal from "sweetalert2"; // Importar SweetAlert2
import BreadCrum from "../BreadCrum/BreadCrum";
import { useLocation } from "react-router";
import { formatPrice } from "../../utils/utils";

function Carrito() {
  const navigate = useNavigate();
  const {
    fetchCountCart,
    fetchSumTotalCart,
    totalSumCart,
    couponCode,
    couponInfo,
    saveCoupon,
    clearCoupon,
  } = useCart();
  const { userId, setPageCheckout } = useSession();
  const [loading, setLoading] = useState(true);
  const [loadingDelCart, setLoadingDelCart] = useState(false);
  const [loadingCleanCart, setLoadingCleanCart] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const location = useLocation();

  // Parte de cupones
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    setCouponError("");
    try {
      const { data } = await axiosInstance.post("Discount/validate", {
        Code: couponInput.trim(),
        Subtotal: Number(totalSumCart),
      });
      saveCoupon(data);
    } catch (err) {
      clearCoupon();
      setCouponInput("");
      setCouponError(err.response?.data || "No se pudo validar el cupón.");
    }
  };

  useEffect(() => {
    if (couponCode && totalSumCart > 0) handleApplyCoupon();
  }, [totalSumCart]);

  useEffect(() => {
    fetchCart();
  }, [userId, totalSumCart]);


  const handleProceedToCheckout = () => {
    //if (totalSumCart < 20000) {
    //    Swal.fire({
    //        title: 'Debe superar el monto de $20.000 para proceder con la compra',
    //        icon: 'error',
    //        confirmButtonText: 'Ok'
    //    })
    //    return;
    //}
    navigate("/checkout/shipping-info"); // Redirige al paso 1 del checkout
  };

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get(`Cart/user/${userId}`);
      setCart(response.data); //
      console.log(response.data);
      setLoading(false); //
      // Actualiza la cantidad del carrito din�micamente desde el backend
      fetchCountCart();
      fetchSumTotalCart();
    } catch (err) {
      console.error("Error al obtener los productos", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      console.log(
        `Eliminando producto con ID: ${productId} para el usuario: ${userId}`,
      );

      setLoadingDelCart(true);
      // Realiza la solicitud DELETE al backend
      const response = await axiosInstance.delete(
        `Cart/user/${userId}/product/${productId}`,
      );

      await fetchCart();
      Swal.fire({
        title: "Se elimino el producto",
        icon: "error",
        confirmButtonText: "Volver al carrito",
      });
      fetchCountCart();
      fetchSumTotalCart();
      clearCoupon();
      setCouponInput("");
      clearCoupon();
    } catch (error) {
      console.error("Error al eliminar el producto del carrito:", error);
      alert("No se pudo eliminar el producto del carrito.");
    } finally {
      setLoadingDelCart(false);
    }
  };

  const handleCleanCart = async (userId) => {
    try {
      setLoadingCleanCart(true);

      const response = await axiosInstance.delete(`Cart/user/${userId}`);

      await fetchCart();
      Swal.fire({
        title: "Se vacio el carrito",
        icon: "error",
        confirmButtonText: "Volver al carrito",
      });
      fetchCountCart();
      fetchSumTotalCart();
      setCouponInput("");
      clearCoupon();
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      alert("No se pudo vaciar el carrito.");
    } finally {
      setLoadingCleanCart(false);
    }
  };

  return (
    <PrincipalContainer>
      {/*<BreadCrum />*/}
      <SubContainer>
        {cart.length === 0 ? "" : <TimeLapseCheckout />}
        <div className={styles.container}>
          <h1 className={styles.title}>Tu Carrito</h1>

          {cart.length === 0 ? (
            <p className={styles.emptyMessage}>
              No tienes productos en tu carrito.
            </p>
          ) : (
            <>
              <ul className={styles.cartList}>
                {cart.map((car) => (
                  <li key={car.CAI_ID} className={styles.cartItem}>
                    <img
                      src={`${import.meta.env.VITE_API_URL}/images/${car.PRD_IMAGE}`}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemDetails}>
                      <h4>
                        {car.CAT_NAME} {car.PRD_NAME}
                      </h4>
                      <p>P/u: ${formatPrice(car.PRD_PRICE)}</p>
                      <p>Cantidad: {car.CAI_QUANTITY}</p>
                      <p>Subtotal: ${formatPrice(car.CAI_TOTAL_PRICE)}</p>
                      <button
                        onClick={() => {
                          handleRemoveFromCart(car.PRD_ID);
                        }}
                        className={styles.removeButton}
                      >
                        {loadingDelCart ? (
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          "Eliminar"
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {couponError && (
                <small className="text-center" style={{ color: "#ff4d4d" }}>
                  {couponError}
                </small>
              )}
              {couponInfo && (
                <small className="text-center" style={{ color: "#2e7d32" }}>
                  Cupón aplicado: -${formatPrice(couponInfo.discount)}
                </small>
              )}

              <div className="d-flex justify-content-center">
                <div className={styles.cuponContainer}>
                  <label htmlFor="cupon" className={styles.cuponLabel}>
                    Tengo un cupón
                  </label>
                  <div className={styles.cuponRow}>
                    <input
                      id="cupon"
                      type="text"
                      className={styles.cuponInput}
                      placeholder="Ingresá tu código"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.cuponButton}
                      onClick={handleApplyCoupon}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.total}>
                {couponInfo?.discount > 0 && (
                  <h6 className={styles.oldPrice}>
                    ${formatPrice(totalSumCart)}
                  </h6>
                )}
                <h3>
                  Subtotal (Sin envio): $
                  {formatPrice(totalSumCart - (couponInfo?.discount ?? 0))}
                </h3>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.clearButton}
                  onClick={() => {
                    handleCleanCart(userId);
                  }}
                >
                  {loadingCleanCart ? (
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    "Vaciar Carrito"
                  )}
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  className={styles.checkoutButton}
                >
                  Proceder al Pago
                </button>
              </div>
            </>
          )}
        </div>
      </SubContainer>
    </PrincipalContainer>
  );
}

export default Carrito;
