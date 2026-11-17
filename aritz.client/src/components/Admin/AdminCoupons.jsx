import React, { useState, useEffect } from "react";
import styles from "./AdminCoupons.module.css";
import axiosInstance from "../../api/axiosConfig";
import { FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { formatDate } from "../../utils/utils";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [editCouponId, setEditCouponId] = useState(null);
  const [editCouponData, setEditCouponData] = useState({
    DisCode: "",
    DisName: "",
    DisType: "",
    DisDiscount: 0,
    DisMinAmount: 0,
    DisStartDate: "",
    DisEndDate: "",
    DisMaxUses: 0,
    DisUsedCount: 0,
    DisIsActive: 1,
  });
  const [activeAddCoupon, setActiveAddCoupon] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get("discount/getAllCoupons");
      setCoupons(response.data);
      console.log(response.data);
    } catch (error) {
      console.log("Error al obtener los cupones", error);
    }
  };

  const handleEditClick = (event, cou) => {
    event.preventDefault();
    setEditCouponId(cou.DIS_ID);

    const formValues = {
      DisCode: cou.DIS_CODE,
      DisName: cou.DIS_NAME,
      DisType: cou.DIS_TYPE,
      DisDiscount: cou.DIS_DISCOUNT,
      DisMinAmount: cou.DIS_MIN_AMOUNT,
      DisStartDate: cou.DIS_START_DATE ? cou.DIS_START_DATE.slice(0, 10) : "",
      DisEndDate: cou.DIS_END_DATE ? cou.DIS_END_DATE.slice(0, 10) : "",
      DisMaxUses: cou.DIS_MAX_USES,
      DisUsedCount: cou.DIS_USED_COUNT,
      DisIsActive: cou.DIS_IS_ACTIVE ? 1 : 0,
    };
    setEditCouponData(formValues);
  };

  const handleEditFormChange = (event) => {
    event.preventDefault();
    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;

    const newFormData = { ...editCouponData };
    newFormData[fieldName] = fieldValue;

    setEditCouponData(newFormData);
  };

  const handleSaveClick = async (insertUpdate) => {
    try {
      await axiosInstance.post(`discount/${insertUpdate}`, {
        Id: editCouponId,
        Code: editCouponData.DisCode,
        Name: editCouponData.DisName,
        Type: editCouponData.DisType,
        Discount: Number(editCouponData.DisDiscount),
        MinAmount: Number(editCouponData.DisMinAmount),
        StartDate: editCouponData.DisStartDate || null,
        EndDate: editCouponData.DisEndDate || null,
        MaxUses: Number(editCouponData.DisMaxUses) || null,
        UsesCount: Number(editCouponData.DisUsedCount),
        IsActive: Number(editCouponData.DisIsActive) === 1,
      });
      fetchCoupons();
      setEditCouponId(null);
      setActiveAddCoupon(false);
    } catch (error) {
      console.error("Error al guardar", error);
    }
  };

  const handleDelCoupon = async (id) => {
    console.log("delete", id);
  };

  const handleCancelClick = () => {
    setEditCouponId(null);
  };

  return (
    <div className={styles.containerCoupon}>
      <h1>Cupones</h1>
      <div className={styles.subContainerCoupon}>
        <div>
          <table className={styles.CouponTable}>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Descuento</th>
                <th>Monto minimo</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Maximo usos</th>
                <th>Cant usada</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((cou) =>
                editCouponId === cou.DIS_ID ? (
                  <tr key={cou.DIS_ID} className={styles.filaCoupon}>
                    <td data-label="Codigo">
                      <input
                        type="Text"
                        name="DisCode"
                        className="form-control"
                        value={editCouponData.DisCode}
                        onChange={handleEditFormChange}
                      />
                    </td>
                    <td data-label="Nombre">
                      <input
                        type="Text"
                        name="DisName"
                        value={editCouponData.DisName}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </td>
                    <td data-label="Tipo">
                      <input
                        type="Text"
                        name="DisType"
                        value={editCouponData.DisType}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </td>
                    <td data-label="Descuento">
                      <input
                        type="Number"
                        name="DisDiscount"
                        value={editCouponData.DisDiscount}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </td>
                    <td data-label="Monto minimo">
                      <input
                        type="Number"
                        name="DisMinAmount"
                        value={editCouponData.DisMinAmount}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </td>
                    <td data-label="Inicio">
                      <input
                        type="Date"
                        name="DisStartDate"
                        value={editCouponData.DisStartDate}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </td>
                    <td data-label="Fin">
                      <input
                        type="Date"
                        name="DisEndDate"
                        value={editCouponData.DisEndDate}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </td>
                    <td data-label="Maximo usos">
                      <input
                        type="Number"
                        name="DisMaxUses"
                        value={editCouponData.DisMaxUses}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </td>
                    <td data-label="Cant usada">
                      <input
                        type="Number"
                        name="DisUsedCount"
                        value={editCouponData.DisUsedCount}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </td>
                    <td data-label="Activo">
                      <select
                        name="DisIsActive"
                        value={editCouponData.DisIsActive}
                        onChange={handleEditFormChange}
                      >
                        <option value={1}>Si</option>
                        <option value={0}>No</option>
                      </select>
                    </td>
                    <td
                      data-label="Guardar/Cancelar"
                      className="d-flex justify-content-center align-center gap-1"
                    >
                      <FaCheck
                        size={20}
                        color="green"
                        style={{ cursor: "pointer" }}
                        title="Guardar"
                        onClick={() => handleSaveClick("updDiscount")}
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
                ) : (
                  <tr key={cou.DIS_ID} className={styles.filaCoupon}>
                    <td data-label="Codigo">{cou.DIS_CODE}</td>
                    <td data-label="Nombre">{cou.DIS_NAME}</td>
                    <td data-label="Tipo">{cou.DIS_TYPE}</td>
                    <td data-label="Descuento">${cou.DIS_DISCOUNT}</td>
                    <td data-label="Monto minimo">${cou.DIS_MIN_AMOUNT}</td>
                    <td data-label="Inicio">
                      {formatDate(cou.DIS_START_DATE)}
                    </td>
                    <td data-label="Fin">{formatDate(cou.DIS_END_DATE)}</td>
                    <td data-label="Maximo usos">{cou.DIS_MAX_USES}</td>
                    <td data-label="Cant usada">{cou.DIS_USED_COUNT}</td>
                    <td data-label="Activo">
                      {cou.DIS_IS_ACTIVE ? "Si" : "No"}
                    </td>
                    <td data-label="Editar/Borrar">
                      <FaEdit
                        size={20}
                        style={{ cursor: "pointer" }}
                        onClick={(event) => {
                          handleEditClick(event, cou);
                        }}
                      />
                      <MdDeleteForever
                        className={styles.delIcon}
                        size={25}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelCoupon(cou.DIS_ID)}
                      />
                    </td>
                  </tr>
                ),
              )}
              {activeAddCoupon ? (
                <tr className={styles.filaCoupon}>
                  <td data-label="Codigo">
                    <input
                      type="Text"
                      name="DisCode"
                      className="form-control"
                      placeholder="Codigo"
                      value={editCouponData.DisCode}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Nombre">
                    <input
                      type="Text"
                      name="DisName"
                      className="form-control"
                      placeholder="Nombre"
                      value={editCouponData.DisName}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Tipo">
                    <input
                      type="Text"
                      name="DisType"
                      className="form-control"
                      placeholder="Tipo"
                      value={editCouponData.DisType}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Descuento">
                    <input
                      type="Number"
                      name="DisDiscount"
                      className="form-control"
                      placeholder="Descuento"
                      value={editCouponData.DisDiscount}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Monto minimo">
                    <input
                      type="Number"
                      name="DisMinAmount"
                      className="form-control"
                      placeholder="Monto minimo"
                      value={editCouponData.DisMinAmount}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Inicio">
                    <input
                      type="Date"
                      name="DisStartDate"
                      className="form-control"
                      value={editCouponData.DisStartDate}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Fin">
                    <input
                      type="Date"
                      name="DisEndDate"
                      className="form-control"
                      value={editCouponData.DisEndDate}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Maximo usos">
                    <input
                      type="Number"
                      name="DisMaxUses"
                      className="form-control"
                      placeholder="Maximo usos"
                      value={editCouponData.DisMaxUses}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Cant usada">
                    <input
                      type="Number"
                      name="DisUsedCount"
                      className="form-control"
                      placeholder="Cant usada"
                      value={editCouponData.DisUsedCount}
                      onChange={handleEditFormChange}
                    />
                  </td>
                  <td data-label="Activo">
                    <select
                      name="DisIsActive"
                      value={editCouponData.DisIsActive}
                      onChange={handleEditFormChange}
                    >
                      <option value={1}>Si</option>
                      <option value={0}>No</option>
                    </select>
                  </td>
                  <td
                    data-label="Guardar/Cancelar"
                    className="d-flex justify-content-center align-center gap-1"
                  >
                    <FaCheck
                      size={20}
                      color="green"
                      style={{ cursor: "pointer" }}
                      title="Guardar"
                      onClick={() => handleSaveClick("addDiscount")}
                    />
                    <FaTimes
                      size={20}
                      color="red"
                      style={{ cursor: "pointer" }}
                      onClick={() => setActiveAddCoupon(false)}
                      title="Cancelar"
                    />
                  </td>
                </tr>
              ) : (
                <tr
                  onClick={() => {
                    setActiveAddCoupon(true);

                    setEditCouponData({
                      DisCode: "",
                      DisName: "",
                      DisType: "",
                      DisDiscount: 0,
                      DisMinAmount: 0,
                      DisStartDate: "",
                      DisEndDate: "",
                      DisMaxUses: 0,
                      DisUsedCount: 0,
                      DisIsActive: 1,
                    });

                    setEditCouponId(0);
                  }}
                >
                  <td className={styles.addCoupon} colSpan={11}>
                    <IoMdAddCircle size={30} />
                    Agregar un cupon
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
