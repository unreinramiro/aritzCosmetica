import styles from '../Admin/Modal.module.css'
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import Swal from 'sweetalert2'; // Importar SweetAlert2

function ModalProducts({ refresh }) {

    const [prdData, setPrdData] = useState({
        PRD_IMAGE: null,
        PRD_NAME: '',
        PRD_PRICE: 0,
        PRD_QUANTITY: 1,
        PRD_DESCRIPTION: '',
        PRD_CAT_ID: 1,
        PRD_IS_ACTIVE: 1
    });
    const [categories, setCategories] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [loadingAddPrd, setLoadingAddPrd] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const handlePrdChange = (e) => {
        const { name, value, type, files } = e.target;
        setPrdData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    }

    const handleGalleryChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            // Usamos el spread operator (...prev) para NO borrar los anteriores
            setGalleryFiles(prev => [...prev, ...newFiles]);

            // Truco: Limpiamos el input para permitir subir el mismo archivo 2 veces si se desea
            e.target.value = '';
        }
    }

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

    const handleAddPrd = async () => {
        setLoadingAddPrd(true);
        try {
            // 2. Crear FormData (Obligatorio para subir archivos)
            const formData = new FormData();
            formData.append('PRD_NAME', prdData.PRD_NAME);
            formData.append('PRD_PRICE', prdData.PRD_PRICE);
            formData.append('PRD_QUANTITY', prdData.PRD_QUANTITY);
            formData.append('PRD_DESCRIPTION', prdData.PRD_DESCRIPTION);
            // Convertimos el booleano/string a lo que espera el backend
            formData.append('PRD_IS_ACTIVE', prdData.PRD_IS_ACTIVE === "1" || prdData.PRD_IS_ACTIVE === true);

            // Solo agregamos la imagen si existe
            if (prdData.PRD_IMAGE) {
                formData.append('PRD_IMAGE', prdData.PRD_IMAGE);
            }
            console.log(galleryFiles);
            if (galleryFiles) {
                galleryFiles.forEach((file) => {
                    formData.append('GalleryImages', file);
                });
            }

            // OJO: Si necesitas enviar Categoría, agrégala aquí también
            formData.append('PRD_CAT_ID', prdData.PRD_CAT_ID);

            // 3. Enviar con cabecera multipart/form-data
            const response = await axiosInstance.post('Products/addPrd', formData);
            refresh(prev => !prev);

            const closeBtn = document.querySelector('#staticBackdropProducts .btn-close');
            if (closeBtn) {
                closeBtn.click();
            }

            Swal.fire('Éxito', 'Producto agregado correctamente', 'success');

            // Aquí podrías llamar a una función para refrescar la lista de productos (props)

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo cargar el producto', 'error');
        } finally {
            setLoadingAddPrd(false);
        }
    }

    return (

        <div
            className="modal fade"
            id="staticBackdropProducts"
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
                            Agrega un producto
                        </h1>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body d-flex flex-column align-items-center">
                        <label className="form-label fw-bold">Imagen Principal</label>
                        <div className="input-group mb-3">
                            <input
                                type="file"
                                className="form-control"
                                id="inputGroupFile02"
                                name="PRD_IMAGE"
                                onChange={handlePrdChange}
                                accept="image/*"
                            />
                            <label
                                className="input-group-text"
                                htmlFor="inputGroupFile02">
                                Upload
                            </label>
                        </div>
                        <div className="w-100 mb-3">
                            <label className="form-label fw-bold">Galeria de Imagenes (Opcional):</label>
                            <div className="input-group">
                                <input
                                    type="file"
                                    className="form-control"
                                    id="inputGallery"
                                    multiple // <--- CLAVE: Permite seleccionar varios
                                    onChange={handleGalleryChange}
                                    accept="image/*"
                                />
                                <label className="input-group-text" htmlFor="inputGallery">
                                    {galleryFiles.length} Seleccionadas
                                </label>
                            </div>
                            {galleryFiles.length > 0 && (
                                <div className="mt-2 small text-muted">
                                    Archivos: {galleryFiles.map(f => f.name).join(', ')}
                                </div>
                            )}
                        </div>
                        <hr></hr>
                        <div className={styles.infoProductoDiv}>
                            <div className="d-flex flex-column">
                                <p className="text-start">Titulo:</p>
                                <div className="input-group flex-nowrap">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Titulo"
                                        aria-label="Username"
                                        aria-describedby="addon-wrapping"
                                        name="PRD_NAME"
                                        onChange={handlePrdChange}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="text-start">Precio:</p>
                                <div className="input-group flex-nowrap">
                                    <span className="input-group-text" id="addon-wrapping">$</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Price"
                                        aria-label="Username"
                                        aria-describedby="addon-wrapping"
                                        name="PRD_PRICE"
                                        onChange={handlePrdChange}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="text-start">Cantidad:</p>
                                <div className="input-group flex-nowrap">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Quantity"
                                        aria-label="Username"
                                        aria-describedby="addon-wrapping"
                                        name="PRD_QUANTITY"
                                        onChange={handlePrdChange}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <div className="input-group">
                                    <span className="input-group-text">Descripcion:</span>
                                    <textarea
                                        className="form-control"
                                        aria-label="With textarea"
                                        name="PRD_DESCRIPTION"
                                        onChange={handlePrdChange}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="text-start">Categoria:</p>
                                <div className="input-group flex-nowrap">
                                    <select
                                        className="form-select"
                                        aria-label="Default select example"
                                        name="PRD_CAT_ID"
                                        onChange={handlePrdChange}
                                    >
                                        <option value="">Open this select menu</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.CAT_ID}
                                                value={category.CAT_ID}
                                            >
                                                {category.CAT_NAME}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="text-start">Activo:</p>
                                <div className="input-group flex-nowrap">
                                    <select
                                        className="form-select"
                                        aria-label="Default select example"
                                        name="PRD_IS_ACTIVE"
                                        onChange={handlePrdChange}
                                    >
                                        <option value="">Open this select menu</option>
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>
                            </div>
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
                            onClick={handleAddPrd}
                        >
                            {loadingAddPrd ? (
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )
                                :
                                'Agregar Producto'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ModalProducts;