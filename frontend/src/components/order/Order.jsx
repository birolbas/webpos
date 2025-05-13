import { useEffect, useState } from "react";
import Tables from "../tables/Tables";
import Settings from "../settings/Settings";
import resto from "../../assets/resto.png";
import styles from './Orders.module.css';

function Order({ table_id }) {
    const [prevOrders, setPrevOrders] = useState([]);
    const [newOrders, setNewOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState();
    const [displayOrderType, setDisplayOrderType] = useState("prev");
    const [totalPrice, setTotalPrice] = useState(0);

    const [isHome, setIsHome] = useState(false);
    const [isSettings, setIsSettings] = useState(false);

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
    }, [newOrders]);

    useEffect(() => {
        setTotalOrders(prevOrders.map(order => ({ ...order })));
    }, [prevOrders]);

    useEffect(() => {
        console.log("TOTAL PRICE IS ", totalPrice);
    }, [totalPrice]);

    function settings() {
        console.log("settings clicked");
        setIsSettings(true);
        setIsHome(false);
    }

    function Home() {
        setIsHome(true);
        setIsSettings(false);
    }

    function appendOrder(event) {
        setDisplayOrderType("new");
        const productName = event.currentTarget.querySelector('.product-name').textContent;
        const productPrice = event.currentTarget.querySelector('.product-price').textContent;
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

        setIsHome(true);
    };

    if (isSettings) {
        return <Settings />;
    } else if (!isHome) {
        return (
            <div className={styles["containers"]}>
                <div className={styles["left-bar-items"]}>
                    <button className={styles["buttons"]}>
                        <img src={resto} alt="resto logo" />
                    </button>
                    <button onClick={Home} className={styles["buttons"]}>
                        <i className="bi bi-house-door"></i>
                    </button>
                    <button className={styles["buttons"]}>
                        <i className="bi bi-bank"></i>
                    </button>
                    <button className={styles["buttons"]}>
                        <i className="bi bi-bicycle"></i>
                    </button>
                    <button className={styles["buttons"]}>
                        <i className="bi bi-box"></i>
                    </button>
                    <button onClick={settings} className={styles["buttons"]}>
                        <i className="bi bi-gear"></i>
                    </button>
                    <button className={`${styles["buttons"]} ${styles["quit-icon"]}`}>
                        <i className="bi bi-box-arrow-in-left"></i>
                    </button>
                </div>

                <div className={styles["middle-bar"]}>
                    <div className={styles["middle-bar-top-bar"]}>
                        <div className={styles["datetime"]}>
                            <p></p>
                            <p></p>
                        </div>
                        <div className={styles["search-bar"]}>
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
                                <span className={styles["product-name"]}>Çorba</span>
                                <span className={styles["product-price"]}>10</span>
                            </button>
                            <button onClick={(event) => appendOrder(event)}>
                                <span className={styles["product-name"]}>Mantı</span>
                                <span className={styles["product-price"]}>20</span>
                            </button>
                            <button onClick={(event) => appendOrder(event)}>
                                <span className={styles["product-name"]}>Şiş</span>
                                <span className={styles["product-price"]}>30</span>
                            </button>
                            <button onClick={(event) => appendOrder(event)}>
                                <span className={styles["product-name"]}>Adana</span>
                                <span className={styles["product-price"]}>40</span>
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
                                    <button onClick={setOrderToDB} className={styles["send-order"]}>
                                        <i className="bi bi-send"></i>Sipariş Gönder
                                    </button>
                                    <button className={styles["send-bill"]}>
                                        <i className="bi bi-printer"></i>Hesap Yazdır
                                    </button>
                                    <button className={styles["payment"]}>
                                        <i className="bi bi-credit-card"></i> Ödeme Ekranı
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    } else {
        return <Tables />;
    }
}

export default Order;
