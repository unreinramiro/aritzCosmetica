import ImageWithText from "../components/ImageWithText";
import Carroussel from "./Carroussel/Carroussel";
import img1 from "../assets/images/crema natural.jpg";
import img2 from "../assets/images/ecommerce.jpg";
import { motion } from "framer-motion";
import CardHome from "../components/CardHome/CardHome";
import styles from "./Home.module.css"
import fotoCuidadoPiel from "../assets/images/cuidadodelapiel.jpg";
import fotoProductosNaturales from "../assets/images/productosnaturales.jpg";
import fotoConfianza from "../assets/images/confianza.jpg";
import LocationMap from "../components/LocationMap/LocationMap";


function Home() {
    return (
        <>
        <Carroussel />
            <motion.div
                initial={{ opacity: 0, y: 100 }} // Empieza invisible y 100px más abajo
                whileInView={{ opacity: 1, y: 0 }} // Cuando entra en pantalla: se hace visible y sube
                viewport={{ once: true, amount: 0.3 }} // once: true (solo se anima 1 vez), amount: 0.3 (espera a ver el 30% del componente)
                transition={{ duration: 1.3, ease: "easeOut" }} // Dura 0.8 segundos
            >
                <ImageWithText
                    imageSrc={img1}
                    altText="calendula"
                    description="En Aritz, nos dedicamos al cuidado de tu piel y cuerpo de forma natural, con la mejor seleccion de elementos para que te sientas unico/a."
                    textAlign="center"
                    title="Sobre nosotros"
                    clase="leftContainer"
                />
            </motion.div>

            <motion.div
                initial={{ x: 100, opacity: 0 }} // Empieza 100px a la izquierda
                whileInView={{ x: 0, opacity: 1 }} // Vuelve a su sitio
                transition={{ duration: 1.3 }}
                viewport={{ once: true, amount: 0.3 }}
            >
                <ImageWithText
                    imageSrc={img2}
                    altText="calendula"
                    description="Realiza la compra de tus productos desde la comodidad de tu casa, agrega tus productos preferidos y te lo enviamos para que no te tengas que mover."
                    textAlign="center"
                    title="Compra desde tu hogar"
                    clase="rightContainer"
                />
            </motion.div>

            <motion.div
                initial={{ x: 100, opacity: 0 }} // Empieza 100px a la izquierda
                whileInView={{ x: 0, opacity: 1 }} // Vuelve a su sitio
                transition={{ duration: 1.3 }}
                viewport={{ once: true, amount: 0.3 }}
            >
                <LocationMap
                    title="Visítanos"
                    description="Estamos en el corazón de la ciudad"
                    location="Los Manantiales 63, X5194 Villa Gral. Belgrano, Córdoba"
                />
            </motion.div>

            <motion.div
                className={styles.cardBigContainer}
                initial={{ opacity: 0, y: 100 }} // Empieza invisible y 100px más abajo
                whileInView={{ opacity: 1, y: 0 }} // Cuando entra en pantalla: se hace visible y sube
                viewport={{ once: true, amount: 0.3 }} // once: true (solo se anima 1 vez), amount: 0.3 (espera a ver el 30% del componente)
                transition={{ duration: 0.8, ease: "easeOut" }} // Dura 0.8 segundos
            >
                <h1>Calidad en lo nuestro</h1>
                <div className={`d-flex gap-3 text-start ${styles.cardsContainer}`}>
                    <CardHome
                        key={1}
                        img={fotoCuidadoPiel}
                        title="Cuidamos tu piel y salud"
                        description="Por que nos importas, porque queremos que nuestros productos sean de gran ayuda para todo tipo de pieles y cuerpos."
                    />
                    <CardHome
                        key={2}
                        img={fotoProductosNaturales}
                        title="Productos 100% Naturales"
                        description="Nuestros productos son seleccionados de los mejores cultivos"
                    />
                    <CardHome
                        key={3}
                        img={fotoConfianza}
                        title="Confianza y Garantia de Calidad"
                        description="Porque miles de personas ya nos eligieron, ponemos nuestro sello de confianza y calidad"
                    />
                </div>
            </motion.div>
        </>
  );
}

export default Home;