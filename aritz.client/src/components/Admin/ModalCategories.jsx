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

    const [activeAddCat, setActiveAddCat] = useState(false);
    const [lastCatId, setLastCatId] = useState(0);

    const [newCat, setNewCat] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEditClick = (event, cat) => {
        event.preventDefault();
        setEditCatId(cat.CAT_ID);
        setEditCatName(cat.CAT_NAME);
    };

    const handleEditFormChange = (event) => {
        event.preventDefault();
        const fieldValue = event.target.value; // Obtego el valor del atributo

        var newCatName = fieldValue;

        setEditCatName(newCatName);
    };

    const handleCancelClick = () => {
        setEditCatId(null);
    };

    const handleSaveClick = async () => {
        try {
            await axiosInstance.post('Categories/updCategory', {
                catId: editCatId,
                catName: editCatName
            });

            fetchCategories();
            setEditCatId(null);

            Swal.fire({
                title: 'Categoria actualizada correctamente!',
                icon: 'success',
                confirmButtonText: 'Continuar'
            })

        } catch (error) {
            console.error("Error al guardar", error);
        }
    };
   
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('Products/by-category'); // Realiza una solicitud GET a /api/products
            setCategories(response.data); // Actualiza el estado con los datos obtenidos
            const cantCats = response.data.length
            console.log("Cant Categorias: ", cantCats);

            console.log("Ultimo ID del ultimo elemento del array", response.data[cantCats - 1].CAT_ID)
            setLastCatId(response.data[cantCats - 1].CAT_ID); //Cambiamos el estado al ultimo ID de las cats existentes
        } catch (err) {
            console.error("Error al obtener los productos", err); // Muestra el error en consola
            setError(err.message); // Guarda el mensaje de error en el estado
        }
    }

    const handleNewCategory = (event) => {
        event.preventDefault();
        const fieldValue = event.target.value; // Obtego el valor del atributo

        setNewCat(fieldValue);
    };

    const handleInsertCat = async () => {
        try {
            const dataToSend = {
                catId: lastCatId + 1,
                catName: newCat
            }
            const response = await axiosInstance.post('Categories/insertCategory', dataToSend);

            fetchCategories();
            setActiveAddCat(false);

            Swal.fire({
                title: 'Categoria insertada con exito!',
                icon: 'success',
                confirmButtonText: 'Continuar'
            })

        } catch (e) {
            console.log("No se pudo insertar la categoria", e);
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
                                                value={editCatName}
                                                onChange={handleEditFormChange}
                                                className="form-control"
                                                name="catName"
                                            />
                                        </div>
                                        <div className="d-flex flex-column">
                                            <FaCheck
                                                size={20}
                                                color="green"
                                                style={{ cursor: "pointer", marginRight: "10px" }}
                                                title="Guardar"
                                                onClick={handleSaveClick}
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
                        {activeAddCat
                            ?
                            (
                                <div
                                    className="d-flex justify-content-between align-center w-100 gap-1"
                                >
                                    <div className="d-flex gap-2 justify-content-center">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Id"
                                            readOnly
                                            value={lastCatId+1}
                                        />
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="catName"
                                            placeholder="Nombre de la categoria"
                                            value={newCat}
                                            onChange={handleNewCategory}
                                        />
                                    </div>
                                    <div className="d-flex flex-column">
                                        <FaCheck
                                            size={20}
                                            color="green"
                                            style={{ cursor: "pointer", marginRight: "10px" }}
                                            title="Guardar"
                                            onClick={handleInsertCat}
                                        />
                                        <FaTimes
                                            size={20}
                                            color="red"
                                            style={{ cursor: "pointer" }}
                                            title="Cancelar"
                                            onClick={() => setActiveAddCat(false)}
                                        />
                                    </div>
                                </div>
                            )
                    :
                    (
                    <div
                        className={`d-flex align-items-center gap-2 ${styles.addCat}`}
                        onClick={() => setActiveAddCat(true)}
                    >
                        <IoMdAddCircle
                            size={30}
                        />
                        Agregar una categoria
                    </div>
                    ) 
                }

                    </div>
                </div>
            </div>
        </div>

    )
}

export default ModalProducts;