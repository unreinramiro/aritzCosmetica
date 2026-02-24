import styles from '../Admin/AdminManage.module.css'
import { FaEdit } from "react-icons/fa";
import axiosInstance from '../../api/axiosConfig';
import { useState, useEffect } from "react";
import Modal from './Modal';
import ModalProducts from './ModalProducts';
import ModalCategories from './ModalCategories';
import { CiSearch, CiFilter } from "react-icons/ci";
import { LuSearchX } from "react-icons/lu";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import DelProduct from './DelProduct';
import { LuRefreshCw } from "react-icons/lu";
function AdminProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categories, setCategories] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]); // [1, 3, 5]
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredActive, setFilteredActive] = useState('all');
    const [refreshPrd, setRefreshPrd] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [refreshPrd]); 

    useEffect(() => {
        let result = [...products];

        // 1. Filtro por texto
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.PRD_NAME.toLowerCase().includes(term) ||
                p.Category.CAT_NAME.toLowerCase().includes(term)
            );
        }

        // 2. Filtro por categorías seleccionadas
        if (selectedCategories.length > 0) {
            result = result.filter(p =>
                selectedCategories.includes(p.Category.CAT_ID)
            );
        }

        // 3. Filtro por activo o no
        if (filteredActive === 'active') {
            result = result.filter(p => p.PRD_IS_ACTIVE === true);
        } else if (filteredActive === 'inactive') {
            result = result.filter(p => p.PRD_IS_ACTIVE === false);
        }

        setFilteredProducts(result);
    }, [searchTerm, selectedCategories, products, filteredActive]);

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get('products'); // Realiza una solicitud GET a /api/products
            setProducts(response.data); // Actualiza el estado con los datos obtenidos
            console.log(products);
            setLoading(false); // Indica que ya terminó la carga
        } catch (err) {
            console.error("Error al obtener los productos", err); // Muestra el error en consola
            setError(err.message); // Guarda el mensaje de error en el estado
            setLoading(false); // Indica que ya terminó la carga, incluso si hubo error
        }
    };

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

    // Función para agrupar en bloques de 3
    const groupCategories = (items, size = 3) => {
        const groups = [];
        for (let i = 0; i < items.length; i += size) {
            groups.push(items.slice(i, i + size));
        }
        return groups;
    };

    const categoryGroups = groupCategories(categories);

    // Funcion para filtros en los checkboxes
    const handleCategoryChange = (catId) => {
        setSelectedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };


    return (
        <>

            <div className={styles.containerAllFilters}>
            <div className={styles.filtrosContainer}>
                <div className="input-group flex-nowrap">
                    <span className="input-group-text" id="addon-wrapping"><CiSearch /></span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar..."
                        aria-label="Username"
                        aria-describedby="addon-wrapping"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    data-bs-toggle="modal"
                    data-bs-target="#staticBackdropProducts"
                    className={styles.addPrdBtn}
                >
                    <IoMdAdd
                        size={20}
                    />
                    Agregar Producto
                </button>
                <button
                    data-bs-toggle="modal"
                    data-bs-target="#staticBackdropCategories"
                    className={styles.addPrdBtn}
                >
                    Categorias
                </button>

                <div
                    className={styles.filter}
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseExample"
                    aria-expanded="false"
                    aria-controls="collapseExample"
                >
                    <CiFilter
                        className={styles.filterIcon}
                    />
                    <h5>Filtros:</h5>
                </div>

                </div>
            <div>
                <div className="collapse" id="collapseExample">
                    <h6 style={{ textAlign: "start" }}>Otros</h6>
                    <div className={styles.filterGroup2} id="collapseExample">
                        <ul className={styles.containerFilterItem}>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                        checked={filteredActive === 'all'}
                                        onChange={() => setFilteredActive('all')}
                                    />
                                    Todos
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                        checked={filteredActive === 'active'}
                                        onChange={() => setFilteredActive('active')}
                                    />
                                    Activo
                                </label>
                            </li>
                            <li className={styles.filterItem}>
                                <label>
                                    <input
                                        type="radio"
                                        name="filteredActive"
                                        checked={filteredActive === 'inactive'}
                                        onChange={() => setFilteredActive('inactive')}
                                    />
                                    Inactivo
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="collapse" id="collapseExample">
                    <h6 style={{ textAlign: "start" }}>Categorias</h6>
                    <div className={styles.filterGroup}>
                        {categoryGroups.map((group, groupIndex) => (
                            <ul key={`group-${groupIndex}`}>
                                {group.map((category) => (
                                    <li
                                        className={styles.filterItem}
                                        key={category.CAT_ID}
                                    >
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.CAT_ID)}
                                                onChange={() => handleCategoryChange(category.CAT_ID)}
                                            />
                                            {category.CAT_NAME}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        ))}
                         </div>
                    </div>
                </div>
            </div>
            <div className={styles.containerTableOrders}>
            {filteredProducts.length <= 0
                ?
                <div className={styles.containerLupita}>
                    <h1>No se encontraron coincidencias...</h1>
                        <LuSearchX className={styles.lupita} />
                </div>
                :
                
                    <table className={styles.productsUserTable}>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Categoria</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Activo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((producto) => (
                        <tr
                            key={producto.PRD_ID}
                            className={styles.filaOrdenDetail}
                        >
                            <td data-label="ID Product">
                                {producto.PRD_ID}
                            </td>
                            <td data-label="Categoria">
                                {producto.Category.CAT_NAME}
                            </td>
                            <td data-label="Producto">
                                {producto.PRD_NAME}
                            </td>
                            <td data-label="Precio">
                                $ {producto.PRD_PRICE}
                            </td>
                            <td data-label="En stock">
                                {producto.PRD_QUANTITY}
                            </td>
                            <td data-label="Estado">
                                {producto.PRD_IS_ACTIVE ? 'Si' : 'No'}
                            </td>
                            <td data-label="Editar">
                                <FaEdit
                                    size={20}
                                    style={{ cursor: "pointer" }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#staticBackdrop"
                                    onClick={() => setSelectedProduct(producto)}
                                />
                            </td>
                            <td data-label="Borrar">
                                <MdDeleteForever
                                        className={styles.delIcon}
                                        size={25}
                                        style={{ cursor: "pointer" }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#staticBackdropDeleteModal"
                                        onClick={() => setSelectedProduct(producto)}
                                />
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                }
                </div>
            
            <Modal
                productCategory={selectedProduct?.Category.CAT_NAME}
                productName={selectedProduct?.PRD_NAME}
                productImg={selectedProduct?.PRD_IMAGE}
                productPrice={selectedProduct?.PRD_PRICE}
                productQuantity={selectedProduct?.PRD_QUANTITY}
                productDescription={selectedProduct?.PRD_DESCRIPTION}
                productStatus={selectedProduct?.PRD_IS_ACTIVE}
                productId={selectedProduct?.PRD_ID}
                refresh={setRefreshPrd}
                productsGallery={selectedProduct?.Gallery || []}
            />

            <ModalProducts
                refresh={setRefreshPrd}
            />

            <ModalCategories />

            <DelProduct
                prdDelId={selectedProduct?.PRD_ID}
                prdDelName={selectedProduct?.PRD_NAME}
                prdCatName={selectedProduct?.Category.CAT_NAME}
                prdDelImg={selectedProduct?.PRD_IMAGE}
                refresh={setRefreshPrd}
            />
        </>
    )
}

export default AdminProducts;