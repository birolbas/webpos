import styles from "./MainMenu.module.css"
import resto from "../../assets/resto.png"
import staticStyles from "../staticStyle/StaticStyle.module.css"
import { Link } from "react-router-dom"
function MainMenu() {
    return (
        <div className={styles["main-menu-container"]}>
            <div className={styles["resto-logo"]}>
                <img src={resto} alt="resto logo" />
            </div>
            <div className={styles["right-bar-options"]}>
                <div className={styles["welcome-tag"]}>
                    <h1>Resto Web Pos</h1>
                    <h2>Hoşgeldiniz, Restorant Adı</h2>
                </div>

                <div className={styles['right-bar-items']}>
                    <Link to="/tables" className={styles['buttons']}>
                        <i className={`bi bi-house-door ${styles['buttons']}`} ></i>
                    </Link>
                    <Link to="/orders" className={styles['buttons']}>
                        <i className={`bi bi-bank ${styles['buttons']}`}></i>
                    </Link>
                    <Link to="/delivery" className={styles['buttons']}>
                        <i className={`bi bi-bicycle ${styles['buttons']}`}></i>
                    </Link>
                    <Link to="/inventory" className={styles['buttons']}>
                        <i className={`bi bi-box ${styles['buttons']}`}></i>
                    </Link>
                    <Link to="/settings" className={styles['buttons']}>
                        <i className={`bi bi-gear ${styles['buttons']}`}></i>
                    </Link>
                    <Link to="/" className={`${styles['buttons']} ${styles['quit-icon']}`}>
                        <i className={`bi bi-box-arrow-in-left ${styles['buttons']}`}></i>
                    </Link>
                </div>

            </div>
        </div>
    )
}
export default MainMenu