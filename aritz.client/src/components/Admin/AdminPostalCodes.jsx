import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import styles from "./AdminPostalCode.module.css";
import { FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import { MdSystemUpdateAlt } from "react-icons/md";

function AdminPostalCodes() {

    const [postalCodes, setPostalCodes] = useState([]);
    const [editContactId, setEditContactId] = useState(null);
    const [editMode, setToggleEditMode] = useState(0);
    const [editFormData, setEditFormData] = useState({
        Name: "",
        MinZipCode: "",
        MaxZipCode: "",
        Price: ""
    });

    useEffect(() => {
        fetchPostalCodes();
    }, []);

    const fetchPostalCodes = async () => {
        try {

            const response = await axiosInstance.get('Shipping/getPostalCodes');
            setPostalCodes(response.data);

        } catch (e) {
            console.log("Error al obtener los codigos postales", e);
        }
    }

    const handleEditClick = (event, postalCode) => {
        event.preventDefault();
        setEditContactId(postalCode.Id);

        const formValues = {
            Name: postalCode.Name,
            MinZipCode: postalCode.MinZipCode,
            MaxZipCode: postalCode.MaxZipCode,
            Price: postalCode.Price,
        };
        setEditFormData(formValues);
    };

    const handleEditFormChange = (event) => {
        event.preventDefault();
        const fieldName = event.target.getAttribute("name");
        const fieldValue = event.target.value;

        const newFormData = { ...editFormData };
        newFormData[fieldName] = fieldValue;

        setEditFormData(newFormData);
    };

    const handleCancelClick = () => {
        setEditContactId(null);
    };

    const handleSaveClick = async () => {
        try {
            await axiosInstance.post('Shipping/update', {
                Id: editContactId,
                ...editFormData
            });

            fetchPostalCodes();
            setEditContactId(null);

        } catch (error) {
            console.error("Error al guardar", error);
        }
    };

    return (
        <div className={styles.containerPostalCode} >
            <h1>Codigo Postal</h1>
            <div className={styles.subContaienrPostalCode}>
                <div>
                    <table className={styles.postalCodeTable}>
                        <thead>
                            <tr>
                                <th>Provincia</th>
                                <th>Min ZIP Code</th>
                                <th>Max ZIP Code</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {postalCodes.map((postalCode) => (
                                editContactId == postalCode.Id 
                                    ?
                                (
                                        <tr
                                            key={postalCode.Id}
                                            className={styles.filaPostalCode}
                                        >
                                            <td data-label="Provincia">
                                                <input
                                                    type="Text"
                                                    name="Name"
                                                    value={editFormData.Name}
                                                    onChange={handleEditFormChange}
                                                />
                                            </td>
                                            <td data-label="MinZipCode">
                                                <input
                                                    type="Number" 
                                                    name="MinZipCode" 
                                                    value={editFormData.MinZipCode}
                                                    onChange={handleEditFormChange}
                                                />
                                            </td>   
                                            <td data-label="MaxZipCode">
                                                <input 
                                                    type="Number" 
                                                    name="MaxZipCode" 
                                                    value={editFormData.MaxZipCode}
                                                    onChange={handleEditFormChange}
                                                />
                                            </td>
                                            <td data-label="Precio">
                                                <input 
                                                    type="Number" 
                                                    name="Price" 
                                                    value={editFormData.Price}
                                                    onChange={handleEditFormChange}
                                                />
                                            </td>
                                            <td
                                                data-label="Guardar/Cancelar"
                                                className="d-flex justify-content-center align-center"
                                            >
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
                                                    onClick={handleCancelClick}
                                                    title="Cancelar"
                                                />
                                        </td>
                                    </tr>
                                )
                                    :
                                (
                                    <tr 
                                        key={postalCode.Id}
                                        className={styles.filaPostalCode}
                                    >
                                        <td data-label="Provincia">{postalCode.Name}</td>
                                        <td data-label="MinZipCode">{postalCode.MinZipCode}</td>
                                        <td data-label="MaxZipCode">{postalCode.MaxZipCode}</td>
                                        <td data-label="Precio">${postalCode.Price}</td>
                                        <td data-label="Editar">
                                            <FaEdit
                                                size={20}
                                                style={{ cursor: "pointer" }}
                                                    onClick={(event) => handleEditClick(event, postalCode)}
                                            />
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AdminPostalCodes;