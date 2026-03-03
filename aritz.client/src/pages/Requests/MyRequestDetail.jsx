import CenteredContainer from "../../components/CenteredContainer/CenteredContainer";
import { useParams } from 'react-router-dom';
import styles from "./MyRequestDetail.module.css";
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import Swal from 'sweetalert2';
import { useSession } from "../../context/SessionContext";
import { BiRefresh } from "react-icons/bi";
import { AiOutlineUpload } from "react-icons/ai";
import BreadCrum from "../../components/BreadCrum/BreadCrum";
import { formatPrice } from '../../utils/utils';
import { useSearchParams } from 'react-router-dom';

function MyRequestDetail() {

    const { id } = useParams();
    const [status, setStatus] = useState('');
    const [requestDet, setRequestDet] = useState([]);
    const [error, setError] = useState(null);
    const [totalQuantity, setQuantity] = useState(0);
    const [totalAmount, setAmount] = useState(0);
    const [orders, setOrders] = useState([]);
    const [uploading, setUploading] = useState({}); // Estado de carga por orden
    const { userId } = useSession();
    const [path, setPath] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);

    useEffect(() => {
        // Obtengo el detalle de la orden
        const fetchRequestDetail = async () => {
            try {
                const response = await axiosInstance.get(`Order/requestDetail/${id}`);
                setRequestDet(response.data);

                if (response.data[0].ReceiptPath) {
                    setPath(true);
                } else {
                    setPath(false);
                }

                const firstItem = response.data[0];
                const finalTotalFromDB = firstItem.OrderTotalAmount; 

                // Cálculo de la cantidad total de items
                const totalQuantity = response.data.reduce((acc, item) => acc + (item.Quantity || 0), 0);

                // Calculo el total a pagar
                const subTotalAmount = response.data.reduce((acc, item) => acc + item.TotalPrice * item.Quantity, 0);


                const calculatedShipping = finalTotalFromDB - subTotalAmount;

                setQuantity(totalQuantity);
                setAmount(finalTotalFromDB);//Aca iria el ENVIO cuando tenga hecha esa logica
                setShippingCost(calculatedShipping > 0 ? calculatedShipping : 0);

                console.log(response.data[0]);
                setStatus(response.data[0].OrderStatus);

            } catch (error) {
                console.error("Error al obtener las ordenes", error);
                setError(error.message);
            }
        };
        fetchRequestDetail();
    }, [id, status]);


    const handleFileUpload = async (id, event) => {
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
            setUploading((prev) => ({ ...prev, [id]: true }));
            const response = await axiosInstance.post(`Order/${id}/upload-receipt`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Actualizar la orden en el estado
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.ORD_ID === id ? { ...order, ReceiptPath: response.data.ReceiptPath } : order
                )
            );

            setPath(true);

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
            setUploading((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleCancelOrdStatus = async () => {
        try {
            const bodyData = {
                OrderId: id,
                OrderStatus: 'Cancelado',
                CancelOrderByUser: true
            }
            const response = await axiosInstance.put(`Order/${id}/updOrdStatus`, bodyData);
            setStatus('Cancelado'); 
            Swal.fire('Exito', `Se cancelo correctamente el pedido`, 'success');
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div>
            <BreadCrum id={id}/>
        
            <div className={styles.centeredContainer}>

                <div className={styles.items}>
                    <div className={styles.shiippingData}>
                        Llega entre el * y el *
                    </div>
                    {requestDet.map((request) => (
                        <div
                            className={styles.itemsContainer}
                            key={request.IdOrderDetail}>
                            <b>Compra #{request.IdOrderDetail}</b>
                            <hr></hr>
                            <div className={styles.itemsDetail}>
                                <div className={styles.imageContainer}>
                                    <img src={`${import.meta.env.VITE_API_URL}/images/${request.ProductImage}`} />
                                </div>
                                <div className={styles.itemsDetailSub}>
                                    <h4>{request.ProductName}</h4>
                                    <p>Cantidad: {request.Quantity}</p>
                                    <p>c/u ${formatPrice(request.TotalPrice)}</p>
                                </div>
                                <div className={styles.TotalPrice}>
                                    <b>Subtotal:</b>
                                    <p>${formatPrice(request.TotalPrice*request.Quantity)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.aside}>
                    <div className={styles.resumen}>
                        <p>Estado: {status}</p>
                        <hr></hr>
                        <b>Resumen de compra</b>
                        <p>Nro orden: <b>#{id}</b></p>
                        <p>Cantidad de items: {totalQuantity}</p>
                        <p>Costo de envio: ${formatPrice(shippingCost)}</p>
                        <hr></hr>
                        <p>Total del pedido: ${formatPrice(totalAmount)}</p>
                    </div>
                    {status != 'Cancelado'
                        ?
                        <div className={styles.Comprobante}>
                            <b>{path ? 'Comprobante subido' : 'Subi tu comprobante aca'}</b>
                            {path ? (
                                <div className={styles.fileRefreshDownload}>
                                    <a
                                        href={`${axiosInstance.defaults.baseURL}/Order/${id}/download-receipt`}
                                        rel="noopener noreferrer"
                                        className={styles.downloadLink}
                                    >
                                        Descargar comprobante
                                    </a>
                                    <label className={styles.fileInput}>
                                        <BiRefresh className={styles.refreshIcon} size={30} />
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(id, e)}
                                            disabled={uploading[id]}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <label className={styles.fileInput}>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileUpload(id, e)}
                                        disabled={uploading[id]}
                                    />
                                    {uploading[id] ? (
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
                        </div>
                        :
                        ''
                    }
                    
                    {status != 'Cancelado'
                        ?
                    <div className={styles.cancelPedido}>
                            <button
                                type="button"
                                className="btn btn-danger"
                                data-bs-toggle="modal"
                                data-bs-target="#staticBackdrop"
                            >
                                Cancelar pedido
                            </button>
                            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h1 className="modal-title fs-5" id="staticBackdropLabel">¿Estas seguro que deseas cancelar el pedido?</h1>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={handleCancelOrdStatus}
                                                data-bs-dismiss="modal"
                                            >Cancelar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                        :
                    ''
                    }

                    <div className={styles.factura}>
                        
                    </div>
                </div>
            </div>
        </div>
  );
}

export default MyRequestDetail;