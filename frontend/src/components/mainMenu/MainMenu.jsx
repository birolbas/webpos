import styles from "./MainMenu.module.css"
import resto from "../../assets/resto.png"
import staticStyles from "../staticStyle/StaticStyle.module.css"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

function MainMenu() {
    const [restaurant, setRestaurant] = useState("")
    async function onMount() {
        const response = await fetch("http://127.0.0.1:5000/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }
    )
        const data =  await response.json()
        console.log(data)
        localStorage.setItem("Restaurant", data.restaurant)
        setRestaurant(data.restaurant)
    }
    useEffect(() => {
        onMount()
    }, [])
    return (
        <div className={styles["main-menu-container"]}>
            <div className={styles["resto-logo"]}>
                <img src={resto} alt="resto logo" />
            </div>
            <div className={styles["right-bar-options"]}>
                <div className={styles["welcome-tag"]}>
                    <h1>Resto Web Pos</h1>
                    <h2>Hoşgeldiniz, {restaurant}</h2>
                </div>

                <div className={styles['right-bar-items']}>
                    <Link to="/tables" className={styles['buttons']}>
                        <i className={`bi bi-house-door ${styles['buttons']}`} ></i>
                    </Link>
                    <Link to="/income" className={styles['buttons']}>
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