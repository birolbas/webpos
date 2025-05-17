import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Tables from "../tables/Tables";
import Settings from "../settings/Settings";
import styles from './Orders.module.css';
import staticStyles from '../staticStyle/StaticStyle.module.css'
import LeftBar from "../staticStyle/LeftBar";
import Clock from "../staticStyle/Clock";

function Order() {
    const params = useParams();
    const table_id = (params["table_id"])
    
    const [prevOrders, setPrevOrders] = useState([]);
    const [newOrders, setNewOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState();
    const [displayOrderType, setDisplayOrderType] = useState("prev");
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        newOrders.forEach(order => {
            const indexOfPrevOrder = prevOrders.findIndex(item => item.name === order.name);
            if (indexOfPrevOrder !== -1) {
                const indexOfTotalOrder = totalOrders.findIndex(item => item.name === order.name);
                totalOrders[indexOfTotalOrder].amount += 1;
            } else {
                setTotalOrders([...prevOrders, ...newOrders]);
            }
        });
        console.log("total orders",totalOrders)
        console.log("prev orders",prevOrders)
        console.log("new orders",newOrders)
    }, [newOrders]);

    useEffect(() => {
        setTotalOrders(prevOrders.map(order => ({ ...order })));
    }, [prevOrders]);

    useEffect(() => {
        console.log("TOTAL PRICE IS ", totalPrice);
    }, [totalPrice]);




    function appendOrder(event) {
        setDisplayOrderType("new");
        const productName = event.currentTarget.querySelector('#product-name').textContent;
        console.log(productName)
        const productPrice = event.currentTarget.querySelector('#product-price').textContent;
        const existingIndex = newOrders.findIndex(order => order.name === productName);

        if (existingIndex !== -1) {
            const updatedOrders = [...newOrders];
            updatedOrders[existingIndex].amount += 1;
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
                const response = await fetch("http://127.0.0.1:5000/get_orders");
                if (response.ok) {
                    const data = await response.json();
                    for (let i = 0; i < data.length; i++) {
                        if (table_id === data[i][1]) {
                            console.log("BUNU TOTAL PARA YAPIYOR", data[i][3]);
                            console.log("PREV ORDERSI BUNA SETLIYOR", data[i][2]);
                            setPrevOrders(data[i][2]);
                            setTotalPrice(parseFloat(data[i][3]));
                            break;
                        }
                    }
                } else {
                    console.log("error happened", response.statusText);
                }
            } catch (error) {
                console.log(error);
            }
        };

        getOrderFromDB();
    }, [table_id]);

    const setOrderToDB = async () => {
        try {
            const response = await fetch("http://localhost:5000/orders", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table_id: table_id,
                    orders: totalOrders,
                    total_price: totalPrice
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Sipariş başarıyla gönderildi:", data);
            } else {
                console.log("Bir hata oluştu:", response.statusText);
            }
        } catch (error) {
            console.error("Hata:", error);
        }

    };


        return (
            <div className={staticStyles["containers"]}>
                <LeftBar></LeftBar>

                <div className={staticStyles["middle-bar"]}>
                    <div className={staticStyles["middle-bar-top-bar"]}>
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
                            <p>Ana Yemek</p>
                            <p>İçecek</p>
                        </div>
                        <div className={styles["products"]}>
                            <button onClick={(event) => appendOrder(event)}>
                                <span className={styles["product-name"]} id="product-name">Çorba</span>
                                <span className={styles["product-price"]} id="product-price">10</span>
                            </button>
                            <button onClick={(event) => appendOrder(event)}>
                                <span className={styles["product-name"]} id="product-name">Mantı</span>
                                <span className={styles["product-price"]} id="product-price">20</span>
                            </button>
                            <button onClick={(event) => appendOrder(event)}>
                                <span className={styles["product-name"]} id="product-name">Şiş</span>
                                <span className={styles["product-price"]} id="product-price">30</span>
                            </button>
                            <button onClick={(event) => appendOrder(event)}>
                                <span className={styles["product-name"]} id="product-name">Adana</span>
                                <span className={styles["product-price"]} id="product-price">40</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles["right-bar"]}>
                    <div className={styles["order-menu"]}>
                        <div className={styles["order-id"]}>
                            <p>Masa Numarası: <span id="table-id">{table_id}</span></p>
                            <p>Order ID: <span>351</span></p>
                        </div>
                        <div className={styles["order-list"]}>
                            <button onClick={() => setDisplayOrderType("new")}>Yeni Siparişler</button>
                            <button onClick={() => setDisplayOrderType("prev")}>Eski Siparişler</button>

                            <div className={styles["orders"]}>
                                <ul className={styles["order-items"]}>
                                    {(displayOrderType === "prev" ? prevOrders : newOrders).map((order, index) => (
                                        <li key={index}>
                                            <span className={styles["product-amount"]}>{order["amount"]}</span>
                                            <span className={styles["order-name"]}>{order["name"]}</span>
                                            <span className={styles["price"]}>{order["price"]}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className={styles["order-summary"]}>
                            <p>Servis: <span className={styles["price"]}>0</span></p>
                            <p>İndirim: <span className={styles["price"]}>0</span></p>
                            <p>Total: <span className={`${styles["price"]} ${styles["total-price"]}`}>{totalPrice}</span></p>
                            <div className={styles["action-buttons"]}>
                                <div className={styles["action-container"]}>
                                    <div className={styles["print-buttons"]}>
                                        <Link to="/tables" onClick={setOrderToDB} className={styles["send-order"]}>
                                            <i className={`bi bi-send ${styles["action-container-i"]}`}></i>
                                            Sipariş Gönder
                                        </Link>
                                        <Link to="/" className={styles["send-bill"]}>
                                            <i className={`bi bi-printer ${styles["action-container-i"]} `}></i>
                                            Hesap Yazdır
                                        </Link>
                                    </div>

                                    <button className={styles["payment"]}>
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
