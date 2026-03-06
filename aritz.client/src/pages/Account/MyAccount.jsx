import { useState, useEffect } from "react";
import BreadCrum from "../../components/BreadCrum/BreadCrum";
import CenteredContainer from "../../components/CenteredContainer/CenteredContainer";
import styles from "./MyAccount.module.css";
import { MdModeEdit } from "react-icons/md";
import Provinces from "../../data/Provinces.json";
import axiosInstance from "../../api/axiosConfig";
import { useSession } from "../../context/SessionContext";
import Swal from 'sweetalert2'; // Importar SweetAlert2
function MyAccount() {
    const [editMode, setEditMode] = useState({
        account: false,
        personal: false,
        domicilio: false
    });
    const [account, setAccount] = useState([]);
    const [error, setError] = useState(null); // Estado para gestionar errores
    const { userId, setUserName } = useSession();
    const [formPersonalData, setPersonalData] = useState({
        nombre: '',
        apellido: '',
        documento: '',
        telefono: ''
    });
    const [formDomData, setDomData] = useState({
        provincia: '',
        ciudad: '',
        codpostal: '',
        calle: '',
        altura: '',
        piso: '',
        casadepto: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loadingPassChange, setLoadingPassChange] = useState(false);
    const [loadingPersonalChange, setLoadingPersonalChange] = useState(false);
    const [loadingDomChange, setLoadingDomChange] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleEditMode = (section) => {
        setEditMode(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }

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

    useEffect(() => {
        fetchAccount();
    }, [userId]); 

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoadingPassChange(true);
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            Swal.fire({ icon: 'error', title: 'Las contraseñas no coinciden' });
            return;
        }
        try {
            // Enviar datos al backend
            const response = await axiosInstance.post(`Account/changePassword`, {
                userId,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            Swal.fire({
                title: 'Código enviado al mail',
                text: 'Revisa tu correo para confirmar el cambio de clave.',
                icon: 'info'
            });
            if (response) {
                const { value: code } = await Swal.fire({
                    title: "Ingresa el código de confirmación",
                    input: "text",
                    inputPlaceholder: "Código de 6 dígitos",
                    inputAttributes: {
                        maxlength: 10,
                        autocapitalize: "off",
                        autocorrect: "off"
                    },
                    showCancelButton: true
                });

                if (!code) {
                    Swal.fire({ icon: "info", title: "Operación cancelada" });
                    return;
                }

                // Enviar código (y la nueva contraseña si tu backend no la guardó temporalmente)
                try {
                    const confirmResponse = await axiosInstance.post("Account/confirmPasswordChange", {
                        userId,
                        code
                    });
                    Swal.fire({ icon: "success", title: "Clave cambiada correctamente" });
                    // limpia los campos y cierra la UI si corresponde
                    setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                    toggleEditMode("account");
                } catch (err) {
                    Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.Message || "Código inválido o expirado" });
                }
            }
            // Aquí podrías mostrar un input para ingresar el código de verificación
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.Message || 'Error al cambiar la clave' });
        } finally {
            setLoadingPassChange(false);
        }
    };

    const handleUpdPersonalData = async () => {
        setLoadingPersonalChange(true);
        try {
            console.log("Datos enviados al backend: ", formPersonalData, userId);

            const camposOpcionales = ['documento', 'telefono'];

            const hayErrores = Object.entries(formPersonalData).some(([key, value]) => {
                if (camposOpcionales.includes(key)) return false;

                return value === null || value === undefined || value.toString().trim() === '';
            });

            if (hayErrores) {
                Swal.fire("Error", "Completa los campos obligatorios", "warning");
                return;
            }

            const response = await axiosInstance.post(`Account/updPersonalData/${userId}`, formPersonalData);
            Swal.fire({
                title: 'Informacion actualizada correctamente!',
                icon: 'success',
                confirmButtonText: 'Continuar'
            })
            toggleEditMode('personal'); //Cierro el menu de actualizar de datos personales
            setUserName(formPersonalData.nombre);
            localStorage.setItem('userName', formPersonalData.nombre);
            fetchAccount();
        } catch (e) {
            console.log("Error al actualizar los datos: ", e);
        } finally {
            setLoadingPersonalChange(false);
        }
    }

    const handleUpdDom = async () => {
        setLoadingDomChange(true);
        try {
            console.log("Datos enviados al backend: ", formDomData, userId);

            const camposOpcionales = ['piso', 'casadepto'];

            const hayErrores = Object.entries(formDomData).some(([key, value]) => {
                if (camposOpcionales.includes(key)) return false;

                return value === null || value === undefined || value.toString().trim() === '';
            });

            if (hayErrores) {
                Swal.fire("Error", "Completa los campos obligatorios", "warning");
                return;
            }

            const response = await axiosInstance.post(`Account/updDom/${userId}`, formDomData);
            Swal.fire({
                title: 'Informacion actualizada correctamente!',
                icon: 'success',
                confirmButtonText: 'Continuar'
            })
            toggleEditMode('domicilio'); //Cierro el menu de actualizar de datos personales
            fetchAccount();
        } catch (e) {
            console.log("Error al actualizar los datos: ", e);
        } finally {
            setLoadingDomChange(false);
        }
    }

    useEffect(() => {
        setPersonalData({
            nombre: account.USR_NAME || '',
            apellido: account.USR_SURNAME || '',
            documento: account.USR_DOCUMENT_NUMBER || '',
            telefono: account.USR_PHONE_NUMBER || ''
        });

        setDomData({
            provincia: account.USR_PROVINCE || '',
            ciudad: account.USR_CITY || '',
            codpostal: account.USR_POSTAL_CODE || '',
            calle: account.USR_STREET || '',
            altura: account.USR_STREET_NUMBER || '',
            piso: account.USR_FLOOR || '',
            casadepto: account.USR_APARTMENT || ''
        })
    }, [account]);



    const handlePersonalData = async (e) => {
        e.preventDefault();
        try {
            const { name, value } = e.target;
            setPersonalData(prev => ({
                ...prev,
                [name]: value
            }));
        } catch (error) {
            alert(error.response?.data?.Message || 'Error en formulario');
        }
    }

    const handleDomData = async (e) => {
        e.preventDefault();
        try {
            const { name, value } = e.target;
            setDomData(prev => ({
                ...prev,
                [name]: value
            }));
        } catch (error) {
            alert(error.response?.data?.Message || 'Error en formulario');
        }
    }

  return (
      <CenteredContainer>
          <BreadCrum />
          <div className={styles.container}>
              <div className={styles.datosCuentaContainer}>
                  <div className={styles.titleAndIcon }>
                    <h4>Datos de la cuenta</h4>
                      <MdModeEdit
                          className={styles.editIcon}
                          size={20}
                          onClick={() => toggleEditMode('account')}
                      />
                  </div>
                  <div className={styles.datosCuenta}>
                      <label className={styles.labelEmailPassword}>
                          {editMode.account ?
                              <div className={styles.labelEmailUpd}>
                                  <label to="email">Email:</label>
                                  <input
                                      type="email"
                                      placeholder="Email"
                                      name="email"
                                      value={account.USR_EMAIL}
                                      readOnly
                                  />
                                  <label to="currentPassword">Clave actual:</label>
                                  <input
                                      type="password"
                                      placeholder="currentPassword"
                                      name="currentPassword"
                                      onChange={handlePasswordChange}
                                  />
                                  <label to="newPassword">Clave nueva:</label>
                                  <input
                                      type="password"
                                      placeholder="newPassword"
                                      name="newPassword"
                                      onChange={handlePasswordChange}
                                  />
                                  <label to="confirmNewPassword">Repetir Clave nueva:</label>
                                  <input
                                      type="password"
                                      placeholder="Confirm password"
                                      name="confirmNewPassword"
                                      onChange={ handlePasswordChange}
                                  />
                              </div>
                              :
                              <div className={styles.noEditContainer}>
                                  <p>Email: {account.USR_EMAIL}</p>
                                  <p>Contraseña: ***********</p>
                              </div>
                          }
                      </label>
                      {editMode.account ?
                          <div className={styles.containerBtns}> 
                              <input
                                  type="submit"
                                  value="Cancelar"
                                  className="btn btn-danger"
                                  onClick={() => toggleEditMode('account')}
                              />
                              <button
                                  className="btn btn-primary"
                                  onClick={handlePasswordSubmit}
                              >
                                  {loadingPassChange ? (
                                      <div className="spinner-border" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                      </div>
                                  )
                                      :
                                      'Actualizar'
                                  }
                              </button>
                          </div>
                          :
                          ''
                      }
                  </div>
              </div>
              <div className={styles.datosPersonalesContainer}>
                  <div className={styles.titleAndIcon}>
                      <h4>Datos personales</h4>
                      <MdModeEdit
                          className={styles.editIcon}
                          size={20}
                          onClick={() => toggleEditMode('personal')}
                      />
                  </div>
                  <div className={styles.datosCuenta}>
                      <form className={styles.labelEmailPassword}>
                          {editMode.personal ?
                              <div className={styles.labelEmailUpd}>
                                  <label to="nombre">Nombre:</label>
                                  <input
                                      type="text"
                                      placeholder="Nombre"
                                      name="nombre"
                                      value={formPersonalData.nombre}
                                      onChange={handlePersonalData}
                                  />
                                  <label to="apellido">Apellido:</label>
                                  <input
                                        type="text"
                                        placeholder="Apellido"
                                        name="apellido"
                                        value={formPersonalData.apellido}
                                        onChange={handlePersonalData}
                                  />
                                  <label to="documento">Documento:</label>
                                  <input
                                      type='number'
                                      placeholder="Documento"
                                      name="documento"
                                      value={formPersonalData.documento}
                                      onChange={handlePersonalData}
                                  />
                                  <label to="documento">Telefono:</label>
                                  <input
                                      type='number'
                                      placeholder="Telefono"
                                      name="telefono"
                                      value={formPersonalData.telefono}
                                      onChange={handlePersonalData}
                                  />
                              </div>
                              :
                              <div className={styles.noEditContainer}>
                                  <p>Nombre: {account.USR_NAME ? account.USR_NAME : 'SIN CARGAR'}</p>
                                  <p>Apellido: {account.USR_SURNAME ? account.USR_SURNAME : 'SIN CARGAR'}</p>
                                  <p>Documento: {account.USR_DOCUMENT_NUMBER ? account.USR_DOCUMENT_NUMBER : 'SIN CARGAR'}</p>
                                  <p>Telefono: {account.USR_PHONE_NUMBER ? account.USR_PHONE_NUMBER : 'SIN CARGAR'}</p>
                              </div>
                          }
                      </form>

                      {editMode.personal ?
                          <div className={styles.containerBtns}>
                              <input
                                  type="submit"
                                  value="Cancelar"
                                  className="btn btn-danger"
                                  onClick={() => toggleEditMode('personal')}
                              />
                              <button
                                  className="btn btn-primary"
                                  onClick={handleUpdPersonalData}
                              >
                                  {loadingPersonalChange ? (
                                      <div className="spinner-border" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                      </div>
                                  )
                                      :
                                      'Actualizar'
                                  }
                              </button>
                          </div>
                          :
                          ''
                      }
                  </div>
              </div>
              <div className={styles.domicilioContainer}>
                  <div className={styles.titleAndIcon}>
                      <h4>Domicilio</h4>
                      <MdModeEdit
                          className={styles.editIcon}
                          size={20}
                          onClick={() => toggleEditMode('domicilio')}
                      />
                  </div>
                  <div className={styles.datosCuenta}>
                      <label className={styles.labelEmailPassword}>
                          {editMode.domicilio ?
                              <div className={styles.labelEmailUpd}>
                                  <label to="provincia">Provincia:</label>
                                  <select
                                      className={styles.shippingInputs}
                                      name="provincia"
                                      id="provincia"
                                      value={formDomData.provincia || Provinces[0]}
                                      onChange={handleDomData}
                                  >
                                      <option value="">Selecciona una provincia</option>
                                      {Provinces.map((provincia) => (
                                          <option
                                              key={provincia}
                                              value={provincia}
                                          >
                                              {provincia}
                                          </option>
                                      ))}
                                  </select>
                                  <label to="ciudad">Ciudad:</label>
                                  <input
                                      type="text"
                                      placeholder="Ciudad"
                                      name="ciudad"
                                      value={formDomData.ciudad === '' ? '' : formDomData.ciudad}
                                      onChange={handleDomData}
                                  />
                                  <label to="codpostal">Codigo Postal:</label>
                                  <input
                                      type="number"
                                      placeholder="Codigo Postal"
                                      name="codpostal"
                                      value={formDomData.codpostal === '' ? '' : formDomData.codpostal}
                                      onChange={handleDomData}
                                  />
                                  <label to="calle">Calle:</label>
                                  <input
                                      type="text"
                                      placeholder="Calle"
                                      name="calle"
                                      value={formDomData.calle === '' ? '' : formDomData.calle}
                                      onChange={handleDomData}
                                  />
                                  <label to="altura">Altura:</label>
                                  <input
                                      type="number"
                                      placeholder="Altura"
                                      name="altura"
                                      value={formDomData.altura === '' ? '' : formDomData.altura}
                                      onChange={handleDomData}
                                  />
                                  <label to="piso">Piso:</label>
                                  <input
                                      type="number"
                                      placeholder="Piso"
                                      name="piso"
                                      value={formDomData.piso === '' ? '' : formDomData.piso}
                                      onChange={handleDomData}
                                  />
                                  <label to="casa">Casa/Dpto:</label>
                                  <input
                                      type="number"
                                      placeholder="Casa/Dpto"
                                      name="casadepto"
                                      value={formDomData.casadepto === '' ? '' : formDomData.casadepto}
                                      onChange={handleDomData}
                                  />
                              </div>
                              :
                              <div className={styles.noEditContainer}>
                                  <p>Provincia: {account.USR_PROVINCE ? account.USR_PROVINCE : 'SIN CARGAR'}</p>
                                  <p>Ciudad: {account.USR_CITY ? account.USR_CITY : 'SIN CARGAR'}</p>
                                  <p>Cod.Postal: {account.USR_POSTAL_CODE ? account.USR_POSTAL_CODE : 'SIN CARGAR'}</p>
                                  <p>Calle: {account.USR_STREET ? account.USR_STREET : 'SIN CARGAR'}</p>
                                  <p>Altura: {account.USR_STREET_NUMBER ? account.USR_STREET_NUMBER : 'SIN CARGAR'}</p>
                                  <p>Piso: {account.USR_FLOOR ? account.USR_FLOOR : 'SIN CARGAR'}</p>
                                  <p>Casa/Dpto: {account.USR_APARTMENT ? account.USR_APARTMENT : 'SIN CARGAR'}</p>
                              </div>
                          }
                      </label>

                      {editMode.domicilio ?
                          <div className={styles.containerBtns}>
                              <input
                                  type="submit"
                                  value="Cancelar"
                                  className="btn btn-danger"
                                  onClick={() => toggleEditMode('domicilio')}
                              />
                              <button
                                  className="btn btn-primary"
                                  onClick={handleUpdDom}
                              >
                                  {loadingDomChange ? (
                                      <div className="spinner-border" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                      </div>
                                  )
                                      :
                                      'Actualizar'
                                  }
                              </button>

                          </div>
                          :
                          ''
                      }
                  </div>
              </div>
          </div>
      </CenteredContainer>
  );
}

export default MyAccount;