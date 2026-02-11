import CenteredContainer from "../../components/CenteredContainer/CenteredContainer";
import styles from './Products.module.css'
import { FaFilter } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { useSession } from "../../context/SessionContext";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import BreadCrum from "../../components/BreadCrum/BreadCrum";
import { CiSearch, CiFilter } from "react-icons/ci";
import Filters from "./Filters/Filters";
import { LuSearchX } from "react-icons/lu";
import { formatPrice } from '../../utils/utils';

function Products() {
    
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const { userId } = useSession();
    const [loading, setLoading] = useState(true); // Estado para controlar el spinner o carga
    const [error, setError] = useState(null); // Estado para gestionar errores
    const { fetchCountCart } = useCart();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // ESTADOS PARA LOS FILTROS
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCats, setFilterCats] = useState([]); // Array de IDs de categorías
    const [filterPrice, setFilterPrice] = useState(''); // 'biggest' o 'smallest'
    const [filteredAz, setFilteredAz] = useState('az'); // Arranca de la A a la Z

    // Estado para el scroll y mostrar solo 8 productos
    const [visibleCount, setVisibleCount] = useState(8);

    useEffect(() => {
        const handleScroll = () => {
            // Verificamos si el usuario llegó al final de la página (con un margen de 100px)
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                // Cargamos 8 más solo si hay más productos para mostrar
                setVisibleCount((prevCount) => prevCount + 8);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Limpiamos el evento cuando el componente se desmonta
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        let result = [...products];

        result = result.filter(p => !(p.PRD_QUANTITY <= 0 || p.PRD_IS_ACTIVE == 0));

        // 1. Filtro por texto
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.PRD_NAME.toLowerCase().includes(term) ||
                p.Category.CAT_NAME.toLowerCase().includes(term)
            );
        }

        if (filterCats.length > 0) {
            result = result.filter(p => filterCats.includes(p.Category.CAT_ID));
            // Asegúrate que en tu objeto producto la propiedad sea PRD_CAT_ID o p.Category.CAT_ID
        }

        //3. Filtro alfabeticamente
        if (filteredAz === 'az') {
            result.sort((a, b) => a.PRD_NAME.localeCompare(b.PRD_NAME));
        } else if (filteredAz === 'za') {
            result.sort((a, b) => b.PRD_NAME.localeCompare(a.PRD_NAME));
        }

        // 4. ORDENAMIENTO POR PRECIO (Lógica nueva)
        if (filterPrice === 'biggest') {
            result.sort((a, b) => b.PRD_PRICE - a.PRD_PRICE); // Mayor a menor
        } else if (filterPrice === 'smallest') {
            result.sort((a, b) => a.PRD_PRICE - b.PRD_PRICE); // Menor a mayor
        }

        setFilteredProducts(result);

        setVisibleCount(8);

    }, [searchTerm, products, filterCats, filterPrice, filteredAz]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get('products'); // Realiza una solicitud GET a /api/products
                setProducts(response.data); // Actualiza el estado con los datos obtenidos
                console.log('Productos obtenidos:', response.data);
                setLoading(false); // Indica que ya terminó la carga
            } catch (err) {
                console.error("Error al obtener los productos", err); // Muestra el error en consola
                setError(err.message); // Guarda el mensaje de error en el estado
                setLoading(false); // Indica que ya terminó la carga, incluso si hubo error
            }
        };

        fetchProducts();
    }, []); // El uso de un array vacío asegura que solo se ejecute al montar el componente

    if (loading) return <div>Cargando productos...</div>;
    if (error) return <div>Error: {error}</div>;


    const handleAddToCart = async (productId, quantity = 1) => {
        try {
            if (userId == null) {
                Swal.fire({
                    title: 'Debe iniciar sesion para agregar productos al carrito',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
                return;
            }

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
        }
    };

    const next = (id) => {
        navigate(`/product/product-detail/${id}`);
    }

    // 2. Función que recibirá el dato desde Filters.jsx
    const handleFilterChange = (valorDelHijo) => {
        console.log("Dato recibido del hijo:", valorDelHijo);
        setFiltroSeleccionado(valorDelHijo);
    }

    return (
        <>
            <CenteredContainer>
                <BreadCrum />
                {   products.length == 0 ? <h2>No se encontraron productos</h2> :
                    <div>
                        <h1 className={styles.title}>Nuestros productos</h1>
                        <p style={{ color: "#777" }}>Elegi los mejores productos al mejor precio.</p>
                    </div>
                }

            </CenteredContainer>
        <div className="d-flex justify-content-center">
            <div className={styles.productsPage}>
                {/* Aside para los filtros */}
                <aside className={styles.filters}>
                    <h3 className={styles.filtersTitle}>FILTROS <FaFilter /></h3>
                    <ul className={styles.filterList}>
                            <Filters
                                setCategoriesFilter={setFilterCats}
                                setPriceFilter={setFilterPrice}
                                setAzFilter={setFilteredAz}
                            />
                    </ul>
                </aside>

                <div className="container d-flex flex-column gap-4 justify-content-start">
                    <div className="input-group flex-nowrap" >
                        <span className="input-group-text" id="addon-wrapping"><CiSearch /></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar..."
                            aria-label="Username"
                            aria-describedby="addon-wrapping"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="container">
                        <div 
                            className="row g-3"
                            //style={{ maxHeight: '600px' }}
                            >
                                {filteredProducts.length <= 0
                                    ?
                                    <div className={`d-flex flex-column align-items-center ${styles.containerLupita}`}>
                                        <h3 className="text-center">No se encontraron coincidencias...</h3>
                                        <LuSearchX
                                            className={styles.lupita}
                                        />
                                    </div>
                                    :


                                    filteredProducts.slice(0, visibleCount).map((producto, index) => (
                                <div
                                    key={producto.PRD_ID}
                                    className={`col-12 col-sm-6 col-lg-3 ${styles.cardAnimate}`}
                                    style={{ animationDelay: `${(index % 8) * 0.1}s` }}
                                >
                                    <div className={`card h-100 ${styles.carta}`}>
                                        <div className={styles.cartaImgContainer}>
                                            <img 
                                                src={`https://localhost:7273/images/${producto.PRD_IMAGE}`}
                                                className="card-img-top"
                                                alt={producto.PRD_NAME}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className={`card-body ${styles.cuerpoCarta}`}>
                                            <h5 
                                                onClick={() => next(producto.PRD_ID)}
                                                className={`card-title ${styles.productTitle}`}>
                                                {producto.Category.CAT_NAME} {producto.PRD_NAME}
                                                </h5>
                                                <p className="card-text">${formatPrice(producto.PRD_PRICE)}</p>
                                        </div>
                                            <button onClick={() => { handleAddToCart(producto.PRD_ID) }} className={styles.cartaAddCart}>Agregar al carrito</button>
                                    </div>
                                </div>
                                ))}
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
  );
}

export default Products;