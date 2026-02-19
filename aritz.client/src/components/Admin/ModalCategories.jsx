import styles from '../Admin/Modal.module.css'
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

function ModalProducts() {


    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

    const [editCatId, setEditCatId] = useState(null);
    const [editCatName, setEditCatName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEditClick = (event, cat) => {
        event.preventDefault();
        setEditCatId(cat.CAT_ID);
        setEditCatName(cat.CAT_NAME);
    };

    const handleCancelClick = () => {
        setEditCatId(null);
    };
   
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('Products/by-category'); // Realiza una solicitud GET a /api/products
            setCategories(response.data); // Actualiza el estado con los datos obtenidos
            console.log('Categorias obtenidas:', response.data);
        } catch (err) {
            console.error("Error al obtener los productos", err); // Muestra el error en consola
            setError(err.message); // Guarda el mensaje de error en el estado
        }
    }


    return (

        <div
            className="modal fade"
            id="staticBackdropCategories"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">
                            Categorias
                        </h1>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body d-flex flex-column align-items-center gap-4">
                        {categories.map((cat) => (
                            editCatId == cat.CAT_ID
                                ?
                                (
                                    <div
                                        className="d-flex justify-content-between align-center w-100 gap-1"
                                        key={cat.CAT_ID}
                                    >
                                        <div className="d-flex gap-2 justify-content-center">
                                            <input
                                                type="number"
                                                value={cat.CAT_ID}
                                                className="form-control"
                                            />
                                            <input
                                                type="text"
                                                value={cat.CAT_NAME}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="d-flex flex-column">
                                            <FaCheck
                                                size={20}
                                                color="green"
                                                style={{ cursor: "pointer", marginRight: "10px" }}
                                                title="Guardar"
                                            />
                                            <FaTimes
                                                size={20}
                                                color="red"
                                                style={{ cursor: "pointer" }}
                                                title="Cancelar"
                                                onClick={handleCancelClick}
                                            />
                                        </div>
                                    </div>
                                )
                                :
                                (
                                <div
                                    className = "d-flex justify-content-between align-center w-100"
                                    key = {cat.CAT_ID}
                                >
                                    <div className="d-flex gap-4">
                                        <p>{cat.CAT_ID}</p>
                                        <p>{cat.CAT_NAME}</p>
                                    </div>
                                    <FaEdit
                                        size={20}
                                        style={{ cursor: "pointer" }}
                                        onClick={(event) => handleEditClick(event, cat)}
                                    />
                                </div>
                                )
                            
                        ))}
                        <div className={`d-flex align-items-center gap-2 ${styles.addCat}`}>
                            <IoMdAddCircle
                                size={30}
                            />
                            Agregar una categoria
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                        >
                            Agregar Producto
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ModalProducts;