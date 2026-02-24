import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import styles from '../Admin/AdminManage.module.css'
import { FaEdit } from "react-icons/fa";
import ModalUsr from './ModalUsr';
import { CiSearch, CiFilter } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { LuRefreshCw } from "react-icons/lu";
import Provinces from "../../data/Provinces.json";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2'; // Importar SweetAlert2
function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);

    const [provinces, setProvince] = useState([])

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

    const groupProvinces = (items, size = 3) => {
        const groups = [];
        for (let i = 0; i < items.length; i += size) {
            groups.push(items.slice(i, i + size));
        }
        return groups;
    };

    const categoryGroups = groupProvinces(Provinces);

    // Funcion para filtros en los checkboxes
    const handleProvinceChange = (provId) => {
        setProvince(prev =>
            prev.includes(provId)
                ? prev.filter(id => id !== provId)
                : [...prev, provId]
        );
    };

    const handleDelUser = async (userId) => {
        try {
            const result = await Swal.fire({
                title: "Deseas borrar al usuario?",
                text: "Esta accion no puede deshacerse",
                icon: "warning",
                confirmButtonText: "Si, eliminar",
                cancelButtonText: "Cancelar",
                showCancelButton: true
            })
            if (result.isConfirmed) {

                const response = await axiosInstance.delete(`Users/deleteUser/${userId}`);

                Swal.fire('Exito', `Se elimino correctamente el usuario`, 'success');

                fetchUsers();
            }
        } catch (e) {
            console.log("No se pudo borrar el usuario ", e)
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
                        />
                    </div>

                    <div
                        className={styles.filter}
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseExampleUser"
                        aria-expanded="false"
                        aria-controls="collapseExampleUser"
                    >
                        <CiFilter
                            className={styles.filterIcon}
                        />
                        <h5>Filtros:</h5>
                    </div>

                </div>

                <div className={`collapse`} id="collapseExampleUser">
                    <h6 style={{ textAlign: "start" }}>Otros</h6>
                    <div className={styles.filterGroup}>
                        <ul>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                    />
                                    Todos
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                    />
                                    Activo
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                    />
                                    Inactivo
                                </label>
                            </li>
                        </ul>

                        <ul>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                    />
                                    Todos
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                    />
                                    Es Admin
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                    />
                                    No es Admin
                                </label>
                            </li>
                        </ul>

                        <ul>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                    />
                                    Mas recientes
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                    />
                                    Mas antiguos
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={`collapse`} id="collapseExampleUser">
                    <h6 style={{ textAlign: "start"}}>Provincias</h6>
                    <div className={styles.filterGroup3}>
                        {categoryGroups.map((group, groupIndex) => (
                            <ul key={`group-${groupIndex}`}>
                                {group.map((province, index) => (
                                    <li
                                        className={styles.filterItem}
                                        key={index++}
                                    >
                                        <label>
                                            <input
                                                type="checkbox"
                                            />
                                            <p>{province}</p>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.containerTableOrders}>

                <table className={styles.productsUserTable}>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Telefono</th>
                            <th>Administrador</th>
                            <th>Documento</th>
                            <th>Provincia</th>
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
                                <td data-label="Usuario">{usr.USR_NAME} {usr.USR_SURNAME}</td>
                                <td data-label="Mail">{usr.USR_EMAIL}</td>
                                <td data-label="Telefono">{usr.USR_PHONE_NUMBER ? usr.USR_PHONE_NUMBER : ' - '}</td>
                                <td data-label="Administrador">{usr.USR_IS_ADMIN ? 'Si' : 'No'}</td>
                                <td data-label="Nro documento">{usr.USR_DOCUMENT_NUMBER ? usr.USR_DOCUMENT_NUMBER : ' - '}</td>
                                <td data-label="Provincia">{usr.USR_PROVINCE ? usr.USR_PROVINCE : ' - '}</td>

                                <td data-label="Editar usuario">
                                    <FaEdit
                                        size={20}
                                        style={{ cursor: "pointer" }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#staticBackdropUsr"
                                        onClick={() => setSelectedUser(usr)}
                                    />
                                </td>
                                <td data-label="Borrar">
                                    <MdDeleteForever
                                        className={styles.delIcon}
                                        size={25}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleDelUser(usr.USR_ID)}
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
        </>
        
    )
}

export default AdminUsers;