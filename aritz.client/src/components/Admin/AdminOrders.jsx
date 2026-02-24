import styles from '../Admin/AdminManage.module.css'
import Swal from 'sweetalert2';
import axiosInstance from '../../api/axiosConfig';
import { useEffect, useState } from 'react';
import { formatPrice, formatDate } from '../../utils/utils';
import { CiSearch, CiFilter } from "react-icons/ci";
import { LuSearchX } from "react-icons/lu";
import ModalOrder from './ModalOrder';
function AdminOrders() {

    const [allOrders, setAllOrders] = useState([]);
    const [orderUser, setOrderUser] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecent, setFilteredRecent] = useState('recents');
    const [filteredStatus, setFilteredStatus] = useState('all');
    const [filteredReceipt, setFilteredReceipt] = useState('all');
    const [filteredAz, setFilteredAz] = useState('az');
    const [filteredOrders, setFilteredOrders] = useState([]);
    

    useEffect(() => {
        fetchAllOrders();
    }, []);

    useEffect(() => {
        let result = [...allOrders];

        // 1. Filtro por texto
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.ClientFullName.toLowerCase().includes(term)
            );
        }

        // 2. Filtro por mas reciente o antiguo
        if (filteredRecent === 'recents') {
            result.sort((a, b) => new Date(b.ORD_ORDER_DATE) - new Date(a.ORD_ORDER_DATE));
        } else if (filteredRecent === 'olders') {
            result.sort((a, b) => new Date(a.ORD_ORDER_DATE) - new Date(b.ORD_ORDER_DATE));
        }

        // 3. Filtro de estado del pedido
        if (filteredStatus === 'pending') {
            result = result.filter(o => o.ORD_STATUS === 'Pendiente')
        } else if (filteredStatus === 'onCourse') {
            result = result.filter(o => o.ORD_STATUS === 'En curso');
        } else if (filteredStatus === 'finish') {
            result = result.filter(o => o.ORD_STATUS === 'Finalizado');
        } else if (filteredStatus === 'canceled') {
            result = result.filter(o => o.ORD_STATUS === 'Cancelado');
        }

        //4. Filtro comprobante subido o no
        if (filteredReceipt === 'no') {
            result = result.filter(o => !o.ReceiptPath);
        } else if (filteredReceipt === 'yes') {
            result = result.filter(o => o.ReceiptPath);
        }

        //5. Filtro alfabeticamente
        if (filteredAz === 'az') {
            result.sort((a, b) => a.ClientFullName.localeCompare(b.ClientFullName));
        } else if (filteredAz === 'za') {
            result.sort((a, b) => b.ClientFullName.localeCompare(a.ClientFullName));
        }

        setFilteredOrders(result);
    }, [searchTerm, filteredRecent, allOrders, filteredStatus, filteredReceipt, filteredAz]);

    const fetchAllOrders = async () => {
        const response = await axiosInstance.get('Order/allOrders');
        setAllOrders(response.data);
        console.log(response.data);
    }

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
                OrderStatus: newStatus,
                CancelOrderByUser: false
            };

            const response = await axiosInstance.put(`Order/${orderId}/updOrdStatus`, bodyData);
            Swal.fire('Exito', `Se actualizo correctamente el estado a ${bodyData.OrderStatus}`, 'success');
        } catch (e) {
            console.log("Error al querer actualizar el estado: ", e);
        }
    }

    return (
        <>
        <div className={styles.containerAllFilters}>
            <div className={styles.filtrosContainer}>
                <div className="input-group flex-nowrap">
                    <span className="input-group-text" id="addon-wrapping"><CiSearch /></span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar..."
                        aria-label="Username"
                        aria-describedby="addon-wrapping"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div
                    className={styles.filter}
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseExample"
                    aria-expanded="false"
                    aria-controls="collapseExample"
                >
                    <CiFilter
                        className={styles.filterIcon}
                    />
                    <h5>Filtros:</h5>
                </div>

            </div>
        

            <div className={`collapse ${styles.filterGroup}`} id="collapseExample">
                <ul>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredRecent"
                                checked={filteredRecent === 'recents'}
                                onChange={() => setFilteredRecent('recents')}
                            />
                            Mas recientes
                        </label>
                    </li>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredRecent"
                                checked={filteredRecent === 'olders'}
                                onChange={() => setFilteredRecent('olders')}
                            />
                            Mas antiguos
                        </label>
                    </li>
                </ul>

                <ul>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredStatus"
                                checked={filteredStatus === 'all'}
                                onChange={() => setFilteredStatus('all')}
                            />
                            Todos
                        </label>
                    </li>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredStatus"
                                checked={filteredStatus === 'pending'}
                                onChange={() => setFilteredStatus('pending')}
                            />
                            Pendientes
                        </label>
                    </li>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredStatus"
                                checked={filteredStatus === 'onCourse'}
                                onChange={() => setFilteredStatus('onCourse')}
                            />
                            En curso
                        </label>
                    </li>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredStatus"
                                checked={filteredStatus === 'finish'}
                                onChange={() => setFilteredStatus('finish')}
                            />
                            Finalizado
                        </label>
                    </li>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredStatus"
                                checked={filteredStatus === 'canceled'}
                                onChange={() => setFilteredStatus('canceled')}
                            />
                            Cancelado
                        </label>
                    </li>
                </ul>

                <ul>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredReceipt"
                                checked={filteredReceipt === 'all'}
                                onChange={() => setFilteredReceipt('all')}
                            />
                            Todos
                        </label>
                    </li>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredReceipt"
                                checked={filteredReceipt === 'no'}
                                onChange={() => setFilteredReceipt('no')}
                            />
                            Comprobante sin subir
                        </label>
                    </li>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredReceipt"
                                checked={filteredReceipt === 'yes'}
                                onChange={() => setFilteredReceipt('yes')}
                            />
                            Comprobante subido
                        </label>
                    </li>

                </ul>

                <ul>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredAz"
                                checked={filteredAz === 'az'}
                                onChange={() => setFilteredAz('az')}
                            />
                            Nombre A-Z
                        </label>
                    </li>
                    <li className={styles.filterItem}>
                        <label>
                            <input
                                type="radio"
                                name="filteredActive"
                                checked={filteredAz === 'za'}
                                onChange={() => setFilteredAz('za')}
                            />
                            Nombre Z-A
                        </label>
                    </li>

                </ul>
            </div>
        </div>
            <div className={styles.containerTableOrders}>
                {filteredOrders.length <= 0
                    ?
                    <div className={styles.containerLupita}>
                        <h2>No se encontraron coincidencias...</h2>
                        <LuSearchX
                            className={styles.lupita}
                        />
                    </div>
                    :
                    <table className={styles.productsUserTable}>
                        <thead>
                            <tr>
                                <th>Nro Orden</th>
                                <th>Fecha de la orden</th>
                                <th>Cliente</th>
                                <th>Estado</th>
                                <th>Monto</th>
                                <th>Comprobante</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr
                                    key={order.ORD_ID}
                                    className={styles.filaOrdenDetail}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <td
                                        data-bs-toggle="modal"
                                        data-bs-target="#staticBackdrop"
                                        data-label="Nro Orden"
                                    >
                                        {order.ORD_ID}
                                    </td>
                                    <td
                                        data-bs-toggle="modal"
                                        data-bs-target="#staticBackdrop"
                                        data-label="Fecha"
                                    >
                                        {formatDate(order.ORD_ORDER_DATE)}hs
                                    </td>
                                    <td
                                        data-bs-toggle="modal"
                                        data-bs-target="#staticBackdrop"
                                        data-label="Cliente"
                                    >
                                        {order.ClientFullName}
                                    </td>
                                    <td data-label="Estado">
                                        <div className="input-group flex-nowrap">
                                            <select
                                                className="form-select"
                                                aria-label="Default select example"
                                                name="ORD_STATUS"
                                                defaultValue={order.ORD_STATUS}
                                                onChange={(e) => handleStatusChange(order.ORD_ID, e.target.value)}
                                            >
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="En curso">En curso</option>
                                                <option value="Eviado">Enviado</option>
                                                <option value="Finalizado">Finalizado</option>
                                                <option value="Cancelado">Cancelado</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td
                                        data-bs-toggle="modal"
                                        data-bs-target="#staticBackdrop"
                                        data-label="Monto total"
                                    >
                                        ${formatPrice(order.ORD_TOTAL_AMOUNT)}
                                    </td>
                                    <td data-label="Comprobante">
                                        {order.ReceiptPath
                                            ?
                                            <a
                                                href={`${axiosInstance.defaults.baseURL}Order/${order.ORD_ID}/download-receipt`}
                                                rel="noopener noreferrer"
                                            >
                                                Descargar comprobante
                                            </a>
                                            :
                                            'Sin subir'
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>
            <ModalOrder
                orderId={selectedOrder?.ORD_ID}
                orderTotalAmount={selectedOrder?.ORD_TOTAL_AMOUNT}
                orderStatus={selectedOrder?.ORD_STATUS}
            />
        </>
    )
}
export default AdminOrders;