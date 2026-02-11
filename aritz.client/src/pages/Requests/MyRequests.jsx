import { useState, useEffect } from "react";
import CenteredContainer from "../../components/CenteredContainer/CenteredContainer";
import styles from './MyRequests.module.css';
import axiosInstance from "../../api/axiosConfig";
import { useSession } from "../../context/SessionContext";
import Swal from 'sweetalert2';
import { AiOutlineUpload } from "react-icons/ai";
import { BiRefresh } from "react-icons/bi";
import { format } from 'date-fns'; // Importa la función format
import { useLocation, Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { BiConfused } from "react-icons/bi";
import BreadCrum from "../../components/BreadCrum/BreadCrum";
import { formatPrice } from '../../utils/utils';
function MyRequests() {

    const [orders, setOrders] = useState([]);
    const { userId } = useSession();
    const [uploading, setUploading] = useState({}); // Estado de carga por orden

    const location = useLocation();


    useEffect(() => {
        getOrders();
    }, [userId]);


    const getOrders = async () => {
        try {
            const response = await axiosInstance.get(`Order/${userId}`);
            console.log(response.data);
            setOrders(response.data);
            console.log('Ordenes obtenidas:', response.data);
        } catch (error) {
            console.error("Error al mostrar las ordenes de compra:", error);
        }
    }

    const handleFileUpload = async (orderId, event) => {
        const file = event.target.files[0];
        if (!file) {
            Swal.fire({
                title: 'Error al subir el comprobante de pago',
                text: 'Subí un comprobante válido',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        // Validar tipo de archivo
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        const extension = `.${file.name.split('.').pop().toLowerCase()}`;
        if (!allowedExtensions.includes(extension)) {
            Swal.fire({
                title: 'Error al subir el comprobante',
                text: 'Solo se permiten archivos PDF, JPG o PNG',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading((prev) => ({ ...prev, [orderId]: true }));
            const response = await axiosInstance.post(`Order/${orderId}/upload-receipt`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Actualizar la orden en el estado
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.ORD_ID === orderId ? { ...order, ReceiptPath: response.data.ReceiptPath } : order
                )
            );

            Swal.fire({
                title: '¡Éxito!',
                text: 'Comprobante subido exitosamente',
                icon: 'success',
                confirmButtonText: 'Aceptar',
            });
        } catch (error) {
            console.error('Error al subir el comprobante:', error);
            Swal.fire({
                title: 'Error al subir el comprobante',
                text: 'Ocurrió un error al subir el archivo',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        } finally {
            setUploading((prev) => ({ ...prev, [orderId]: false }));
        }
    };

    //Funcion para dar formato a la fecha
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString); // Convierte la cadena a objeto Date
            return format(date, 'dd/MM/yyyy'); // Formato: 22/09/2025
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
            return dateString; // Devuelve la fecha original si hay error
        }
    };


    return (
        <CenteredContainer>
            <BreadCrum />
            <h1 className={styles.requestsTitle}>{orders.length === 0 ? 'No tiene ningun pedido' : 'Mis pedidos'}</h1>
            <div className={styles.requestsContainer}>
                {orders.length === 0 ? (
                    <BiConfused size={250} />
                ): ( 
                <table className={styles.requestsTable}>
                    <thead className={styles.stickyHeader}>
                        <tr>
                            <th>Nro Orden</th>
                            <th>Fecha</th>
                            <th>Monto total</th>
                            <th>Estado</th>
                            <th>Forma de pago</th>
                            <th>Comprobante</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order.ORD_ID}
                                className={styles.filaOrdenDetailUser}
                            >
                                <td data-label="Nro Orden">
                                    <NavLink
                                        to={`/user/my-requests/my-order/${order.ORD_ID}`}
                                        className={styles.orderNavlink}
                                    >
                                        {order.ORD_ID}
                                    </NavLink> 
                                </td>
                                <td data-label="Fecha">{formatDate(order.ORD_ORDER_DATE)}</td>
                                <td data-label="Monto total">${formatPrice(order.ORD_TOTAL_AMOUNT)}</td>
                                <td data-label="Estado">{order.ORD_STATUS}</td>
                                <td data-label="Forma de pago">{order.PaymentMethod}</td>
                                <td data-label="Comprobante">
                                    {order.ReceiptPath ? (
                                        <div className={styles.fileRefreshDownload}>
                                            <a
                                                href={`${axiosInstance.defaults.baseURL}Order/${order.ORD_ID}/download-receipt`}
                                                rel="noopener noreferrer"
                                                className={styles.downloadLink}
                                            >
                                                Descargar comprobante
                                            </a>
                                            <label className={styles.fileInput}>
                                                <BiRefresh className={styles.refreshIcon} size={30} />
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileUpload(order.ORD_ID, e)}
                                                    disabled={uploading[order.ORD_ID]}
                                                    />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className={styles.fileInput}>
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(order.ORD_ID, e)}
                                                disabled={uploading[order.ORD_ID]}
                                            />
                                            {uploading[order.ORD_ID] ? (
                                                <span className={styles.loading}>
                                                    <div className="spinner-border" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </span>
                                            ) : (
                                                <span className="d-flex justify-content-center align-items-center gap-2">
                                                    <AiOutlineUpload /> Cargar comprobante
                                                </span>
                                            )}
                                        </label>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>
        </CenteredContainer>
  );
}

export default MyRequests;