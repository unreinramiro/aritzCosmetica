import ImageWithText from "../components/ImageWithText";
import Carroussel from "./Carroussel/Carroussel";
import img1 from "../assets/images/crema natural.jpg";
import img2 from "../assets/images/ecommerce.jpg";
import { motion } from "framer-motion";
import CardHome from "../components/CardHome/CardHome";
import styles from "./Home.module.css";
import fotoCuidadoPiel from "../assets/images/cuidadodelapiel.jpg";
import fotoProductosNaturales from "../assets/images/productosnaturales.jpg";
import fotoConfianza from "../assets/images/confianza.jpg";
import LocationMap from "../components/LocationMap/LocationMap";

function Home() {
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, ease: "easeOut" },
  };
  return (
    <>
      <Carroussel />
      <div className={styles.cardsHomeContainer}>
        <motion.div {...reveal}>
          <ImageWithText
            imageSrc={img1}
            altText="calendula"
            description="En Aritz, nos dedicamos al cuidado de tu piel y cuerpo de forma natural, con la mejor seleccion de elementos para que te sientas unico/a."
            textAlign="left"
            title="Sobre nosotros"
            clase="leftContainer"
          />
        </motion.div>

        <motion.div {...reveal}>
          <ImageWithText
            imageSrc={img2}
            altText="calendula"
            description="Realiza la compra de tus productos desde la comodidad de tu casa, agrega tus productos preferidos y te lo enviamos para que no te tengas que mover."
            textAlign="left"
            title="Compra desde tu hogar"
            clase="rightContainer"
          />
        </motion.div>

        <motion.div {...reveal}>
          <LocationMap
            title="Visítanos"
            description="Estamos en el corazón de la ciudad"
            location="Los Manantiales 63, X5194 Villa Gral. Belgrano, Córdoba"
          />
        </motion.div>

        <motion.div className={styles.cardBigContainer} {...reveal}>
          <h1>Calidad en lo nuestro</h1>
          <div className={styles.cardsContainer}>
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
      </div>
    </>
  );
}

export default Home;
