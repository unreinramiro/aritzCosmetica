import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import styles from "./AdminPostalCode.module.css";
import { FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import { MdSystemUpdateAlt } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";

function AdminPostalCodes() {

    const [postalCodes, setPostalCodes] = useState([]);
    const [editContactId, setEditContactId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        Name: "",
        MinZipCode: "",
        MaxZipCode: "",
        Price: ""
    });

    const [activeAddPostal, setActiveAddPostal] = useState(false);

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

    const handleSaveClick = async (insertUpdate) => {
        console.log(insertUpdate);
        try {
            await axiosInstance.post(`Shipping/${insertUpdate}`, {
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
                                                    className="form-control"
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
                                                    className="form-control"
                                                />
                                            </td>   
                                            <td data-label="MaxZipCode">
                                                <input 
                                                    type="Number" 
                                                    name="MaxZipCode" 
                                                    value={editFormData.MaxZipCode}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
                                                />
                                            </td>
                                            <td data-label="Precio">
                                                <input 
                                                    type="Number" 
                                                    name="Price" 
                                                    value={editFormData.Price}
                                                    onChange={handleEditFormChange}
                                                    className="form-control"
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
                                                    onClick={() => handleSaveClick('update')}
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
                            {activeAddPostal
                                ?
                                (
                                    <tr>
                                        <td data-label="Provincia">
                                            <input
                                                type="Text"
                                                name="Name"
                                                className="form-control"
                                                placeholder="Provincia"
                                                value={editFormData.Name}
                                                onChange={handleEditFormChange}
                                            />
                                        </td>
                                        <td data-label="MinZipCode">
                                            <input
                                                type="Number"
                                                name="MinZipCode"
                                                className="form-control"
                                                placeholder="MinZipCode"
                                                value={editFormData.MinZipCode}
                                                onChange={handleEditFormChange}
                                            />
                                        </td>
                                        <td data-label="MaxZipCode">
                                            <input
                                                type="Number"
                                                name="MaxZipCode"
                                                className="form-control"
                                                placeholder="MaxZipCode"
                                                value={editFormData.MaxZipCode}
                                                onChange={handleEditFormChange}
                                            />
                                        </td>
                                        <td data-label="Precio">
                                            <input
                                                type="Number"
                                                name="Price"
                                                className="form-control"
                                                placeholder="Precio"
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
                                                onClick={() => handleSaveClick('addPostalCode')}
                                            />
                                            <FaTimes
                                                size={20}
                                                color="red"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setActiveAddPostal(false)}
                                                title="Cancelar"
                                            />
                                        </td>
                                    </tr>
                                )
                                :
                                (
                                    <tr
                                        className={`d-flex align-items-center justify-content-center ${styles.addPostalCode}`}
                                        onClick={() => {
                                            setActiveAddPostal(true);

                                            setEditFormData({
                                                Name: "",
                                                MinZipCode: "",
                                                MaxZipCode: "",
                                                Price: ""
                                            });

                                            setEditContactId(0);
                                        }}
                                    >
                                        <td className="d-flex align-items-center justify-content-center gap-2">
                                            <IoMdAddCircle
                                                size={30}
                                            />
                                            Agregar una categoria
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    )
}

export default AdminPostalCodes;