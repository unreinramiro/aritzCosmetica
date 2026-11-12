import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { useSession } from "./SessionContext";

const CartContext = createContext();

// Proveedor del carrito
export const CartProvider = ({ children }) => {
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [error, setError] = useState(null); // Para errores
  const [totalSumCart, setTotalSumCart] = useState(0);
  const { userId } = useSession();
  //Contador del carrito

  const fetchCountCart = async () => {
    try {
      if (userId != null) {
        const response = await axiosInstance.get(
          `Cart/user/${userId}/total-quantity`,
        );
        setTotalQuantity(response.data); // Actualiza la cantidad total en el estado
      }
      return console.log("No se inicio sesion");
    } catch (err) {
      console.error("Error al obtener la cantidad total:", err);
      setError("No se pudo calcular la cantidad total de productos.");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCountCart();
      fetchSumTotalCart();
    }
  }, [userId]);

  // Funci�n para actualizar el contador en el frontend
  // �til cuando se agrega o elimina un producto localmente
  const updateTotalQuantity = (quantity) => {
    setTotalQuantity(quantity); // Actualiza directamente el valor si cambia
  };

  const fetchSumTotalCart = async () => {
    try {
      if (userId != null && totalQuantity != 0) {
        const response = await axiosInstance.get(
          `Cart/user/${userId}/total-cart`,
        );
        setTotalSumCart(response.data);
      }
    } catch (err) {
      console.error("Error al obtener la suma total:", err);
      setError("No se pudo calcular la suma total de productos en el carrito.");
    }
  };

  // Seccion cupon de descuento
  const [couponCode, setCouponCode] = useState(
    () => sessionStorage.getItem("couponCode") || "",
  );

  const [couponInfo, setCouponInfo] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("couponInfo")) || null;
    } catch {
      return null;
    }
  });

  const saveCoupon = (info) => {
    if (info) {
      setCouponCode(info.code);
      setCouponInfo(info);
      sessionStorage.setItem("couponCode", info.code);
      sessionStorage.setItem("couponInfo", JSON.stringify(info));
    } else {
      clearCoupon();
    }
  };

  const clearCoupon = () => {
    setCouponCode("");
    setCouponInfo(null);
    sessionStorage.removeItem("couponCode");
    sessionStorage.removeItem("couponInfo");
  };

  return (
    <CartContext.Provider
      value={{
        fetchCountCart,
        updateTotalQuantity,
        totalQuantity,
        fetchSumTotalCart,
        totalSumCart,
        couponCode,
        saveCoupon,
        clearCoupon,
        couponInfo
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado
export const useCart = () => {
  return useContext(CartContext);
};
