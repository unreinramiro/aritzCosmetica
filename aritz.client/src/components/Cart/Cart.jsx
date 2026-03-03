import React from "react";
import { useCart } from "../../context/CartContext";
import styles from "./Cart.module.css";
import CenteredContainer from "../CenteredContainer/CenteredContainer";
import { useNavigate } from "react-router-dom";
import TimeLapseCheckout from "../CheckoutSteps/Timelapse/TimelapseCheckout";
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { useSession } from "../../context/SessionContext";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import BreadCrum from "../BreadCrum/BreadCrum";
import { useLocation } from 'react-router'
import { formatPrice } from '../../utils/utils';

function Carrito() {
    const navigate = useNavigate();
    const { fetchCountCart, fetchSumTotalCart, totalSumCart } = useCart();
    const { userId, setPageCheckout } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const location = useLocation();

    useEffect(() => {
        fetchCart();
    }, [userId]);

    setPageCheckout(location);

    const handleProceedToCheckout = () => {
        if (totalSumCart < 20000) {
            Swal.fire({
                title: 'Debe superar el monto de $20.000 para proceder con la compra',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            return;
        }
        navigate("/checkout/shipping-info"); // Redirige al paso 1 del checkout
    };

    const fetchCart = async () => {
        try {
            const response = await axiosInstance.get(`Cart/user/${userId}`);
            setCart(response.data); // 
            console.log(response.data);
            setLoading(false); // 
            // Actualiza la cantidad del carrito dinámicamente desde el backend
            fetchCountCart();
            fetchSumTotalCart();
        } catch (err) {
            console.error("Error al obtener los productos", err);
            setError(err.message);
            setLoading(false);
        }
    };


    if (loading) return <div>Cargando carrito...</div>;
    if (error) return <div>Error: {error}</div>;

    const handleRemoveFromCart = async (productId) => {
        try {
            console.log(`Eliminando producto con ID: ${productId} para el usuario: ${userId}`);

            // Realiza la solicitud DELETE al backend
            const response = await axiosInstance.delete(`Cart/user/${userId}/product/${productId}`);

            await fetchCart();
            Swal.fire({
                title: 'Se elimino el producto',
                icon: 'error',
                confirmButtonText: 'Volver al carrito'
            })
            fetchCountCart();
            fetchSumTotalCart();
        } catch (error) {
            console.error("Error al eliminar el producto del carrito:", error);
            alert("No se pudo eliminar el producto del carrito.");
        }
    };

    const handleCleanCart = async (userId) => {
        try {
            const response = await axiosInstance.delete(`Cart/user/${userId}`);

            await fetchCart();
            Swal.fire({
                title: 'Se vacio el carrito',
                icon: 'error',
                confirmButtonText: 'Volver al carrito'
            })
            fetchCountCart();
            fetchSumTotalCart();
        } catch (error) {
            console.error("Error al vaciar el carrito:", error);
            alert("No se pudo vaciar el carrito.");
        }
    }

    return (
        <CenteredContainer>
            {/*<BreadCrum />*/}
            {cart.length === 0 ? '' : <TimeLapseCheckout />}
            <div className={styles.container}>
                <h1 className={styles.title}>Tu Carrito</h1>

                {cart.length === 0 ? (
                    <p className={styles.emptyMessage}>No tienes productos en tu carrito.</p>
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
                                        <h4>{car.PRD_NAME}</h4>
                                        <p>Precio: ${car.CAI_TOTAL_PRICE}</p>
                                        <p>Cantidad: {car.CAI_QUANTITY}</p>
                                        <button
                                            onClick={() => { handleRemoveFromCart(car.PRD_ID) }}
                                            className={styles.removeButton}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className={styles.total}>
                                <h3>Total: ${formatPrice(totalSumCart)}</h3>
                        </div>

                        <div className={styles.actions}>
                                <button
                                    className={styles.clearButton}
                                    onClick={() => { handleCleanCart(userId) }}
                                >
                                Vaciar Carrito
                            </button>
                                <button onClick={handleProceedToCheckout} className={styles.checkoutButton}>Proceder al Pago</button>
                        </div>
                    </>
                )}
            </div>
        </CenteredContainer>
    );
}

export default Carrito;