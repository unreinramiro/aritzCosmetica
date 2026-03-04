import { useParams } from 'react-router-dom';
import CenteredContainer from '../../components/CenteredContainer/CenteredContainer';
import styles from "./ProductDetail.module.css";
import sinImg from "../../assets/images/sinImagen.png"
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { useSession } from "../../context/SessionContext";
import { useCart } from '../../context/CartContext';
import BreadCrum from '../../components/BreadCrum/BreadCrum';
import { formatPrice } from '../../utils/utils';
import { useNavigate } from "react-router-dom";

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState();
    const [loading, setLoading] = useState(true);
    const [loadingProductId, setLoadingProductId] = useState(null);
    const [error, setError] = useState(null);
    const { userId } = useSession();
    const { fetchCountCart } = useCart();
    const navigate = useNavigate();

    //Estados para el intercambio de imagenes
    const [displayImage, setDisplayImage] = useState(''); // La imagen grande actual
    const [displayGallery, setDisplayGallery] = useState([]); // El array de imagenes pequeñas actual

    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchProduct();
    }, [id]); // El uso de un array vacío asegura que solo se ejecute al montar el componente

    useEffect(() => {
        fetchCart();
    }, [])

    const fetchProduct = async () => {
        try {
            const response = await axiosInstance.get(`products/${id}`);
            setProduct(response.data); //

            //Inicializacion de estados de las imagenes para su swap
            setDisplayImage(response.data.PRD_IMAGE);
            setDisplayGallery(response.data.Gallery);

            setLoading(false); // 
        } catch (err) {
            console.error("Error al obtener los productos", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        try {
            const response = await axiosInstance.get(`Cart/user/${userId}`);
            setCart(response.data); // 
        } catch (err) {
            console.error("Error al obtener los productos", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId, quantity = 1) => {
        try {
            if (userId == null) {
                Swal.fire({
                    title: 'Debe iniciar sesion para agregar productos al carrito',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/login');
                    }
                });
                return;
            }

            setLoadingProductId(productId);

            const response = await axiosInstance.post("Cart/add-to-cart", {
                userId,
                productId,
                quantity,
            });

            console.log(response.data); // Muestra el mensaje del backend
            Swal.fire({
                title: 'Producto agregado correctamente!',
                icon: 'success',
                confirmButtonText: 'Seguir comprando'
            })
            fetchCountCart();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Aquí atrapamos el "Stock insuficiente" que envía tu C#
                Swal.fire({
                    title: 'Sin Stock',
                    // error.response.data suele contener el string "Stock insuficiente..." que mandaste desde C#
                    text: error.response.data || 'No hay suficiente stock disponible.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido'
                });
            }
        } finally {
            setLoadingProductId(null);
        }
    };

    // FUNCION PARA INTERCAMBIAR IMAGENES
    const handleImageSwap = (clickedImgUrl, index) => {
        // 1. Guardamos la imagen que ACTUALMENTE es la principal (antes de cambiarla)
        const oldMainImage = displayImage;

        // 2. Actualizamos la principal con la que clickeamos
        setDisplayImage(clickedImgUrl);

        // 3. Actualizamos la galería:
        // Creamos una copia del array para no mutar el estado directamente
        const newGallery = [...displayGallery];

        // En la posición donde hicimos click, ponemos la imagen vieja (oldMainImage)
        // Mantenemos las otras propiedades del objeto (como IDs) y solo cambiamos la URL
        newGallery[index] = { ...newGallery[index], IMG_URL: oldMainImage };

        setDisplayGallery(newGallery);
    };

    if (loading) return <div>Cargando producto...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        
        <div className={styles.centeredContainer}>
            <BreadCrum name={product.PRD_NAME} />
            <div className={styles.container}>
                <div className={styles.imgContainer}>
                <h3 className={styles.responsiveTitle}>{product.Category.CAT_NAME} {product.PRD_NAME}</h3>
                    <img
                        className={styles.imgMain}
                        src={`${import.meta.env.VITE_API_URL}/images/${displayImage}`}
                        key={displayImage}
                    />
                    {displayGallery.length > 0 
                        ?
                        <div className={styles.subImgContainer}>
                            {displayGallery.map((img, index) => (

                                <img
                                    src={`${import.meta.env.VITE_API_URL}/images/${img.IMG_URL}`}
                                    key={index}
                                    onClick={() => handleImageSwap(img.IMG_URL, index)}
                                />

                            ))}
                        </div>
                        :
                        <div className={styles.subImgContainer}>
                            <img src={sinImg} />
                            <img src={sinImg} />
                            <img src={sinImg} />
                            <img src={sinImg} />
                        </div>
                    }
                </div>
                <div className={styles.infoContainer}>
                    <h3 className={styles.titleInfo}>{product.Category.CAT_NAME} {product.PRD_NAME}</h3>
                    <b className={styles.priceInfo}>${formatPrice(product.PRD_PRICE)}</b>
                    <p>Stock: {product.PRD_QUANTITY}</p>
                    <p className={styles.descInfo}>{product.PRD_DESCRIPTION}</p>
                    <button
                        className={styles.addCartInfo}
                        onClick={() => { handleAddToCart(product.PRD_ID) }}
                    >
                        {loadingProductId === product.PRD_ID ? (
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        )
                            :
                            'Agregar al carrito'
                        }
                    </button>
                </div>
                
            </div>
            </div>
  );
}

export default ProductDetail;