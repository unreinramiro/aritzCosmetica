import styles from "./NotFound.module.css";
import imgNotFound from "../../src/assets/icons/404.svg"
import { NavLink } from "react-router-dom";
function NotFound() {


    return (
        <div
            className="d-flex justify-content-center flex-column align-items-center"
            style={{ width: "100vw", padding: "50px" }}
        >
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

export default NotFound;