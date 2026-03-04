import React from "react";
import { useCheckout } from "../../context/CheckoutContext";
import { useCart } from "../../context/CartContext";
import CenteredContainer from "../CenteredContainer/CenteredContainer";
import styles from "./CheckoutSteps.module.css";
import TimeLapseCheckout from "../CheckoutSteps/Timelapse/TimelapseCheckout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axiosConfig";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useSession } from "../../context/SessionContext";
import Swal from 'sweetalert2';
import { useLocation } from 'react-router'
import { formatPrice } from '../../utils/utils';

const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
initMercadoPago(publicKey, { locale: 'es-AR' });
function PaymentInfo() {
    const { paymentMethod, setPaymentMethod, zipPrice } = useCheckout();
    const navigate = useNavigate();
    const { fetchCountCart, fetchSumTotalCart, totalSumCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [preferenceId, setPreferenceId] = useState(null);
    const location = useLocation();
    const hasCreatedPreference = useRef(false);
    const { userId, setPageCheckout } = useSession();

    setPageCheckout(location);

    //if (totalSumCart < 20000 && !loading) {
    //    navigate('/cart');
    //}

    useEffect(() => {
        fetchCart();
    }, [userId]);

    useEffect(() => {
        if (paymentMethod === 1 && totalSumCart > 0 && cart.length > 0 && !hasCreatedPreference.current) {
            hasCreatedPreference.current = true;
            createMercadoPagoPreference();
        }
    }, [paymentMethod, totalSumCart, cart]);

    const createMercadoPagoPreference = async () => {
        try {
            const orderData = {
                userId: userId,
                totalSumCart: totalSumCart,
                zipPrice: zipPrice,
                items: cart.map(item => ({
                    ProductName: item.PRD_NAME,
                    Quantity: item.CAI_QUANTITY,
                    UnitPrice: item.PRD_PRICE
                }))
            };

            const response = await axiosInstance.post("MercadoPago/create_preference", orderData);

            if (response.data.preferenceId) {
                setPreferenceId(response.data.preferenceId);
            }
        } catch (error) {
            console.error("Error al crear preferencia MP:", error);
        }
    }

    const fetchCart = async () => {
        try {
            const response = await axiosInstance.get(`Cart/user/${userId}`);
            setCart(response.data);
            setLoading(false);
            fetchCountCart();
            fetchSumTotalCart();
        } catch (err) {
            console.error("Error al obtener los productos", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleOrderConfirm = async (totalSumCart) => {
        totalSumCart = totalSumCart + zipPrice;
        try {
            const orderResponse = await axiosInstance.post("Order/confirmOrder", {
                userId,
                paymentMethod,
                totalSumCart,
                CartItems: cart
            });

            const orderId = orderResponse.data.OrderId;
            if (!orderId) {
                throw new Error('No se recibió el OrderId del backend.');
            }

            const detailResponse = await axiosInstance.post('order/confirmOrderDetail', {
                userId,
                orderId,
            });

            Swal.fire({
                title: '¡Exito!',
                text: detailResponse.data.Message || 'Pedido confirmado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
            });

            fetchCountCart();
            fetchSumTotalCart();
            navigate(`/checkout/pay-success?orderId=${orderId}`);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                Swal.fire({
                    title: 'Error al restar el producto',
                    text: error.response.data || 'No hay suficiente stock disponible.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido'
                });
            } else {
                console.error("Error al confirmar el pedido:", error);
                alert("No se pudo confirmar el pedido.");
            }
        }
    }

    const back = () => {
        navigate("/checkout/payment-method");
    };

    if (loading) return <div>Cargando carrito...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <CenteredContainer>
            <TimeLapseCheckout />
            <div className={`container ${styles.paymentInfoContainer}`}>
                <div className={`row ${styles.subPaymentInfoContainer}`}>

                    <div className={`col-12 col-lg-7 d-flex flex-column gap-4 ${styles.resumeContainer}`}>
                        <h3>Tu pedido</h3>
                        {cart.map((car) => (
                            <div className={styles.cartItem} key={car.CAI_ID}>
                                <div className={styles.imgItem}>
                                    <img src={`${import.meta.env.VITE_API_URL}/images/${car.PRD_IMAGE}`} alt={car.PRD_NAME} />
                                </div>
                                <div className={styles.detailItem}>
                                    <div className={styles.nameQuantity}>
                                        <b>{car.PRD_NAME}</b>
                                        <p>Cantidad: {car.CAI_QUANTITY}</p>
                                    </div>
                                    <div className={styles.precio}>
                                        <b>Subtotal</b>
                                        <p>$ {formatPrice(car.PRD_PRICE * car.CAI_QUANTITY)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className={styles.envio}>
                            <p className="d-flex justify-content-between">Envio: <b>${formatPrice(zipPrice)}</b></p>
                        </div>
                        <div className={styles.total}>
                            <p className="d-flex justify-content-between">Total: <b>${formatPrice(totalSumCart + zipPrice)}</b></p>
                        </div>
                    </div>

                    <div className="col-12 col-lg-5 mt-5 mt-lg-0">
                        {paymentMethod === 2 ?
                            <div className={styles.bankContainer}>
                                <div>
                                    <h1 className={styles.logoAritz}>Aritz</h1>
                                </div>
                                <h2>Datos transferencia</h2>
                                <div className={styles.bankContainerSub}>
                                    <b>CBU: 0000003100048344628186</b>
                                    <b>Alias: ramiro.unrein </b>
                                </div>
                            </div> :
                            <div className={styles.mpContainer}>
                                <h3>Pagar con MercadoPago</h3>
                                {preferenceId ? (
                                    <Wallet
                                        key={preferenceId}
                                        initialization={{ preferenceId: preferenceId }}
                                        customization={{ texts: { valueProp: 'smart_option' } }}
                                    />
                                ) : (
                                    <div>
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p>Cargando boton de pago...</p>
                                    </div>
                                )}
                            </div>
                        }
                    </div>
                </div>

                {/* Botones de navegación */}
                <div className="row mt-4 mb-5">
                    <div className="col-12 d-flex justify-content-between gap-3">
                        <button onClick={back} className={styles.btnShippingBack}>
                            Volver
                        </button>

                        {paymentMethod === 2 && (
                            <button
                                className={styles.btnShippingNext}
                                onClick={() => { handleOrderConfirm(totalSumCart) }}
                                type="submit"
                            >
                                Confirmar pedido
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </CenteredContainer>
    );
}

export default PaymentInfo;