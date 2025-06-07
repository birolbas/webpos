import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Tables from "../tables/Tables";
import Settings from "../settings/Settings";
import styles from './Orders.module.css';
import staticStyles from '../staticStyle/StaticStyle.module.css'
import LeftBar from "../staticStyle/LeftBar";
import Clock from "../staticStyle/Clock";
import { Link } from 'react-router-dom';

function Order() {
    const params = useParams();
    const table_id = (params["table_id"])
    const navigate = useNavigate();

    const [prevOrders, setPrevOrders] = useState([]);
    const [newOrders, setNewOrders] = useState([]);
    const [displayOrderType, setDisplayOrderType] = useState("prev");
    const [totalPrice, setTotalPrice] = useState(0);
    const [productCategory, setProductCategory] = useState([])
    const [products, setProducts] = useState([])
    const [chosenCategory, setChosenCategory] = useState([])
    function appendOrder(event) {
        setDisplayOrderType("new");
        const productName = event.currentTarget.querySelector('#product-name').textContent;
        console.log("prev order", prevOrders)
        const productPrice = Number(event.currentTarget.querySelector('#product-price').textContent);
        const existingIndex = newOrders.findIndex(order => order.name === productName);

        if (existingIndex !== -1) {
            const updatedOrders = [...newOrders];
            updatedOrders[existingIndex].amount += 1;
            updatedOrders[existingIndex].price += productPrice
            setNewOrders(updatedOrders);

        } else {
            const newOrder = {
                amount: 1,
                name: productName,
                price: productPrice,
            };
            setNewOrders([...newOrders, newOrder]);
        }
        const newTotalPrice = totalPrice + Number(productPrice);
        setTotalPrice(newTotalPrice);
    }

    useEffect(() => {
        const getOrderFromDB = async () => {
            try {
                console.log("table id is ",table_id)
                console.log("asdfasdfasdfasdfasdfasdf")
                const getOrdersResponse = await fetch("http://127.0.0.1:5000/get_orders");
                const getProductsResponse = await fetch("http://127.0.0.1:5000/get_products")
                if (getOrdersResponse.ok && getProductsResponse.ok) {
                    const getOrdersData = await getOrdersResponse.json();
                    const getProductsData = await getProductsResponse.json();
                    const productCategories = getProductsData[0][1]
                    setProducts(getProductsData[0][1])
                    const totalCategories = []
                    productCategories.forEach((category, index)=>{
                        const existingIndex = totalCategories.findIndex(c => category.productCategory === c)
                        console.log(existingIndex)
                        if(existingIndex ===-1){
                            totalCategories.push(productCategories[index].productCategory)
                        }
                    })
                    setProductCategory(totalCategories)
                    const chosenProducts = productCategories.filter(p => p.productCategory === totalCategories[0])

                    const object = {
                        category:totalCategories[0],
                        products:chosenProducts,
                    }
                    setChosenCategory(object)
                    console.log("getOrdersData",getOrdersData)
                    const Index = getOrdersData.findIndex(o => o[2]=== table_id)
                    
                    setPrevOrders([...getOrdersData[Index][5]])
                    setTotalPrice(parseFloat(getOrdersData[Index][6]))

                } else {
                    console.log("error happened", getOrdersResponse.statusText);
                }
            } catch (error) {
                console.log(error);
            }
        };

        getOrderFromDB();
    }, [table_id]);

    function changeCategory(e){
        console.log("chosenCategory",chosenCategory)
        const categoryName = e.target.textContent
        console.log("products",products)
        const categoryProducts = products.filter(p => p.productCategory === categoryName)
        console.log("categoryProducts",categoryProducts)
        const object = {
            category: categoryName,
            products: categoryProducts
        }
        setChosenCategory(object)

    }

    const setOrderToDB = async () => {
        const totalOrders = []
        prevOrders.forEach(prev => totalOrders.push({ ...prev }))
        newOrders.forEach(newOrder => {
            const existingIndex = totalOrders.findIndex(order => order.name === newOrder.name)
            if (existingIndex !== -1) {
                totalOrders[existingIndex].amount += newOrder.amount
                totalOrders[existingIndex].price = parseInt(totalOrders[existingIndex].price) + parseInt(newOrder.price)
            } else {
                totalOrders.push({ ...newOrder })
            }
        })
        function getTodayDate() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); 
            const day = String(now.getDate()).padStart(2, '0');         
            return `${year}-${month}-${day}`;
            }
        const date = getTodayDate()
        const checkNumber = document.getElementsByClassName(styles["order-id"])[0].lastChild.lastChild.textContent
        try {
            const requestBody = {
                restaurant_name: "TEST",
                checkNumber: checkNumber,
                oppeningDate: date,
                orders: totalOrders,
                table_id: table_id,
                total_price: totalPrice
            };
            console.log("req body", requestBody)
            const response = await fetch("http://localhost:5000/orders", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            console.log("total orders,", totalOrders)
            if (response.ok) {
                navigate("/tables")
            } else {
                console.log("Bir hata oluştu:", response.statusText);
            }
        } catch (error) {
            console.error("Hata:", error);
        }


    };
    useEffect(()=>{
        console.log("productCategory",chosenCategory)
    },[chosenCategory])
    
    function routePaymentScreen(){
        if(totalPrice>0 && prevOrders.length>0){
            console.log(typeof totalPrice)
            navigate(`/payment/${table_id}`)
        }
    }
    return (
        <div className={staticStyles["containers"]}>
            <div className={staticStyles["middle-bar"]}>
                <div className={staticStyles["middle-bar-top-bar"]}>
                    <div className={staticStyles["go-back-button"]}>
                        <button onClick={()=>navigate(-1)}>
                            <i className="bi bi-arrow-return-left"></i>
                        </button>
                    </div>
                    <div className={staticStyles["datetime"]}>
                        <Clock></Clock>
                    </div>
                    <div className={staticStyles["search-bar"]}>
                        <form action="/search" method="get">
                            <input type="text" id="search" name="q" placeholder="Search products..." />
                        </form>
                    </div>
                </div>

                <div className={styles["menu-items"]}>
                    <div className={styles["menu-items-sections"]}>
                        {productCategory.map((category, index)=>(
                            <button onClick={(e)=>changeCategory(e)}>{category}</button>
                        ))} 

                    </div>
                    <div className={styles["products"]}>
                        {chosenCategory.products?.map((product, _)=>(
                        <button onClick={(event) => appendOrder(event)}>
                            <span className={styles["product-name"]} id="product-name">{product.productName}</span>
                            <span className={styles["product-price"]} id="product-price">{product.productPrice}</span>
                        </button>
                        ))}
                        
                    </div>
                </div>
            </div>

            <div className={styles["right-bar"]}>
                <div className={styles["order-menu"]}>
                    <div className={styles["order-id"]}>
                        <p>Masa Numarası: <span id="table-id">{table_id}</span></p>
                        <p>Order ID: <span>1</span></p>
                    </div>
                    <div className={styles["order-list"]}>
                        <div className={styles["new-prev-orders"]}>
                            <button onClick={() => setDisplayOrderType("new")}>Yeni Siparişler</button>
                            <button onClick={() => setDisplayOrderType("prev")}>Eski Siparişler</button>
                        </div>

                        <div className={styles["orders"]}>
                            <ul className={styles["order-items"]}>
                                {(displayOrderType === "prev" ? prevOrders : newOrders).map((order, index) => (
                                    <li key={index}>
                                        <div className={styles["product-amount"]}>
                                            <span>{order["amount"]}</span>
                                        </div>
                                        <div className={styles["order-name"]}>
                                            <span >{order["name"]}</span>
                                        </div>

                                        <div className={styles["price"]}>
                                            <span >{order["price"]} ₺</span>
                                        </div>

                                        <div className={styles["order-item-actions"]}>
                                            <button>
                                                <i className="bi bi-three-dots"></i>
                                            </button>
                                        </div>


                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={styles["order-summary"]}>
                        <div className={styles["order-details"]}>
                            <p>Total: <span className={`${styles["price"]} ${styles["total-price"]}`}>{totalPrice} ₺</span></p>
                        </div>

                        <div className={styles["action-buttons"]}>
                            <div className={styles["action-container"]}>
                                <div className={styles["print-buttons"]}>
                                    <button to="/tables" onClick={setOrderToDB} className={styles["send-order"]}>
                                        <i className={`bi bi-send ${styles["action-container-i"]}`}></i>
                                        Sipariş Gönder
                                    </button>
                                    <button to="/" className={styles["send-bill"]}>
                                        <i className={`bi bi-printer ${styles["action-container-i"]} `}></i>
                                        Hesap Yazdır
                                    </button>
                                </div>

                                <button onClick={routePaymentScreen} className={styles["payment"]}>
                                    <i className={`bi bi-credit-card ${styles["action-container-i"]}`} ></i> Ödeme Ekranı
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}


export default Order;
