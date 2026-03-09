import { useState, useEffect, useRef } from "react";
import CenteredContainer from "../../components/CenteredContainer/CenteredContainer";
import styles from "./Success.module.css";
import { useNavigate } from "react-router-dom";
import { AiOutlineUpload } from "react-icons/ai";
import { useCart } from "../../context/CartContext";
import Swal from 'sweetalert2';
import { NavLink } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';
import axiosInstance from "../../api/axiosConfig";
import { useCheckout } from "../../context/CheckoutContext";
import { useSession } from "../../context/SessionContext";
import { FaClipboardCheck } from "react-icons/fa";

function Success() {

    const [searchParams] = useSearchParams();

    const orderId = searchParams.get('orderId'); // Obtengo el ID de la orden creada

    // Parametros de MercadoPago
    const paymentStatus = searchParams.get('collection_status'); // 'approved', 'pending', etc.
    const paymentId = searchParams.get('payment_id'); // ID de la transacción de MP
    const preferenceId = searchParams.get('preference_id'); // El ID que pedías

    // Estado para evitar dobles posteos (bandera de carga)
    const [isProcessing, setIsProcessing] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const processedRef = useRef(false);

    const { userId } = useSession(); // Obtengo el ID del usuario
    const { fetchCountCart, fetchSumTotalCart, totalSumCart, fetchCart } = useCart(); // Obtengo los montos del carrito de compras

    const { zipPrice, setZipPrice } = useCheckout();

    console.log("Precio del zipPrice antes del llamado a handleOrderConfirm: ", zipPrice);

    const [loadingPay, setLoadingPay] = useState(false);

    const mpExternalRef = searchParams.get('external_reference');


    useEffect(() => {
        console.log("PaymentStatus:", paymentStatus, "Flag: ", isProcessing, "TotalSumCart: ", totalSumCart);
        fetchCountCart();
        fetchSumTotalCart();
        if (paymentStatus === 'approved' && userId && !isProcessing && !processedRef.current) {
            processedRef.current = true; // Marcamos como procesado
            handleStatusChange(mpExternalRef, 'Pendiente')
        }
    }, [paymentStatus, userId]);

    const handleStatusChange = async (orderId, newStatus) => {

        console.log("El order ID es: ", orderId);
        try {

            const bodyData = {
                OrderId: orderId,
                OrderStatus: newStatus,
                CancelOrderByUser: false
            };

            const response = await axiosInstance.put(`Order/${orderId}/updOrdStatus`, bodyData);
        } catch (e) {
            console.log("Error al querer actualizar el estado: ", e);
        }
    }

    Swal.fire({
        title: 'Exito!',
        text: 'Pedido confirmado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
    });


    return (
        <div className="d-flex text-center justify-content-center">
            <div className={`d-flex flex-column ${styles.container}`}>
                {loadingPay ? (
                    <div>
                        <h3>Aguarde un momento...</h3>
                        <p>Su pago esta siendo procesado.</p>
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )
                    :
                (
                <>
                    <div>
                        <p className={styles.artizLogoCompra}>Aritz</p>
                        <h1>¡Muchas gracias por tu compra!</h1>
                        <FaClipboardCheck
                            size={100}
                            style={ {color: "green"} }
                        />
                    </div>
                    <p>El pedido se encuentra reservado, recorda cargar el comprobante de pago dentro de las proximas 48hs,
                        sino el mismo se cancelara</p>

                    <div className={styles.containerComprobante}>
                        <b>Carga tu comprobante en la sección pedidos en el detalle de tu pedido :D</b>

                        <label className={`d-flex gap-3 ${styles.shippingLabels}`}>
                            <NavLink
                                        to={`/user/my-requests/my-order/${mpExternalRef ? mpExternalRef : orderId}`}
                                className={styles.btnShippingNext}
                            >
                                Ir a mi pedido
                            </NavLink>
                        </label>
                    </div>
                </>
                )}
                
            </div>
        </div>
    );
}

export default Success;