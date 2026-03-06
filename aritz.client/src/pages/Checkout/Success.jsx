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

    useEffect(() => {
        console.log("PaymentStatus:", paymentStatus, "Flag: ", isProcessing, "TotalSumCart: ", totalSumCart);
        if (paymentStatus === 'approved' && userId && !isProcessing && !processedRef.current) {
            processedRef.current = true; // Marcamos como procesado
            handleOrderConfirm();
        }
    }, [paymentStatus, userId]);

    const handleOrderConfirm = async () => {
        setIsProcessing(true);
        setLoadingPay(true);
        try {
            const cartResponse = await axiosInstance.get(`Cart/user/${userId}`);
            const cartItems = cartResponse.data;

            // Obtengo el cod postal del cliente
            const userResponse = await axiosInstance.get(`Account/${userId}`);
            const codigoPostalReal = userResponse.data.USR_POSTAL_CODE;

            // Calculo nuevamente el precio del envio en base al codigo postal del cliente
            const responseCodPostal = await axiosInstance.get(`Shipping/calculate?zipCode=${codigoPostalReal}`);
            const costoEnvioReal = responseCodPostal.data.Price;

            // Calculamos el total manualmente para estar 100% seguros
            const subTotalCarrito = cartItems.reduce((acc, item) => {
                return acc + (item.PRD_PRICE * item.CAI_QUANTITY);
            }, 0);

            const totalFinal = subTotalCarrito + costoEnvioReal;

            console.log("Datos a enviar al BACKEND: ");
            console.log("User ID: ", userId);
            console.log("Monto total: ", totalFinal);

            const orderResponse = await axiosInstance.post("Order/confirmOrder", {
                userId,
                paymentMethod: 1,
                totalSumCart: totalFinal,
                CartItems: cartItems
            });

            const newOrderId = orderResponse.data.OrderId;

            if (!newOrderId) {
                throw new Error('No se recibió el OrderId del backend.');
            }

            const detailResponse = await axiosInstance.post('order/confirmOrderDetail', {
                userId,
                orderId: newOrderId,
            });

            setCreatedOrderId(newOrderId);

            Swal.fire({
                title: 'Exito!',
                text: detailResponse.data.Message || 'Pedido confirmado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
            });

            fetchCountCart();
            fetchSumTotalCart();
        } catch (error) {
            console.error("Error al confirmar el pedido:", error);
            alert("No se pudo confirmar el pedido.");
        } finally {
            setLoadingPay(false);
        }
    }

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
                                to={`/user/my-requests/my-order/${createdOrderId ? createdOrderId : orderId}`}
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