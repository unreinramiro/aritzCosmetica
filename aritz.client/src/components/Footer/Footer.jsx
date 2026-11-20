import React from "react";
import styles from "./Footer.module.css";
import { NavLink } from "react-router-dom";
import { FaHome, FaBoxOpen, FaEnvelope, FaShoppingCart, FaWhatsappSquare } from "react-icons/fa";
/*
  Footer.jsx
  Simple, accessible footer component used across the application.
  Keeps styling and content minimal so consumers can style via CSS.
*/

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`${styles.footerContainer}`}
      role="contentinfo"
      aria-label="Site footer"
    >
      <h1 className={styles.aritzFooter}>Aritz</h1>
      <div className={`app-footer__inner ${styles.subContainer}`}>

        <nav className="app-footer__nav" aria-label="Footer">
          <ul className="app-footer__list">
            <li className={styles.listas}>
              <div className={styles.contactContainer}>
                <FaEnvelope className={styles.mailLogo} />
                <NavLink className={styles.navLinks} to="/contact">
                  Mail:
                </NavLink>
              </div>
              aritzCosmetica@gmail.com
            </li>
            <li className={styles.listas}>
              <div className={styles.contactContainer}>
                <FaWhatsappSquare className={styles.wppLogo} size={20}/>
                <NavLink className={styles.navLinks}>
                  Telefono:
                </NavLink>
              </div>
              +54 9 11 6483-7901
            </li>
          </ul>
        </nav>
        <div className={`${styles.company} app-footer__brand`}>
          <span className="app-footer__logo" aria-hidden="true">
            ©
          </span>
          <span className="app-footer__company">
            {year} Aritz. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
