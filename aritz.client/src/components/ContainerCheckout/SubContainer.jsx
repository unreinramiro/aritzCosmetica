import styles from "./SubContainer.module.css"
import PropTypes from "prop-types";

function SubContainer({ children }){
  return <div className={styles.subContainer}>{children}</div>;
}

SubContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SubContainer;
