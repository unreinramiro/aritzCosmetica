import CenteredContainer from "../../components/CenteredContainer/CenteredContainer";
import { useParams } from "react-router-dom";
import styles from "./MyRequestDetail.module.css";
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import swal from "../../utils/swal";
import { useSession } from "../../context/SessionContext";
import { BiRefresh } from "react-icons/bi";
import { AiOutlineUpload } from "react-icons/ai";
import BreadCrum from "../../components/BreadCrum/BreadCrum";
import { formatPrice } from "../../utils/utils";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { calculateDeliveryRange, formatDate } from "../../utils/dateUtils";

function MyRequestDetail() {
  const { id } = useParams();
  const params = new URLSearchParams(location.search);
  const payMethod = params.get("payMethod");
  const [status, setStatus] = useState("");
  const [requestDet, setRequestDet] = useState([]);
  const [error, setError] = useState(null);
  const [totalQuantity, setQuantity] = useState(0);
  const [totalAmount, setAmount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [uploading, setUploading] = useState({}); // Estado de carga por orden
  const { userId } = useSession();
  const [path, setPath] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [subTotal, setSubtotal] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);

  useEffect(() => {
    // Obtengo el detalle de la orden
    const fetchRequestDetail = async () => {
      try {
        const response = await axiosInstance.get(`Order/requestDetail/${id}`);
        setRequestDet(response.data);

        if (response.data[0].ReceiptPath) {
          setPath(true);
        } else {
          setPath(false);
        }

        const firstItem = response.data[0];
        const finalTotalFromDB = firstItem.OrderTotalAmount;

        // Cálculo de la cantidad total de items
        const totalQuantity = response.data.reduce(
          (acc, item) => acc + (item.Quantity || 0),
          0,
        );

        const subTotalAmount = response.data.reduce(
          (acc, item) => acc + item.UnitPrice * item.Quantity,
          0,
        );

        const calculatedShipping = response.data[0].ShippingPrice;
        const discount = response.data[0].DiscountAmount;

        setQuantity(totalQuantity);
        setAmount(finalTotalFromDB); //Aca iria el ENVIO cuando tenga hecha esa logica
        setShippingCost(calculatedShipping);
        setDiscountAmount(discount);
        setUnitPrice(response.data[0].UnitPrice);
        setSubtotal(subTotalAmount);

        console.log(response.data[0]);
        setStatus(response.data[0].OrderStatus);
      } catch (error) {
        console.error("Error al obtener las ordenes", error);
        setError(error.message);
      }
    };
    fetchRequestDetail();
  }, [id, status]);

  const handleFileUpload = async (id, event) => {
    const file = event.target.files[0];
    if (!file) {
      swal.fire({
        title: "Error al subir el comprobante de pago",
        text: "Subí un comprobante válido",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Validar tipo de archivo
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const extension = `.${file.name.split(".").pop().toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      swal.fire({
        title: "Error al subir el comprobante",
        text: "Solo se permiten archivos PDF, JPG o PNG",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading((prev) => ({ ...prev, [id]: true }));
      const response = await axiosInstance.post(
        `Order/${id}/upload-receipt`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // Actualizar la orden en el estado
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.ORD_ID === id
            ? { ...order, ReceiptPath: response.data.ReceiptPath }
            : order,
        ),
      );

      setPath(true);

      swal.fire({
        title: "¡Éxito!",
        text: "Comprobante subido exitosamente",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error("Error al subir el comprobante:", error);
      swal.fire({
        title: "Error al subir el comprobante",
        text: "Ocurrió un error al subir el archivo",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const res = await axiosInstance.get(`Order/${id}/download-receipt`, {
        responseType: "blob",
      });
      const ext = (res.data.type.split("/")[1] || "bin").replace("jpeg", "jpg");
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprobante-${id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      swal.fire({
        icon: "error",
        title: "No se pudo descargar el comprobante",
      });
    }
  };

  const handleCancelOrdStatus = async () => {
    try {
      const bodyData = {
        OrderId: id,
        OrderStatus: "Cancelado",
        CancelOrderByUser: true,
      };
      const response = await axiosInstance.put(
        `Order/${id}/updOrdStatus`,
        bodyData,
      );
      setStatus("Cancelado");
      swal.fire("Exito", `Se cancelo correctamente el pedido`, "success");
    } catch (e) {
      console.log(e);
      const data = e.response?.data;
      const message =
        data?.message ?? data?.Message ?? "No se pudo cancelar el pedido";
      swal.fire("Error", message, "error");
    }
  };

  const firstItem = requestDet.length > 0 ? requestDet[0] : null;
  const zipToUse = firstItem ? firstItem.ZipCode : null;

  const deliveryEstimation = calculateDeliveryRange(zipToUse);

  return (
    <div className={styles.principalContainer}>
      <BreadCrum id={id} />

      <div className={styles.centeredContainer}>
        <div className={styles.items}>
          <div className={styles.shiippingData}>
            Llega entre el {deliveryEstimation ? deliveryEstimation.start : "*"}{" "}
            y el {deliveryEstimation ? deliveryEstimation.end : "*"}
          </div>
          {requestDet.map((request) => (
            <div className={styles.itemsContainer} key={request.IdOrderDetail}>
              <b>Compra #{request.IdOrderDetail}</b>
              <hr></hr>
              <div className={styles.itemsDetail}>
                <div className={styles.imageContainer}>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/images/${request.ProductImage}`}
                  />
                </div>
                <div className={styles.itemsDetailSub}>
                  <h4>
                    {request.CategoryName} {request.ProductName}
                  </h4>
                  <p>Cantidad: {request.Quantity}</p>
                  <p>c/u ${formatPrice(unitPrice)}</p>
                </div>
                <div className={styles.TotalPrice}>
                  <b>Subtotal:</b>
                  <p>${formatPrice(request.UnitPrice * request.Quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.aside}>
          <div className={styles.resumen}>
            <p>Estado: {status}</p>
            <hr></hr>
            <b>Resumen de compra</b>
            <p>
              Nro orden: <b>#{id}</b>
            </p>
            <p>Cantidad de items: {totalQuantity}</p>
            <p>Subtotal: ${formatPrice(subTotal)}</p>
            <p>Costo de envio: ${formatPrice(shippingCost)}</p>
            <p>Descuento: -${formatPrice(discountAmount)}</p>
            <hr></hr>
            <p>Total del pedido: ${formatPrice(totalAmount)}</p>
          </div>
          {payMethod == "Transferencia bancaria" &&
          !path &&
          status != "Cancelado" ? (
            <div className={styles.Comprobante}>
              <b>Datos para su transferencia</b>
              <p>CBU: 0000003100006485290527</p>
              <p>Alias: fer.luz.rio</p>
            </div>
          ) : (
            ""
          )}
          {status != "Cancelado" ? (
            <div className={styles.Comprobante}>
              <b>{path ? "Comprobante subido" : "Subi tu comprobante aca"}</b>
              {path ? (
                <div className={styles.fileRefreshDownload}>
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className={styles.downloadLink}
                  >
                    Descargar comprobante
                  </button>
                  <label className={styles.fileInput}>
                    <BiRefresh className={styles.refreshIcon} size={30} />
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(id, e)}
                      disabled={uploading[id]}
                    />
                  </label>
                </div>
              ) : (
                <label className={styles.fileInput}>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(id, e)}
                    disabled={uploading[id]}
                  />
                  {uploading[id] ? (
                    <span className={styles.loading}>
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </span>
                  ) : (
                    <span className="d-flex justify-content-center align-items-center gap-2">
                      <AiOutlineUpload /> Cargar comprobante
                    </span>
                  )}
                </label>
              )}
            </div>
          ) : (
            ""
          )}

          {status != "Cancelado" ? (
            <div className={styles.cancelPedido}>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-toggle="modal"
                data-bs-target="#staticBackdrop"
              >
                Cancelar pedido
              </button>
              <div
                className="modal fade"
                id="staticBackdrop"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className={`modal-content ${styles.modalCancelContent}`}>
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="staticBackdropLabel">
                        ¿Deseas cancelar el pedido?
                      </h1>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className={`${styles.btnCancelOrder} ${styles.btnClose}`}
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className={`${styles.btnCancelOrder} ${styles.btnCancel}`}
                        onClick={handleCancelOrdStatus}
                        data-bs-dismiss="modal"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          <div className={styles.factura}></div>
        </div>
      </div>
    </div>
  );
}

export default MyRequestDetail;
