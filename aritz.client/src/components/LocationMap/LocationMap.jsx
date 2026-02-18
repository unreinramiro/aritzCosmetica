import React from 'react';
import styles from './LocationMap.module.css';

function LocationMap({ title, description, location }) {
    return (
        <div className={styles.mapContainer}>
            <div className={styles.descriptionContainer}>
                <h2>{title}</h2>
                <p>{description}</p>
                <b>{location}</b>
            </div>
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d503.0933637716363!2d-64.56094420648976!3d-31.977299257226726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2b1627d701d03%3A0x3461ee06f75364b7!2sPaseo%20de%20los%20artesanos!5e0!3m2!1ses!2sar!4v1770000471960!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }} 
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicacion Aritz"
            ></iframe>
        </div>
    );
}

export default LocationMap;