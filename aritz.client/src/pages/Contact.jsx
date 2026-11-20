import { useState } from "react";
import LocationMap from "../components/LocationMap/LocationMap";
import axiosInstance from "../api/axiosConfig";
import Swal from "sweetalert2"; // Importar SweetAlert2
import { useSession } from "../context/SessionContext";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // 1. Importar el hook
import styles from "./Contact.module.css";
import { FaWhatsapp } from "react-icons/fa";

function Contact() {
  const { userId, isLoggedIn } = useSession();
  const navigate = useNavigate();

  const [contactFormData, setContactFormData] = useState({
    name: "",
    surname: "",
    cellphone: "",
    comments: "",
    affair: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactFormData({ ...contactFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoggedIn) {
      try {
        const dataToSend = {
          ...contactFormData,
          userId: userId, // Aquí aseguramos que se envíe con el nombre correcto y el valor actual
        };

        const response = await axiosInstance.post(
          "Contact/sendContactForm",
          dataToSend,
        );
        Swal.fire({
          icon: "success",
          title: "Email enviado correctamente",
        });
        setContactFormData({
          name: "",
          surname: "",
          cellphone: "",
          email: "",
          affair: "",
          comments: "",
        });
      } catch (e) {
        console.log("Error al enviar el mail: ", e);
        Swal.fire({
          icon: "error",
          title: "Hubo un error al enviar el mensaje",
        });
      }
    } else {
      Swal.fire({
        icon: "warning", // 'warning' queda mejor que 'error' aquí
        title: "Acceso restringido",
        text: "Primero debe iniciar sesión o registrarse para enviar un mensaje",
        confirmButtonText: "Ir a Login",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    }
  };

  const WHATSAPP_NUMBER = "5491164837901";
  const WHATSAPP_MESSAGE = "Hola, quisiera hacer una consulta. Vengo de la pagina de Aritz Cosmetica Natural.";

  return (
    <div
      className={`d-flex flex-column justify-content-center container gap-5 p-5 ${styles.inputAnimate}`}
    >
      <div>
        <h4 className="text-center">CONTACTO</h4>
      </div>
      <div>
        <form className="container d-flex flex-column" onSubmit={handleSubmit}>
          <div className="row mb-3 g-3">
            <div className="col-12 col-md-4">
              <label htmlFor="nameForm" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                className="form-control"
                id="nameForm"
                name="name"
                onChange={handleChange}
                value={contactFormData.name}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label htmlFor="surnameForm" className="form-label">
                Apellido
              </label>
              <input
                type="text"
                className="form-control"
                id="surnameForm"
                name="surname"
                onChange={handleChange}
                value={contactFormData.surname}
              />
            </div>
            <div className="col-12 col-md-4">
              <label htmlFor="telForm" className="form-label">
                Telefono
              </label>
              <input
                type="number"
                className="form-control"
                id="telForm"
                name="cellphone"
                onChange={handleChange}
                value={contactFormData.cellphone}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div>
              <label
                htmlFor="exampleFormControlTextarea1"
                className="form-label"
              >
                Asunto
              </label>
              <input
                type="text"
                className="form-control"
                name="affair"
                onChange={handleChange}
                value={contactFormData.affair}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div>
              <label
                htmlFor="exampleFormControlTextarea1"
                className="form-label"
              >
                Comentario
              </label>
              <textarea
                className="form-control"
                id="exampleFormControlTextarea1"
                rows="3"
                name="comments"
                onChange={handleChange}
                value={contactFormData.comments}
              ></textarea>
            </div>
          </div>
          <div className={styles.containerButtons}>
            <button className={styles.btnSend} type="submit">
              Enviar
            </button>
            <a
              className={`${styles.btnSend} ${styles.btnWpp}`}
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp size={20} />
              Whatsapp
            </a>
          </div>
        </form>
      </div>
      <div>
        <LocationMap
          title="Tambien podes encontrarnos en nuestro stand"
          description="Whatsapp: +54 9 11 6483-7901"
          location="Los Manantiales 63, X5194 Villa Gral. Belgrano, Córdoba"
        />
      </div>
    </div>
  );
}

export default Contact;
