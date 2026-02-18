import imgPending from "../../../src/assets/icons/Waiting-rafiki.svg"
import { NavLink } from "react-router-dom";
function Pending() {
    return (
        <div
            className="d-flex justify-content-center flex-column align-items-center"
            style={{ width: "100vw", padding: "50px" }}
        >
            <h4 className="text-wrap text-center" style={{ width: "600px" }}>Tu pago esta siendo procesado...</h4>
            <img
                src={imgPending}
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
export default Pending;