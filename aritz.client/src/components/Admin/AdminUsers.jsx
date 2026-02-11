import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import styles from '../Admin/AdminManage.module.css'
import { FaEdit } from "react-icons/fa";
import ModalUsr from './ModalUsr';
function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get("Account/users");
            setUsers(response.data);
            console.log(response.data);
        } catch (err) {
            console.error("Error al obtener los productos", err);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className={styles.containerTableOrders}>
            <table className={styles.productsUserTable}>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Telefono</th>
                        <th>Administrador</th>
                        <th>Documento</th>
                        <th>Provincia</th>
                        <th>Ciudad</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((usr) => (
                        <tr
                            key={usr.USR_ID}
                            className={styles.filaOrdenDetail}
                        >
                            <td data-label="ID User">
                                {usr.USR_ID}
                            </td>
                            <td data-label="Nombre">{usr.USR_NAME}</td>
                            <td data-label="Apellido">{usr.USR_SURNAME}</td>
                            <td data-label="Mail">{usr.USR_EMAIL}</td>
                            <td data-label="Telefono">{usr.USR_PHONE_NUMBER ? usr.USR_PHONE_NUMBER : ' - '}</td>
                            <td data-label="Administrador">{usr.USR_IS_ADMIN ? 'Si' : 'No'}</td>
                            <td data-label="Nro documento">{usr.USR_DOCUMENT_NUMBER ? usr.USR_DOCUMENT_NUMBER : ' - '}</td>
                            <td data-label="Provincia">{usr.USR_PROVINCE ? usr.USR_PROVINCE : ' - '}</td>
                            <td data-label="Ciudad">{usr.USR_CITY ? usr.USR_CITY : ' - '}</td>

                            <td data-label="Editar usuario">
                                <FaEdit
                                    size={20}
                                    style={{ cursor: "pointer" }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#staticBackdropUsr"
                                    onClick={() => setSelectedUser(usr)}
                                />
                            </td>
                        </tr>
                    ))}

                </tbody>
            </table>

            <ModalUsr
                user={selectedUser}
            />
        </div>
    )
}

export default AdminUsers;