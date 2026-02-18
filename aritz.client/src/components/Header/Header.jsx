/// <reference path="../../context/cartcontext.jsx" />
import React from 'react';
import { NavLink } from "react-router-dom";
import styles from './Header.module.css';
import { FaHome, FaBoxOpen, FaEnvelope, FaShoppingCart, FaUser } from 'react-icons/fa';
import { CiEdit } from "react-icons/ci";
import Auth from '../Auth/Auth';
import { useSession } from '../../context/SessionContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { FaSignsPost } from "react-icons/fa6";


const Header = () => {

    const { isLoggedIn, setIsLoggedIn, userName, setUserName, userId, pageCheckout, isAdmin } = useSession();
    const { totalQuantity, fetchCountCart } = useCart();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [clase, setClase] = useState(false);

    const handleToggle = () => {
        setClase(!clase); //
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        Swal.fire("Sesion cerrada");
        navigate('/'); // Redirige al inicio
    };

    useEffect(() => {
        fetchCountCart(); // Vuelve a cargar los datos si es necesario
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('Products/by-category'); // Realiza una solicitud GET a /api/products
            setCategories(response.data); // Actualiza el estado con los datos obtenidos
            console.log('Categorias obtenidas:', response.data);
        } catch (err) {
            console.error("Error al obtener los productos", err); // Muestra el error en consola
            setError(err.message); // Guarda el mensaje de error en el estado
        }
    }

    const processedCategories = categories.map(cat => {

        const validProducts = cat.Products.filter(prod =>
            prod.PRD_QUANTITY > 0 && prod.PRD_IS_ACTIVE !== 0
        );

        return { ...cat, Products: validProducts };
    });

    const activeCategories = processedCategories.filter(
        cat => cat.Products.length > 0
    );

    // Función auxiliar para dividir el array en grupos de 3
    const chunkArray = (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };

    const categoryRows = chunkArray(activeCategories, 3);

    return (
        <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
            <div className="container d-flex">
                {/* Logo */}
                <NavLink
                    className={`navbar-brand ${styles.aritzLogo}`}
                    to="/"
                >
                    Aritz
                </NavLink>

                {/* Botón para hamburguesa en dispositivos móviles */}
                <button
                    className="navbar-toggler"
                    type="button"
                    aria-label="Toggle navigation"
                    onClick={handleToggle}
                >
                    <span className={`navbar-toggler-icon`}></span>
                </button>

                {/* Enlaces de navegación */}
                <div className={`collapse navbar-collapse d-flex ${styles.containerNavUl}`}>
                    <ul className={`navbar-nav ${styles.navUl} ${clase ? styles.active : ''}`}>
                        <li className={`${styles.navItem} d-flex`}>
                            <NavLink
                                className={({ isActive }) =>
                                    isActive ? `${styles.item} nav-link active` : `${styles.item} nav-link`
                                }
                                to="/">
                                <FaHome className={styles.iconHomeContactProduct} />
                                <p>Inicio</p>
                            </NavLink>
                        </li>
                        <li className={`${styles.navItem} d-flex`}>
                            <NavLink
                                className={({ isActive }) =>
                                    isActive ? `${styles.item} nav-link active` : `${styles.item} nav-link`
                                } to="/product">
                                <FaBoxOpen className={styles.iconHomeContactProduct} />
                                <p>Productos</p>
                            </NavLink>
                            <div className={`${styles.dropdown}`}>
                                {categoryRows.map((group, rowIndex) => (
                                    <ul
                                        key={rowIndex}
                                        className="row"
                                    >
                                        {group.map((category) => (
                                    
                                            <li key={category.CAT_ID}>
                                                <h5>
                                                    <b>{category.CAT_NAME}</b>
                                                </h5>
                                                    <ul className={`list-unstyled ${styles.ulSubCat}`}>
                                                    {category.Products.map((product) => (
                                                            <li key={product.PRD_ID}>
                                                                <NavLink
                                                                    to={`/product/product-detail/${product.PRD_ID}`}
                                                                    className={styles.dropdownItem}
                                                                >
                                                                    {product.PRD_NAME}
                                                                </NavLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                            </li>
                                        ))}
                                    </ul>
                                ))}
                            </div>
                        </li>
                        <li className={`${styles.navItem} d-flex`}>
                            <NavLink
                                className={({ isActive }) =>
                                    isActive ? `${styles.item} nav-link active` : `${styles.item} nav-link`
                                }
                                to="/contact">
                                <FaEnvelope className={styles.iconHomeContactProduct} />
                                <p>Contacto</p>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* Carrito de compras y LogIn */}
                <div className={`${styles.logAndCart} ${clase ? styles.logCartActive : ''}`}>
                    <div className={styles.logueo}>
                        {
                            isLoggedIn ? (
                                <div className={styles.userLogin}>
                                    <div className={styles.user}>
                                        <b className={`d-flex align-items-center gap-1 ${styles.userIcon}`}><FaUser />{userName}</b>
                                        <ul className={styles.userDropdown}>
                                            {
                                                isAdmin
                                                    ?
                                                <>
                                                    <NavLink
                                                        to="/admin/management"
                                                        className={styles.userNavlink}
                                                        >
                                                            <CiEdit size={20} />
                                                        Administrar
                                                        </NavLink>

                                                    <NavLink
                                                            to="/admin/management/postalCodes"
                                                        className={styles.userNavlink}
                                                        >
                                                            <FaSignsPost />
                                                        Envios
                                                    </NavLink>
                                                </>
                                                    :
                                                <>
                                                    <NavLink
                                                        to="/user/my-account"
                                                        className={styles.userNavlink}
                                                    >
                                                        Mi cuenta
                                                    </NavLink>
                                                    <NavLink
                                                        to="/user/my-requests"
                                                        className={styles.userNavlink}
                                                    >
                                                        Mis pedidos
                                                    </NavLink>
                                                </>
                                            }
                                            <button
                                                className="btn btn-danger"
                                                onClick={handleLogout}>Cerrar Sesion
                                            </button>
                                        </ul>
                                    </div>
                                    {
                                        isAdmin
                                            ?
                                        ''
                                            :
                                        <NavLink
                                            className={styles.carritoContainer}
                                            to={pageCheckout}
                                            style={{ color: "#fff" }}
                                            onClick={() => {setClase(false)} }
                                        >
                                            <FaShoppingCart className={styles.carrito} />
                                            <p className={styles.carritoContador}>{totalQuantity}</p>
                                        </NavLink>
                                    }
                                </div   >
                            ) : (
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    isActive ? `${styles.item} nav-link active` : `${styles.item} nav-link`
                                }
                            >
                            
                                        <p>LogIn / Sing In</p>
                            </NavLink>  )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Header;