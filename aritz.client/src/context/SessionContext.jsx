import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { FaBoxOpen } from 'react-icons/fa';

// Crea el contexto inicial
const SessionContext = createContext();

// Este será tu componente proveedor para envolver toda la app
export const SessionProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingLogin, setIsLoadingLogin] = useState(false);// Loading para el login
    const [isLoadingRegis, setIsLoadingRegis] = useState(false);// Loading para el registro
    const [isLoadingVerif, setIsLoadingVerif] = useState(false);// Loading para la verificacion

    const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado de autenticación
    const [screenLogIn, setScreenLogIn] = useState(true);
    const [isRegister, setIsRegister] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: '', // Nuevo campo para confirmación
        phoneNumber: '',
        address: ''
    });
    const [code, setCode] = useState('');
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const [pageCheckout, setPageCheckout] = useState('/cart');
    const [isAdmin, setIsAdmin] = useState(() => {
        const saved = localStorage.getItem('isAdmin');
        return saved === 'true'; // Convierte string → boolean
    });
    const [personal, setPersonal] = useState(false);
    const [AdmUsrPrd, setAdmUsrPrd] = useState('Productos');

    useEffect(() => {

        const token = localStorage.getItem('authToken');
        const storedUserName = localStorage.getItem('userName');
        const storedUserId = localStorage.getItem('userId');
        const storedIsAdmin = localStorage.getItem('isAdmin');

        if (token && storedUserName) {
            setIsLoggedIn(true);
            setUserName(storedUserName);
            setUserId(parseInt(storedUserId));

            if (storedIsAdmin === 'true') setIsAdmin(true);
        } else {
            setIsLoggedIn(false);
            setIsAdmin(false);
        }

        setIsLoading(false);

    }, []);

    useEffect(() => {
        // Cada vez que isAdmin cambie, actualiza localStorage
        localStorage.setItem('isAdmin', isAdmin.toString());
    }, [isAdmin]);

    // Exp regular para el mail
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

    // Exp regular para la clave
    const hasUppercase = /[A-Z]/;
    const hasLowercase = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const minLength = 8;

    // Estado para la barra de fuerza
    const [passwordStrength, setPasswordStrength] = useState(0); // Width de la barra
    const [strengthColor, setStrengthColor] = useState(''); // Color de la barra
    const [strengthMessage, setStrengthMessage] = useState(''); // Mensaje



    // Funcion para cambiar pantalla de logueo
    const screenIn = () => {
        setScreenLogIn(true);
    };

    // Funcion para cambiar pantalla de registro
    const screenOut = () => {
        setScreenLogIn(false);
    };

    const updateStrengthMeter = (level) => {
        let colorClass;
        let message;

        switch (level) {
            case 0:
                colorClass = '';
                message = ''
                break;
            case 1:
                colorClass = 'red';
                message = 'Muy debil'
                break;
            case 2: 
                colorClass = 'orange';
                message = 'Debil'
                break;
            case 3: 
                colorClass = 'yellow';
                message = 'Aceptable'
                break;
            case 4: 
                colorClass = 'lime';
                message = 'Fuerte'
                break;
            case 5: 
                colorClass = 'green';
                message = '¡Muy fuerte!'
                break;
        }
        setPasswordStrength(`${(level / 5) * 100}%`); // porcentaje
        setStrengthColor(colorClass);
        setStrengthMessage(message);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if(name === 'password') {
            let strength = 0;
            const password = value;

            if (password.length >= minLength) strength++;
            if (hasUppercase.test(password)) strength++;
            if (hasLowercase.test(password)) strength++;
            if (hasNumber.test(password)) strength++;
            if (hasSymbol.test(password)) strength++;

            updateStrengthMeter(strength);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoadingRegis(true);
        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Las contrasenias no coinciden"
            });
            return;
        }
        if (!emailRegex.test(formData.email)) {
            Swal.fire({
                icon: "error",
                title: "Ingrese un mail valido"
            });
            return;
        }
        try {
            await axiosInstance.post('auth/register', {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                address: formData.address
            });
            setEmail(formData.email);
            setIsVerifying(true);
            Swal.fire({
                title: "Se envio el codigo de verificacion, por favor, revisa tu casilla de mail",
                icon: "info",
                showClass: {
                    popup: `
                  animate__animated
                  animate__fadeInUp
                  animate__faster
                `
                },
                hideClass: {
                    popup: `
                  animate__animated
                  animate__fadeOutDown
                  animate__faster
                `
                }
            });
        } catch (error) {
            alert(error.response?.data?.Message || 'Error en registro');
        } finally {
            setIsLoadingRegis(false);
        }
    };



    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoadingVerif(true);
        try {
            await axiosInstance.post('auth/verify', { email, code });
            setIsVerifying(false);
            setIsRegister(false);
            screenIn();
            Swal.fire({
                title: "Cuenta verificada. Ahora puedes loguearte.",
                icon: "success",
                draggable: true
            });
        } catch (error) {
            alert(error.response?.data?.Message || 'Código inválido');
        } finally {
            setIsLoadingVerif(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoadingLogin(true);
        try {
            const response = await axiosInstance.post('auth/login', {
                email: formData.email,
                password: formData.password
            });
            // Almacenar token y nombre del usuario
            localStorage.setItem('authToken', response.data.Token);
            localStorage.setItem('userName', response.data.UserName);
            localStorage.setItem('userId', response.data.UserId.toString());
            localStorage.setItem('isAdmin', response.data.UserIsAdmin.toString());

            setIsLoggedIn(true);
            setUserName(response.data.UserName);
            setUserId(parseInt(response.data.UserId));
            setIsAdmin(response.data.UserIsAdmin);

            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Iniciaste sesion",
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/');
        } catch (error) {
            console.error('Error en login:', error.response);
            Swal.fire({
                icon: "error",
                title: "Error al iniciar sesion",
                text: "Credenciales invalidas",
            });
        } finally {
            setIsLoadingLogin(false);
        }
    };


    // Valor que proporciona el contexto
    const value = {
        isLoading,
        isLoadingLogin,
        isLoadingRegis,
        isLoadingVerif,
        isLoggedIn,
        setIsLoggedIn,
        screenLogIn,
        screenIn,
        screenOut,
        handleChange,
        handleRegister,
        handleVerify,
        handleLogin,
        isRegister,
        isVerifying,
        code,
        setCode,
        formData,
        setIsRegister,
        userName,
        userId,
        setUserId,
        pageCheckout,
        setPageCheckout,
        strengthColor,
        passwordStrength,
        strengthMessage,
        isAdmin,
        setUserName,
        AdmUsrPrd,
        setAdmUsrPrd
    };

    return (
        <SessionContext.Provider value={value}>
            {children} {/* Componente hijo envuelto (toda la app) */}
        </SessionContext.Provider>
    );
};

// Custom Hook para usar el contexto más fácilmente
export const useSession = () => {
    return useContext(SessionContext);
};