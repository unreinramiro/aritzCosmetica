import CenteredContainer from "../CenteredContainer/CenteredContainer";
import { CiUser } from "react-icons/ci";
import { AiOutlineProduct } from "react-icons/ai";
import styles from '../Admin/AdminManage.module.css'
import AdminProducts from "./AdminProducts";
import { useState } from "react";
import AdminUsers from "./AdminUsers";
import { TbShoppingBagSearch } from "react-icons/tb";
import AdminOrders from "./AdminOrders";
import { useSession } from "../../context/SessionContext";


function AdminManage() {

    const { AdmUsrPrd, setAdmUsrPrd } = useSession();

    return (
        <CenteredContainer>
            <h1>Administrar {AdmUsrPrd}</h1>
            <div className={styles.iconsDiv}>
                <div
                    onClick={() => {setAdmUsrPrd('Usuarios')}}
                    className={`${styles.iconsDivUserPoducts} ${AdmUsrPrd === 'Usuarios' ? styles.selected : ''}`}
                >
                    <CiUser size={70} />
                    <b>Usuarios</b>
                </div>
                <div
                    onClick={() => { setAdmUsrPrd('Productos') }}
                    className={`${styles.iconsDivUserPoducts} ${AdmUsrPrd === 'Productos' ? styles.selected : ''}`}
                >
                    <AiOutlineProduct size={70} />
                    <b>Productos</b>
                </div>
                <div
                    onClick={() => { setAdmUsrPrd('Pedidos') }}
                    className={`${styles.iconsDivUserPoducts} ${AdmUsrPrd === 'Pedidos' ? styles.selected : ''}`}
                >
                    <TbShoppingBagSearch size={70} />
                    <b>Pedidos</b>
                </div>
            </div>

            <div className={styles.productsUsersAdminContainer}>
                {AdmUsrPrd === 'Productos'
                    ? <AdminProducts />
                    : AdmUsrPrd === 'Pedidos'
                        ? <AdminOrders />
                        : <AdminUsers />
                }
            </div>
        </CenteredContainer>
    )
}

export default AdminManage;