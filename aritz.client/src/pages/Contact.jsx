import { useState } from "react";
import LocationMap from "../components/LocationMap/LocationMap";

function Contact() {

    const [contactFormData, setContactFormData] = useState({
        name: '',
        surname: '',
        cellphone: '',
        email: '',
        comments: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContactFormData({ ...contactFormData, [e.target.name]: e.target.value })
    }

    return (
        <div className="d-flex flex-column justify-content-center container gap-5 p-3">
            <div>
                <h4 className="text-center">CONTACTO</h4>
            </div>
            <div>
                <form className="container">
                    <div className="row mb-3 g-3">
                        <div className="col-12 col-md-4">
                            <label
                                htmlFor="nameForm"
                                className="form-label"
                            >
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
                            <label
                                htmlFor="surnameForm"
                                className="form-label"
                            >
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
                            <label
                                htmlFor="telForm" 
                                className="form-label"
                            >
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
                                htmlFor="exampleFormControlInput1"
                                className="form-label"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="exampleFormControlInput1"
                                placeholder="name@example.com"
                                name="email"
                                onChange={handleChange}
                                value={contactFormData.email}
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
                            >
                            </textarea>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        type="submit">
                        Enviar
                    </button>
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