import styles from "./Failure.module.css";
import imgNotFound from "../../../src/assets/icons/404 Error-rafiki.svg"
import { NavLink } from "react-router-dom";
function Failure() {
    return (
        <div
            className="d-flex justify-content-center flex-column align-items-center"
            style={{ width: "100vw", padding: "50px" }}
        >
            <h4 className="text-wrap text-center" style={{ width: "600px"}}>Tu pago fallo... Por favor, intentelo de nuevo mas tarde</h4>
            <img
                src={imgNotFound}
                style={{ width: "50%" }}
            />
            <NavLink
                className="btn btn-primary"
                to="/"
            >
                Volver a la tienda
            </NavLink>
        </div>
    )
}
export default Failure;