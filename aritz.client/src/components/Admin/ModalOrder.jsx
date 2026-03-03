import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import styles from '../Admin/Modal.module.css'
import { formatPrice } from '../../utils/utils';

function ModalOrder({ orderId, orderTotalAmount, orderStatus }) {

    const [ord, setOrd] = useState([]);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await axiosInstance.get(`Order/requestDetail/${orderId}`);
            setOrd(response.data);
            console.log("Detalles recibidos:", response.data);
        } catch (error) {
            console.error("Error al buscar detalles:", error);
        }
    }

    return (
        <div
            className="modal fade"
            id="staticBackdrop"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className={`modal-content ${styles.containerGeneralOrder}`}>
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">Detalle de la Orden Nro #{orderId}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <p
                        style={{ paddingTop: "20px" }}
                    >
                        Estado del pedido: {orderStatus}
                    </p>
                    <hr></hr>
                    
                    <div className="modal-body d-flex flex-column gap-3">
                        {ord.map((or) => (
                            <div
                                className={`${styles.divItemDetailOrder} d-flex justify-content-evenly`}
                                key={or.ORD_ID}
                            >
                                <div className={styles.orderDetailImgContainer}>
                                    <img src={`${import.meta.env.VITE_API_URL}/images/${or.ProductImage}`} />
                                </div>
                                <div className={`d-flex flex-column justify-content-center ${styles.infoOrderContainer}`}>
                                    <div>
                                        <p className="d-flex justify-content-between">Id:<b>#{or.IdOrderDetail}</b></p>
                                    </div>
                                    <div>
                                        <p className="d-flex justify-content-between">Name: <b>{or.ProductName}</b></p>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <p className="d-flex justify-content-between">Cantidad: <b>{or.Quantity}</b></p>
                                        <p className="d-flex justify-content-between">Precio unitario: <b>${formatPrice(or.TotalPrice)}</b></p>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <p className="d-flex justify-content-between">Subtotal: <b>${formatPrice(or.Quantity * or.TotalPrice) }</b></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <hr></hr>
                    <div style={{ padding: "20px" }}>
                        <h5>Total: <b>${formatPrice(orderTotalAmount)}</b></h5>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ModalOrder;