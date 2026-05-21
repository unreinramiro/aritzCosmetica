import styles from "./CardHome.module.css";
function CardHome({img, title, description}) {
    return (
        <div className={styles.cardBig}>
            <img src={img} alt="..." />
                <div className={styles.cardBigSubContainer}>
                    <h5>{title}</h5>
                    <p>{description}</p>
                </div>
        </div>
    )
}

export default CardHome;