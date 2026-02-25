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

    // Usuarios
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);

    // Provincias
    const [provinces, setProvince] = useState([])

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredActive, setFilteredActive] = useState('all');
    const [filteredAdmin, setFilteredAdmin] = useState('all');
    const [filteredRecent, setFilteredRecent] = useState('recents');
    const [filteredUsers, setFilteredUsers] = useState([]);

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

    useEffect(() => {
        let result = [...users];

        // 1. Filtro por texto
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.USR_NAME.toLowerCase().includes(term) ||
                u.USR_SURNAME.toLowerCase().includes(term)
            );
        }

        // 2. Filtro por activo o no
        if (filteredActive === 'active') {
            result = result.filter(u => u.USR_IS_VERIFIED === true);
        } else if (filteredActive === 'inactive') {
            result = result.filter(u => u.USR_IS_VERIFIED === false);
        }

        // 3. Filtro por admin o no
        if (filteredAdmin === 'admin') {
            result = result.filter(u => u.USR_IS_ADMIN === true);
        } else if (filteredAdmin === 'noAdmin') {
            result = result.filter(u => u.USR_IS_ADMIN === false);
        }

        // 4. Filtro por mas reciente o antiguo
        if (filteredRecent === 'recents') {
            result.sort((a, b) => new Date(b.USR_CREATED_DATE) - new Date(a.USR_CREATED_DATE));
        } else if (filteredRecent === 'olders') {
            result.sort((a, b) => new Date(a.USR_CREATED_DATE) - new Date(b.USR_CREATED_DATE));
        }

        // 5. Filtro por provincia
        if (provinces.length > 0) {
            result = result.filter(u =>
                provinces.includes(u.USR_PROVINCE)
            );
        }

        setFilteredUsers(result);

    }, [searchTerm, users, filteredActive, filteredAdmin, filteredRecent, provinces]);

    const groupProvinces = (items, size = 3) => {
        const groups = [];
        for (let i = 0; i < items.length; i += size) {
            groups.push(items.slice(i, i + size));
        }
        return groups;
    };

    const categoryGroups = groupProvinces(Provinces);

    // Funcion para filtros en los checkboxes
    const handleProvinceChange = (province) => {
        setProvince(prev =>
            prev.includes(province)
                ? prev.filter(prov => prov !== province)
                : [...prev, province]
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
        } catch (error) {
            console.log("No se pudo borrar el usuario ", error);
            if (error.response.status === 409) {
                Swal.fire({
                    title: 'No se pudo eliminar',
                    text: error.response.data,
                    icon: 'error'
                });
            } 
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
                                        checked={filteredActive === 'all'}
                                        onChange={() => setFilteredActive('all')}
                                    />
                                    Todos
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                        checked={filteredActive === 'active'}
                                        onChange={() => setFilteredActive('active')}
                                    />
                                    Activo
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                        checked={filteredActive === 'inactive'}
                                        onChange={() => setFilteredActive('inactive')}
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
                                        name="filteredAdmin"
                                        checked={filteredAdmin === 'all'}
                                        onChange={() => setFilteredAdmin('all')}
                                    />
                                    Todos
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredAdmin"
                                        checked={filteredAdmin === 'admin'}
                                        onChange={() => setFilteredAdmin('admin')}
                                    />
                                    Admin
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredAdmin"
                                        checked={filteredAdmin === 'noAdmin'}
                                        onChange={() => setFilteredAdmin('noAdmin')}
                                    />
                                    No Admin
                                </label>
                            </li>
                        </ul>

                        <ul>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredRecents"
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
                                        name="filteredRecents"
                                        checked={filteredRecent === 'olders'}
                                        onChange={() => setFilteredRecent('olders')}
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
                                        key={index}
                                    >
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={provinces.includes(province)}
                                                onChange={() => handleProvinceChange(province)}
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
                        {filteredUsers.map((usr) => (
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
                    fetchUs={fetchUsers}
                />
            </div>
        </>
        
    )
}

export default AdminUsers;