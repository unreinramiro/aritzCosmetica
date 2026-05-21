import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import imagen1 from '../../assets/images/imagenCarrousel1.jpg';
import imagen2 from '../../assets/images/imagenCarrousel2.jpg';
import imagen3 from '../../assets/images/imagenCarrousel3.jpg';
import styles from './Carroussel.module.css'; // Importa el CSS personalizado
import { NavLink } from "react-router-dom";
import videoCremas from '../../assets/videos/videoCremas.mp4'; 
import cremaImg from '../../assets/images/fotoPortada.webp';

function Carroussel() {

    const [img, setPrdImg] = useState([]);

    useEffect(() => {
        fetchImgPrd();
    }, []);

    const fetchImgPrd = async () => {
        try {
            const response = await axiosInstance.get('products');
            setPrdImg(response.data);

        } catch (e) {
            console.log("Error al traer la imagen: ", e)
        }
    }

    return (
        <div className={styles.carrouselContainer}>
            <div id="carouselExampleFade" className={`carousel slide carousel-fade ${styles.carrouselContainerSub}`}>
                <div className={styles.titleCarrousel}>
                    <div className={`d-flex flex-column ${styles.subTitleCarrousel}`}>
                        <h1>Aritz.</h1>
                        <b>Lo mejor para cuidar tu piel y estilo de vida</b>
                    </div>
                    <NavLink
                        className={styles.shopBtn}
                        to="/product"
                    >
                        Shop
                    </NavLink>
                </div>
                <div className={`carousel-inner ${styles.containerProductImg}`} style={{ height: "100%" }}>
                    <img src={cremaImg} className={styles.productImage} alt="producto" />
                    {/* <video
                        className={styles.video}
                        loop preload="auto"
                        autoPlay
                        playsInline
                        muted
                        src={videoCremas}
                    >
                        <source src="https://localhost:7273/images/videoCremas.mp4" type="video/mp4" media="(min-width: 768px)" />
                        <source src="https://localhost:7273/images/videoCremas.mp4" type="video/mp4" media="(min-width: 768px)" />
                    </video> */}
                </div>
            </div>
        </div>
    );
}

export default Carroussel;