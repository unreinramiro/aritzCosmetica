function Contact() {
    return (
        <div className="d-flex flex-column justify-content-center container gap-5">
            <div>
                <h4 className="text-center">CONTACTO</h4>
            </div>
            <div>
                <form className="container">
                    <div className="row mb-3 g-3">
                        <div className="col-12 col-md-4">
                            <label for="nameForm" className="form-label">Nombre</label>
                            <input type="text" className="form-control" id="nameForm" />
                        </div>
                        <div className="col-12 col-md-4">
                            <label for="surnameForm" className="form-label">Apellido</label>
                            <input type="text" className="form-control" id="surnameForm" />
                        </div>
                        <div className="col-12 col-md-4">
                            <label for="telForm" className="form-label">Telefono</label>
                            <input type="number" className="form-control" id="telForm" />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div>
                            <label for="exampleFormControlInput1" className="form-label">Email</label>
                            <input type="email" className="form-control" id="exampleFormControlInput1" placeholder="name@example.com" />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div>
                            <label for="exampleFormControlTextarea1" className="form-label">Comentario</label>
                            <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                        </div>
                    </div>
                </form>
            </div>
      </div>
  );
}

export default Contact;