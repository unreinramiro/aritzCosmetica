import styles from '../Admin/Modal.module.css'
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axiosConfig";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { IoMdAddCircle } from "react-icons/io";
import { FiUpload } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
function Modal({ productName, productCategory, productImg, productPrice, productQuantity, productDescription, productStatus, productId, refresh, productsGallery }) {

    const [prdData, setPrdData] = useState({
        PRD_IMAGE: null,
        PRD_ID: productId ?? '',
        PRD_NAME: productName ?? '',
        PRD_PRICE: productPrice ?? '',
        PRD_QUANTITY: productQuantity ?? '',
        PRD_DESCRIPTION: productDescription ?? '',
        PRD_IS_ACTIVE: productStatus != null ? String(productStatus) : ''
    });
    const [imagesToUpdate, setImagesToUpdate] = useState({}); 
    const [addImg, setAddImg] = useState([]);
    const [currentGallery, setCurrentGallery] = useState([]);
    const [loadingUpdPrd, setLoadingUpdPrd] = useState(false);

    // Sincroniza el estado cuando cambien las props
    useEffect(() => {
        setCurrentGallery(productsGallery || []); 

        setImagesToUpdate({});
        setAddImg([]);

        setPrdData({
            PRD_IMAGE: null,
            PRD_ID: productId ?? '',
            PRD_NAME: productName ?? '',
            PRD_PRICE: productPrice ?? '',
            PRD_QUANTITY: productQuantity ?? '',
            PRD_DESCRIPTION: productDescription ?? '',
            PRD_IS_ACTIVE: productStatus != null ? String(productStatus) : ''
        });
    }, [
        productId,
        productName,
        productCategory,
        productImg,
        productPrice,
        productQuantity,
        productDescription,
        productStatus,
        productsGallery 
    ]);

    const fileInputRef = useRef(null); 

    const handlePrdData = (e) => {
        const { name, value, type, files } = e.target; // <--- Agregamos type y files

        setPrdData(prev => ({
            ...prev,
            // Si es archivo usamos files[0], si no, usamos value
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleAddImg = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            // Usamos el spread operator (...prev) para NO borrar los anteriores
            setAddImg(prev => [...prev, ...newFiles]);

            // Truco: Limpiamos el input para permitir subir el mismo archivo 2 veces si se desea
            e.target.value = '';
        }
    }

    const handleGalleryChange = (e, imgId) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Guardamos en el objeto: Clave = ID, Valor = Archivo
            setImagesToUpdate(prev => ({
                ...prev,
                [imgId]: file
            }));
        }
    }

    const handleUpdPrd = async () => {
        setLoadingUpdPrd(true);
        try {
            const formData = new FormData();

            formData.append('PRD_ID', prdData.PRD_ID);
            formData.append('PRD_NAME', prdData.PRD_NAME);
            formData.append('PRD_PRICE', prdData.PRD_PRICE);
            formData.append('PRD_QUANTITY', prdData.PRD_QUANTITY);
            formData.append('PRD_DESCRIPTION', prdData.PRD_DESCRIPTION);
            formData.append('PRD_IS_ACTIVE', prdData.PRD_IS_ACTIVE);

            // Cambia la imagen PRINCIPAL por OTRA
            if (prdData.PRD_IMAGE) {
                formData.append('MainImageFile', prdData.PRD_IMAGE);
            }

            // Agrega una Imagen NUEVA
            if (addImg) {
                addImg.forEach((file) => {
                    formData.append('NewGalleryImages', file);
                });
            }

            Object.keys(imagesToUpdate).forEach((keyId) => {
                const file = imagesToUpdate[keyId];

                // Enviamos el ID y el Archivo por separado pero en orden
                formData.append('UpdatedGalleryIds', keyId);
                formData.append('UpdatedGalleryFiles', file);
            });

            console.log("Datos enviados al backend: ", formData);
            const response = await axiosInstance.post('Products/updPrd', formData);
            refresh(prev => !prev);
            setAddImg([]);

            const closeBtn = document.querySelector('#staticBackdrop .btn-close');
            if (closeBtn) {
                closeBtn.click();
            }

            Swal.fire({
                title: 'Informacion actualizada correctamente!',
                icon: 'success',
                confirmButtonText: 'Continuar'
            })
        } catch (e) {
            console.log("Error al actualizar los datos: ", e);
        } finally {
            setLoadingUpdPrd(false);
        }
    }

    const handleDelImg = async (id) => {
        try {
            console.log("Id de la imagen a borrar enviado al backend: ", id);
            const response = await axiosInstance.delete(`Products/delImg/${id}`);
            refresh(prev => !prev);

            // Filtramos la galería para quitar la imagen con ese ID
            setCurrentGallery(prev => prev.filter(img => img.IMG_ID !== id));
        } catch (e) {
            console.log("Error al borrar los datos: ", e);
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
            <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">
                            {productCategory} {productName}
                        </h1>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body d-flex flex-column align-items-center gap-2">
                        <div className={styles.imageProductDiv}>
                            <div className="input-group mb-3 d-flex gap-2">

                                <label>
                                    <b>Imagen Principal</b>

                                    <img src={`${import.meta.env.VITE_API_URL}/images/${productImg}`} />
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="inputGroupFile02"
                                    name="PRD_IMAGE"
                                    accept="image/*"
                                    onChange={handlePrdData}
                                />
                            </div>
                        </div>
                        {currentGallery.length > 0
                            ?
                            currentGallery.map((img, index) => (
                                <div
                                    key={index}
                                    className={styles.imageSecondaryProductDiv}
                                >
                                    <div className={styles.imageSecondaryProductDivSub}>
                                        <div className='d-flex justify-content-between'>
                                            <b>Imagen {index + 2}</b>
                                            <MdDeleteForever
                                                className={styles.delIcon}
                                                size={25}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => { handleDelImg(img.IMG_ID) }}
                                            />
                                        </div>
                                        <img src={`${import.meta.env.VITE_API_URL}/images/${img.IMG_URL}`} />
                                    </div>
                                    <div className={styles.imageSecondaryProductDivSub}>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="inputGallery"
                                            onChange={(e) => { handleGalleryChange(e, img.IMG_ID) }}
                                            accept="image/*"
                                        />
                                    </div>
                                        {imagesToUpdate.length > 0 && (
                                            <div className="mt-2 small text-muted">
                                                Archivo: {imagesToUpdate.map(f => f.name)}
                                            </div>
                                        )}
                                </div>

                            ))
                            :
                            ''
                        }
                        <div className={styles.agregarImgNuevaDiv}>
                            <IoMdAddCircle
                                size={50}
                            />
                            Agregar una imagen nueva
                            <input
                                type="file"
                                accept="image/*"
                                className={styles.agregarImgNuevaInput}
                                onChange={handleAddImg}
                                multiple
                                ref={fileInputRef}
                            />
                        </div>
                        {addImg.length > 0 && (
                            <div className="mt-2 small text-muted">
                                Archivo: {addImg.map(f => f.name).join(', ')}
                            </div>
                        )}

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
                                        value={prdData.PRD_NAME}
                                        name="PRD_NAME"
                                        onChange={handlePrdData}
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
                                            value={prdData.PRD_PRICE}
                                            name="PRD_PRICE"
                                            onChange={handlePrdData}
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
                                        value={prdData.PRD_QUANTITY}
                                        name="PRD_QUANTITY"
                                        onChange={handlePrdData}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <div className="input-group">
                                    <span className="input-group-text">Descripcion:</span>
                                    <textarea
                                        className="form-control"
                                        aria-label="With textarea"
                                        value={prdData.PRD_DESCRIPTION}
                                        name="PRD_DESCRIPTION"
                                        onChange={handlePrdData}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="text-start">Activo:</p>
                                <div className="input-group flex-nowrap">
                                    <select
                                        className="form-select"
                                        aria-label="Default select example"
                                        value={prdData.PRD_IS_ACTIVE}
                                        name="PRD_IS_ACTIVE"
                                        onChange={handlePrdData}
                                    >
                                        <option value="true">Si</option>
                                        <option value="false">No</option>
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
                            onClick={handleUpdPrd}
                        >
                            {loadingUpdPrd ? (
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )
                                :
                                'Actualizar'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal;