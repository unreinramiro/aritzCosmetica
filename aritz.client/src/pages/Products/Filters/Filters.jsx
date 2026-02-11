import styles from '../Products.module.css'
import axiosInstance from "../../../api/axiosConfig";
import { useState, useEffect } from 'react';
function Filters({ setCategoriesFilter, setPriceFilter, setAzFilter }) {

    const [categories, setCategories] = useState([]);
    const [filteredPrice, setFilteredPrice] = useState('all');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [alfabeticFilter, setAlfabeticFilter] = useState('');

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('Products/by-category'); // Realiza una solicitud GET a /api/products
            setCategories(response.data); // Actualiza el estado con los datos obtenidos
        } catch (err) {
            console.error("Error al obtener los productos", err); // Muestra el error en consola
            setError(err.message); // Guarda el mensaje de error en el estado
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryChange = (catId) => {
        // 1. Calculamos el nuevo array de categorías seleccionadas
        const newSelection = selectedCategories.includes(catId)
            ? selectedCategories.filter(id => id !== catId) // Quitar si ya estaba
            : [...selectedCategories, catId];               // Agregar si no estaba

        // 2. Actualizamos el estado visual local
        setSelectedCategories(newSelection);

        // 3. ¡IMPORTANTE! Se lo enviamos al padre inmediatamente
        setCategoriesFilter(newSelection);
    };

    const handlePriceChange = (order) => {
        // 1. Actualizamos visualmente
        setFilteredPrice(order);
        // 2. Enviamos al padre
        setPriceFilter(order);
    };

    const handleAzChange = (az) => {
        setAlfabeticFilter(az);
        setAzFilter(az);
    }

    return (
        <div className="accordion" id="accordionExample">
            <div className="accordion-item">
                <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                        Categoria
                    </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                    <ul>
                            {categories.map((cat) => (

                                <li
                                    className={styles.filterItem}
                                    key={cat.CAT_ID}
                                >
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.CAT_ID)}
                                            onChange={() => handleCategoryChange(cat.CAT_ID)}
                                        />
                                        {cat.CAT_NAME}
                                    </label>
                                </li>    
                            
                            ))}
                    </ul>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        Precio
                    </button>
                </h2>
                <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                    <div className="accordion-body d-flex flex-column   ">
                        <label
                            className="d-flex gap-2"
                        >
                            <input
                                type="radio"
                                checked={filteredPrice === 'biggest'}
                                onChange={() => handlePriceChange('biggest')}
                            /> Mayor Precio
                        </label>
                        <label
                            className="d-flex gap-2"
                        >
                            <input
                                type="radio"
                                value="Mayor Precio"
                                checked={filteredPrice === 'smallest'}
                                onChange={() => handlePriceChange('smallest')}
                            /> Menor Precio
                        </label>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                        Alfabeticamente
                    </button>
                </h2>
                <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                        <label
                            className="d-flex gap-2"
                        >
                            <input
                                type="radio"
                                checked={alfabeticFilter === 'az'}
                                onChange={() => handleAzChange('az')}
                            /> Nombre A - Z
                        </label>
                        <label
                            className="d-flex gap-2"
                        >
                            <input
                                type="radio"
                                checked={alfabeticFilter === 'za'}
                                onChange={() => handleAzChange('za')}
                            />  Nombre Z - A
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Filters;

