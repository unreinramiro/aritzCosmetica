import React, { createContext, useState, useContext, useEffect } from "react";

// Crear el contexto
const CheckoutContext = createContext();

const loadNumber = (key, fallback) => {
  try {
    const v = sessionStorage.getItem(key);
    return v !== null ? Number(v) : fallback;
  } catch {
    return fallback;
  }
};

export const CheckoutProvider = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    cellphone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState(() =>
    loadNumber("checkout_paymentMethod", 1),
  );
  const [zipPrice, setZipPrice] = useState(() =>
    loadNumber("checkout_zipPrice", 0),
  );

  useEffect(() => {
    sessionStorage.setItem("checkout_paymentMethod", String(paymentMethod));
  }, [paymentMethod]);

  useEffect(() => {
    sessionStorage.setItem("checkout_zipPrice", String(zipPrice));
  }, [zipPrice]);

  return (
    <CheckoutContext.Provider
      value={{
        customerInfo,
        setCustomerInfo,
        paymentMethod,
        setPaymentMethod,
        zipPrice,
        setZipPrice,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => useContext(CheckoutContext);
