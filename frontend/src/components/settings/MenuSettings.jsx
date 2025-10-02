import styles from "./MenuSettings.module.css"
import LeftBar from "../staticStyle/LeftBar"
import staticStyles from "../staticStyle/StaticStyle.module.css"
import Clock from "../staticStyle/Clock";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
function MenuSettings() {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    function saveMenuItem() {
        const newMenuInput = document.querySelectorAll(`.${styles["table-input"]}`)
        const inputName = newMenuInput[0].firstChild.value
        const inputCategory = newMenuInput[1].firstChild.value
        const inputCondimentGroups = newMenuInput[2].firstChild.value
        const inputTaxRate = newMenuInput[3].firstChild.value
        const inputPrice = newMenuInput[4].firstChild.value
        const productExist = products.some(product => product.productName === inputName)
        if (productExist !== true) {
            console.log(products)
            console.log("productExist", productExist)
            const object = {
                productName: inputName,
                productCategory: inputCategory,
                productCondimentGroups: inputCondimentGroups,
                productTaxRate: inputTaxRate,
                productPrice: inputPrice
            }
            setProducts([...products, object])
            newMenuInput.forEach((input, _)=>{
                input.firstChild.value = ""
            })
        }
    }
    
    useEffect(()=>{
        const getProductsFromDB = async () =>{
            try{
                const response = await fetch("http://127.0.0.1:5000/get_products",{
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                const data = await response.json()
                console.log("data is ",data)
            if(response.ok){
                setProducts(data[0][1])
            }
            }catch (error){
                console.log("error happened", error)
            }
        }
        getProductsFromDB();
    },[])


    const saveProductsToDB = async() => {
        const savedData = {
            restaurantName: "TEST",
            products: products
        }
        console.log(savedData)
        try{
            
            const response = await fetch("http://127.0.0.1:5000/set_products",{
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(savedData)
            }
        )
        }catch(error){
            console.log(error)
        }
    }


    return (
        <div className={staticStyles.containers}>
            <div style={{ width: "100%" }} className={staticStyles['middle-bar']}>

                <div className={staticStyles['middle-bar-top-bar']}>
                    <div className={staticStyles["go-back-button"]}>
                        <button onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-return-left"></i>
                        </button>
                    </div>
                    <div className={staticStyles["datetime"]}>
                        <Clock></Clock>
                    </div>
                </div>

                <div className={styles["item-container"]}>
                    <div className={styles["append-menu-item"]}>
                        <p>Menü Kalemleri</p>
                        <button onClick={saveProductsToDB} ><i className="bi bi-plus-circle"></i><p>Değişiklikleri Kaydet</p></button>
                    </div>

                    <div className={styles["table-headers"]}>
                        <p>Ürün Adı</p>
                        <p>Kategori</p>
                        <p>İlave Grupları</p>
                        <p>Vergi Oranı</p>
                        <p>Fiyat</p>
                    </div>
                    
                    {products?.map((product, _) => (
                    (
                        <div className={styles["table-items"]}>
                        <p className={styles["product-name"]}>{product.productName}</p>
                        <p className={styles["product-category"]}>{product.productCategory}</p>
                        <p className={styles["product-condiment-groups"]}>{product.productCondimentGroups}</p>
                        <p className={styles["product-tax-percent"]}>{product.productTaxRate}</p>
                        <p className={styles["price"]}>{product.productPrice}</p>
                        <button><i className="bi bi-three-dots"></i></button>
                        </div>
                    )
                    ))}
                    <div className={styles["menu-input"]}>
                        <div className={styles["table-input"]}><input type="text" name="" id="" placeholder="Ürün Adı Giriniz" /></div>
                        <div className={styles["table-input"]}><input type="text" name="" id="" placeholder="Kategori Giriniz" /></div>
                        <div className={styles["table-input"]}><input type="text" name="" id="" placeholder="İlave Grubu Giriniz" /></div>
                        <div className={styles["table-input"]}><input type="number" name="" id="" placeholder="Vergi Oranı Giriniz" /></div>
                        <div className={styles["table-input"]}><input type="number" name="" id="" placeholder="Fiyat Giriniz" /></div>
                        <div className={styles["table-input-save"]}><button onClick={saveMenuItem}><i className="bi bi-check"></i></button> </div>
                    </div>


                </div>
            </div>
        </div>
    );
}
export default MenuSettings