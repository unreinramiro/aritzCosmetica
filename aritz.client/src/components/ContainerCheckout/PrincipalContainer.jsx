import styles from "./PrincipalContainer.module.css"
import PropTypes from "prop-types";

function PrincipalContainer({ children }){
  return <div className={styles.principalContainer}>{children}</div>;
}

PrincipalContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrincipalContainer;
