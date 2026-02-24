import { useState, useEffect } from "react";
import styles from '../Admin/Modal.module.css'
import axiosInstance from "../../api/axiosConfig";
import { NavLink } from "react-router-dom";
import { FaRegSadTear } from "react-icons/fa";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { formatDate } from "../../utils/utils"

function ModalUsr({ user }) {

    const [dataShow, setDataShow] = useState('Info');
    const [orderUser, setOrderUser] = useState([]);
    const [status, setStatus] = useState('Pendiente');

    const getOrderUser = async () => {
        try {
            const response = await axiosInstance.get(`Order/${user.USR_ID}`);
            setOrderUser(response.data);
        } catch (e) {
            console.error("Error al mostrar las ordenes de compra:", e);
        }
    }

    useEffect(() => {
        getOrderUser();
    }, [user.USR_ID]);

    const handleStatusChange = async (orderId, newStatus) => {
        // Actualizamos el estado "orderUser" buscando la orden por su ID
        setOrderUser(prevOrders => prevOrders.map(order => {
            // Si es la orden que modificamos, actualizamos su estado
            if (order.ORD_ID === orderId) {
                return { ...order, ORD_STATUS: newStatus };
            }
            // Si no es, la dejamos igual
            return order;
        }));

        console.log("El order ID es: ", orderId);
        try {

            const bodyData = {
                OrderId: orderId,      
                OrderStatus: newStatus
            };

            const response = await axiosInstance.put(`Order/${orderId}/updOrdStatus`, bodyData);
            Swal.fire('Exito', `Se actualizo correctamente el estado a ${bodyData.OrderStatus}`, 'success');
        } catch (e) {
            console.log("Error al querer actualizar el estado: ", e);
        }
    }

    return (
        <div
            className="modal fade"
            id="staticBackdropUsr"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">{user.USR_NAME} {user.USR_SURNAME}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body d-flex flex-column gap-3" style={{ maxHeight: "70vh", overflowY: "scroll" }}>

                        <ul className="nav nav-tabs">
                            <li className={`nav-item ${styles.pedidos}`}>
                                <p
                                    aria-current="page"
                                    href="#"
                                    className={dataShow === 'Info' ? styles.negrita : ''}
                                    onClick={() => { setDataShow('Info') }}
                                >
                                    Info
                                    
                                </p>
                            </li>
                            <li className={`nav-item ${styles.pedidos}`}>
                                <p
                                    onClick={() => { setDataShow('pedidos') }}
                                    href="#"
                                    className={dataShow === 'pedidos' ? styles.negrita : ''}
                                >
                                    Pedidos
                                </p>
                            </li>
                        </ul>
                        {dataShow == 'Info'
                            ?
                            <>
                                <div className="d-flex flex-column gap-1">
                                    <h6>Contacto</h6>
                                    <div className="input-group flex-nowrap">
                                        <span className={`input-group-text ${styles.spanIcon}`} id="addon-wrapping">@</span>
                                        <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="addon-wrapping" value={user.USR_EMAIL} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>+54</span>
                                        <input type="text" aria-label="Celular" className="form-control" value={user.USR_PHONE_NUMBER} readOnly />
                                    </div>
                                </div>

                                <hr></hr>

                                <div className="d-flex flex-column gap-1">
                                    <h6>Info Personal</h6>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>Nombre</span>
                                        <input type="text" aria-label="First name" className="form-control" value={user.USR_NAME} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>Apellido</span>
                                        <input type="text" aria-label="First name" className="form-control" value={user.USR_SURNAME} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>DNI</span>
                                        <input type="text" aria-label="Documento" className="form-control" value={user.USR_DOCUMENT_NUMBER} readOnly />
                                    </div>
                                </div>

                                <hr></hr>

                                <div className="d-flex flex-column gap-1">
                                    <h6>Domicilio</h6>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>Provincia</span>
                                        <input type="text" aria-label="Provincia" className="form-control" value={user.USR_PROVINCE} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>Ciudad</span>
                                        <input type="text" aria-label="Ciudad" className="form-control" value={user.USR_CITY} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>Calle</span>
                                        <input type="text" aria-label="Ciudad" className="form-control" value={user.USR_STREET} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>Nro de calle</span>
                                        <input type="text" aria-label="Ciudad" className="form-control" value={user.USR_STREET_NUMBER} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>Piso</span>
                                        <input type="text" aria-label="Ciudad" className="form-control" value={user.USR_FLOOR} readOnly />
                                    </div>
                                    <div className="input-group">
                                        <span className={`input-group-text ${styles.spanIcon}`}>Cod Postal</span>
                                        <input type="text" aria-label="Ciudad" className="form-control" value={user.USR_POSTAL_CODE} readOnly />
                                    </div>
                                </div>

                                <hr></hr>

                                <div className="d-flex flex-column gap-1">
                                    <h6>Otros</h6>
                                    <div className="input-group mb-3">
                                        <label className="input-group-text" htmlFor="inputGroupSelect01">Admin</label>
                                        <select
                                            className="form-select"
                                            id="inputGroupSelect01"
                                            value={user.USR_IS_ADMIN}
                                        >
                                            <option value="1">Si</option>
                                            <option value="2">No</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <span className="input-group-text">Creacion de cuenta</span>
                                        <input type="text" aria-label="Ciudad" className="form-control" value={formatDate(user.USR_CREATED_DATE)} readOnly />
                                    </div>
                                </div>

                                
                            </>

                            :

                            orderUser.length <= 0
                                ?
                                <div className="d-flex flex-column align-items-center gap-3">
                                    El cliente no tiene pedidos...
                                    <FaRegSadTear size={150} />
                                </div>
                                :
                            orderUser.map((ord) => (
                                <div className="d-flex flex-column gap-2 p-2" key={ord.ORD_ID}>
                                    <p className="text-start d-flex justify-content-between">Nro Orden: <b>#{ord.ORD_ID}</b></p>
                                    <div className="d-flex flex-column">
                                        <p className="text-start">Estado del pedido:</p>
                                        <div className="input-group flex-nowrap">
                                            <select
                                                className="form-select"
                                                aria-label="Default select example"
                                                name="ORD_STATUS"
                                                defaultValue={ord.ORD_STATUS}
                                                onChange={(e) => handleStatusChange(ord.ORD_ID, e.target.value)}
                                            >
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="En curso">En curso</option>
                                                <option value="Eviado">Enviado</option>
                                                <option value="Finalizado">Finalizado</option>
                                                <option value="Cancelado">Cancelado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <b>Comprobante de pago:</b>
                                        {ord.ReceiptPath
                                            ?
                                            <a
                                                href={`${axiosInstance.defaults.baseURL}Order/${ord.ORD_ID}/download-receipt`}
                                                rel="noopener noreferrer"
                                            >
                                            Descargar comprobante
                                            </a>
                                        :
                                            'Sin subir'
                                        }

                                    </div>
                                <hr></hr>
                                </div>
                            ))
                        }
                        
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ModalUsr;