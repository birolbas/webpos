import logo from '../../assets/resto.png'
import styles from './LoginSign.module.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginSign() {
    const [login, setLogin] = useState(true)
    const navigate = useNavigate()

    const meFunction = async (token) => {
            try {
                const response = await fetch("http://127.0.0.1:5000/isAlreadyLoggedIn", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(token)
                })
                if (response.ok) {
                    const data = await response.json()
                    return data
                }
            } catch (error) {
                console.log(error)
            }
        }

    useEffect(() => {
        const token = localStorage.getItem("token")

        const run = async () =>{
            if(token){
                const data = await meFunction(token)
                if(data){
                    console.log(data)
                    navigate("/waiter_login")
                }
            }
        }
        run()
    }, [])
    const signUp = async () => {
        const restaurant_name = document.getElementById("sign-up-restaurant-name").value
        const e_mail = document.getElementById("sign-up-e-mail").value
        const password = document.getElementById("sign-up-password").value
        const object = {
            restaurant_name: restaurant_name,
            e_mail: e_mail,
            password: password
        }
        try {
            const response = await fetch("http://127.0.0.1:5000/sign-up", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(object)
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data)

            }

        } catch (error) {
            console.log(error)
        }

    }
    const loginCheck = async () => {
        const e_mail = document.getElementById("e-mail-input").value
        const password = document.getElementById("password-input").value
        const object = {
            e_mail: e_mail,
            password: password
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(object)
            })
            if (response.ok) {
                const data = await response.json()
                console.log("data is", data)
                localStorage.setItem("token", data.access_token)
                if (data["success"]) {
                    navigate("/waiter_login")
                }
            }
        } catch (error) {
            console.log(error)
        }


    }
    function signForm() {
        return <div className={styles["login-form-container"]}>
            <div className={styles["login-form"]}>
                <h1>Hoşgeldiniz</h1>
                <h1>Lütfen Kayıt Olunuz</h1>

                <div className={styles["e-mail-input"]}>
                    <h2>Restorant Adı</h2>
                    <input id='sign-up-restaurant-name' type="text" name="" value="TEST" />
                </div>
                <div className={styles["e-mail-input"]}>
                    <h2>E-Mail</h2>
                    <input id='sign-up-e-mail' type="email" name="" value="restotest@gmail.com" />
                </div>

                <div className={styles["password-input"]}>
                    <h2>Şifre</h2>
                    <input id='sign-up-password' type="password" name="" value="test" />
                </div>

                <div className={styles["login-button"]}>
                    <button onClick={() => signUp()}>Kayıt Ol</button>
                </div>
                <div className={styles["create-acc"]}>
                    <p style={{ color: "white" }}>Hesabınız var mı?</p>
                    <a onClick={e => {
                        e.preventDefault();
                        setLogin(true);
                    }}> Hemen giriş yapın</a>
                </div>
            </div>
        </div>
    }

    function loginForm() {
        return <div className={styles["login-form-container"]}>
            <div className={styles["login-form"]}>
                <h1>Hoşgeldiniz</h1>
                <h1 style={{fontSize:"16px", color:"#4B5563"}}>Lütfen Giriş Yapınız.</h1>
                <div className={styles["e-mail-input"]}>
                    <h2>E-Mail</h2>
                    <input type="text" name="" id="e-mail-input" value="restotest@gmail.com" />
                </div>
                <div className={styles["password-input"]}>
                    <h2>Şifre</h2>
                    <input type="password" name="" id="password-input" value="test" />
                </div>
                <a style={{justifyContent:"end", margin:"0.5rem 0rem", color:"#111827"}} href="">Şifremi unuttum</a>
                <div className={styles["login-button"]}>
                    <button onClick={() => loginCheck()}>Giriş Yap</button>
                </div>
                <div className={styles["create-acc"]}>
                    <p style={{ color: "#4B5563" }}>Hesabınız mı yok?</p>
                    <a style={{ color: "#111827" }} onClick={e => {
                        e.preventDefault();
                        setLogin(false);
                    }}> Hemen oluşturun</a>
                </div>
            </div>
        </div>
    }
    return <>
        <div className={styles["main-menu-container"]}>
            <div className={styles["left-menu"]}>
                <img src={logo} alt="" />
            </div>
            <div className={styles["right-menu-container"]}>
                {login ? loginForm() : signForm()}
            </div>
        </div>

    </>
}
export default LoginSign