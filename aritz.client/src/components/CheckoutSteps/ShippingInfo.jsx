import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/CheckoutContext";
import CenteredContainer from "../CenteredContainer/CenteredContainer";
import styles from "./CheckoutSteps.module.css";
import Provinces from "../../data/Provinces.json";
import TimeLapseCheckout from "../CheckoutSteps/Timelapse/TimelapseCheckout";
import { useSession } from "../../context/SessionContext";
import axiosInstance from "../../api/axiosConfig";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { useLocation } from 'react-router'
import { useCart } from "../../context/CartContext";

function ShippingInfo() {
    const navigate = useNavigate();

    const [selectedProvincia, setSelectedProvincia] = useState(""); // Estado para la provincia seleccionada
    const [account, setAccount] = useState([]);
    const [loadingUpdData, setLoadingUpdData] = useState(false);
    const [loadingZipCode, setLoadingZipCode] = useState(false);
    const [error, setError] = useState(null);
    const { userId, setPageCheckout } = useSession();
    const [formShipData, setShipData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        provincia: '',
        ciudad: '',
        codpostal: '',
        calle: '',
        altura: '',
        piso: '',
        casadepto: ''
    });
    const postalRegex = /^\d{4}$/;
    const location = useLocation();
    const { totalSumCart } = useCart();
    const { zipPrice, setZipPrice } = useCheckout();

    const handleCalculateShipping = async (e) => {
        e.preventDefault();

        const cp = formShipData.codpostal;
        if (!cp || !postalRegex.test(String(cp).trim())) {
            Swal.fire("Error", "Ingresa un Código Postal válido de 4 dígitos", "warning");
            return;
        }

        try {
            // Llamada al endpoint que creamos
            const response = await axiosInstance.get(`Shipping/calculate?zipCode=${cp}`);
            const price = response.data.Price;

            // Guardamos en el contexto (para la pantalla de pago)
            setZipPrice(price);

            // Feedback al usuario
            Swal.fire({
                title: "Costo de Envío",
                text: `El costo aproximado para el CP ${cp} es: $${price}`,
                icon: "info"
            });

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No pudimos calcular el envío", "error");
        }
    }

    //if (totalSumCart < 20000) {
    //    navigate('/cart');
    //}

    setPageCheckout(location);

    useEffect(() => {
        setShipData({
            nombre: account.USR_NAME || '',
            apellido: account.USR_SURNAME || '',
            email: account.USR_EMAIL || '',
            telefono: account.USR_PHONE_NUMBER || '',
            provincia: account.USR_PROVINCE || '',
            ciudad: account.USR_CITY || '',
            codpostal: account.USR_POSTAL_CODE || '',
            calle: account.USR_STREET || '',
            altura: account.USR_STREET_NUMBER || '',
            piso: account.USR_FLOOR || '',
            casadepto: account.USR_APARTMENT || ''
        })
    }, [account]);

    //navigate("/checkout/payment-method"); // Ir al siguiente paso

    const back = () => {
        navigate("/cart");
    };

    const handleChangeProvince = (event) => {
        setSelectedProvincia(event.target.value);
    };

    const fetchAccount = async () => {
        try {
            const response = await axiosInstance.get(`Account/${userId}`);
            setAccount(response.data); // Actualiza el estado con los datos obtenidos
            console.log('Cuenta:', response.data);
        } catch (err) {
            console.error("Error al obtener la cuenta", err);
            setError(err.message);
        }
    };

    const handleShipData = async (e) => {
        e.preventDefault();
            const { name, value } = e.target;
            setShipData(prev => ({
                ...prev,
                [name]: value
            }));
            if (name === 'codpostal') {


                if (value.length === 4) {
                    try {
                        const response = await axiosInstance.get(`Shipping/calculate?zipCode=${value}`);
                        const price = response.data.Price;

                        setZipPrice(price);

                        // Opcional: Feedback visual pequeño (console.log)
                        console.log("Precio actualizado automáticamente:", price);
                    } catch (error) {
                        console.error("Error calculando envío automático", error);
                        setZipPrice(0); // Si falla, reseteamos a 0
                    }
                } else {
                    // Si el usuario borra números y quedan menos de 4, reseteamos el precio
                    setZipPrice(0);
                }
            }
    }

    useEffect(() => {
        fetchAccount();
    }, [userId]);

    const handleUpdDom = async () => {
        try {
            console.log("Datos enviados al backend: ", formShipData, userId);
            console.log("Precio cod postal: ", zipPrice);

            const camposOpcionales = ['piso', 'casadepto'];

            const hayErrores = Object.entries(formShipData).some(([key, value]) => {
                if (camposOpcionales.includes(key)) return false;

                return value === null || value === undefined || value.toString().trim() === '';
            });

            if (hayErrores) {
                Swal.fire("Error", "Completa los campos obligatorios", "warning");
                return;
            }

            //Validacion para el codigo postal
            if (zipPrice == 0) {

                const cp = formShipData.codpostal;
                if (!cp || !postalRegex.test(String(cp).trim())) {
                    Swal.fire("Error", "Ingresa un Código Postal válido de 4 dígitos", "warning");
                    return;
                }

                setLoadingZipCode(true);

                const response = await axiosInstance.get(`Shipping/calculate?zipCode=${cp}`);
                const price = response.data.Price;
                setZipPrice(price);
            }

            setLoadingUpdData(true);

            const response = await axiosInstance.post(`Account/updDom/${userId}`, formShipData);

            navigate('/checkout/payment-method');

        } catch (e) {
            console.log("Error al actualizar los datos: ", e);
        } finally {
            setLoadingZipCode(false);
            setLoadingUpdData(false);
        }
    }

    return (
        <CenteredContainer>
            <TimeLapseCheckout />
            <div className={styles.container}>
                <div className={`${styles.contactContainer} d-flex flex-column gap-2`}>
                    <h6>CONTACTO</h6>
                    <label className={styles.shippingLabels}>
                        <input
                            className={styles.shippingInputs}
                            type="email"
                            name="email"
                            value={formShipData.email}
                            placeholder="Email"
                            readOnly
                        />
                    </label>
                    <label className={styles.shippingLabels}>
                        <input
                            className={styles.shippingInputs}
                            type="telphone"
                            name="cellphone"
                            value={formShipData.telefono}
                            onChange={handleShipData}
                            placeholder="Telefono"
                        />
                    </label>
                </div>
                <hr className={styles.shippingSeparate} ></hr>
                <div className={`d-flex ${styles.formShippingInfo}`}>
                    <h6>INFORMACION DE ENVIO</h6>
                    <label className={`d-flex gap-3 ${styles.shippingLabels}`}>
                        <input
                            className={styles.shippingInputs}
                            type="text"
                            name="nombre"
                            value={formShipData.nombre}
                            onChange={handleShipData}
                            placeholder="Nombre"
                        />
                        <input
                            className={styles.shippingInputs}
                            type="text"
                            name="apellido"
                            value={formShipData.apellido}
                            onChange={handleShipData}
                            placeholder="Apellido"
                        />
                    </label>
                    <label className={styles.shippingLabels} htmlFor="provincias">
                        <select
                            className={styles.shippingInputs}
                            name="provincia"
                            id="provincias"
                            value={formShipData.provincia || Provinces[0]}
                            onChange={handleShipData}
                        >
                            <option value="">Selecciona una provincia</option>
                            {Provinces.map((provincia) => (
                                <option key={provincia} value={provincia}>
                                    {provincia}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.shippingLabels}>
                        <input
                            className={styles.shippingInputs}
                            type="text"
                            name="ciudad"
                            value={formShipData.ciudad}
                            onChange={handleShipData}
                            
                            placeholder="Ciudad"
                        />
                    </label>
                    <label className={`d-flex gap-3 ${styles.shippingLabels}`}>
                        <input
                            className={styles.shippingInputs}
                            type="text"
                            name="calle"
                            value={formShipData.calle}
                            onChange={handleShipData}
                            placeholder="Calle"
                        />
                        <label>
                        <input
                            className={styles.shippingInputs}
                            type="number"
                            name="codpostal"
                            value={formShipData.codpostal}
                            onChange={handleShipData}
                            placeholder="Codigo Postal"
                            />
                        </label>
                        <button
                            className={styles.calcSend}
                            onClick={handleCalculateShipping}
                            type="button"
                        >
                            {loadingZipCode ? (
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )
                                :
                                'Calcular Envio'
                            }
                        </button>
                    </label>
                    <label className={`d-flex gap-3 ${styles.shippingLabels}`}>
                        <input
                            className={styles.shippingInputs}
                            type="number"
                            name="altura"
                            value={formShipData.altura}
                            onChange={handleShipData}
                            placeholder="Altura"
                        />
                        <input
                            className={styles.shippingInputs}
                            type="number"
                            name="piso"
                            value={formShipData.piso}
                            onChange={handleShipData}
                            placeholder="Piso"
                        />
                        <input
                            className={styles.shippingInputs}
                            type="number"
                            name="casadepto"
                            value={formShipData.casadepto}
                            onChange={handleShipData}
                            placeholder="Casa"
                        />
                    </label>

                    <label className={`d-flex gap-3 ${styles.shippingLabels}`}>
                        <button
                            type="submit"
                            onClick={back}
                            className={styles.btnShippingBack}>Volver</button>
                        <button
                            className={styles.btnShippingNext}
                            type="submit"
                            onClick={handleUpdDom}
                        >
                            {loadingUpdData ? (
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )
                                :
                                'Siguiente'
                            }
                        </button>
                    </label>
                </div>
            </div>
        </CenteredContainer>
    );
}

export default ShippingInfo;