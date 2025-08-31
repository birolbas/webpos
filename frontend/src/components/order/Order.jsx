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
    const [chosenSubCategory, setChosenSubCategory] = useState()
    const [guestCount, setGuestCount] = useState(0)
    const [isDelete, setIsDelete] = useState(false)
    const [descriptionText, setDescriptionText] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

        useEffect(() => {
        const getOrderFromDB = async () => {
            try {
                console.log("table id is ", table_id)
                const getOrdersResponse = await fetch("http://127.0.0.1:5000/get_orders");
                if (getOrdersResponse.ok) {
                    const getOrdersData = await getOrdersResponse.json();
                    const Index = getOrdersData.findIndex(o => o[2] === table_id)
                    setPrevOrders([...getOrdersData[Index][5]])
                    setTotalPrice(parseFloat(getOrdersData[Index][6]))
                    setGuestCount(getOrdersData[Index][8])

                } else {
                    console.log("error happened", getOrdersResponse.statusText);
                }
            } catch (error) {
                console.log(error);
            }
        };
        getOrderFromDB();
        prevOrdersDiv()
    }, [table_id]);

    const onMount = () => {
        try {
            const staticCategory = JSON.parse(localStorage.getItem("Menu"))
            const staticProducts = JSON.parse(localStorage.getItem("Products"))
            
            if (!staticCategory || !staticProducts) {
                console.error("Menu or Products data not found in localStorage")
                setIsLoading(false)
                return
            }
            
            console.log("staticProducts", staticProducts)
            console.log(staticCategory[0].categoryName)
            const tempCategories = []
            console.log("categories", staticCategory)

            staticCategory.forEach((item, index) => {
                const category = item.categoryName
                const subCategoryProducts = []
                if (item.subCategories) {
                    item.subCategories.forEach((sub, index) => {
                        const product = staticProducts.filter(p => p.category === sub)
                        const subCateAndProducts = {
                            subCategoryName: sub,
                            products: product
                        }
                        console.log("obje", subCateAndProducts)
                        subCategoryProducts.push(subCateAndProducts)
                    })
                    const object = {
                        category: item.categoryName,
                        subCategories: subCategoryProducts,
                    }
                    tempCategories.push(object)
                } else {
                    const product = staticProducts.filter(p => p.category === item.categoryName)
                    const object = {
                        category: item.categoryName,
                        subCategories: [],
                        products: product
                    }
                    tempCategories.push(object)
                }
            })
            console.log("asd", tempCategories)
            setProductCategory(tempCategories)
            if (tempCategories.length > 0) {
                setChosenCategory(tempCategories[0])
                if (tempCategories[0].subCategories && tempCategories[0].subCategories.length > 0) {
                    setChosenSubCategory(tempCategories[0].subCategories[0])
                    setProducts(tempCategories[0].subCategories[0].products)
                } else if (tempCategories[0].products) {
                    setProducts(tempCategories[0].products)
                }
            }
        } catch (error) {
            console.error("Error loading menu data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        onMount()
    }, [])
    useEffect(() => {
        console.log(chosenSubCategory)
    }, [chosenSubCategory])
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
    function closeActions(index) {
        if (displayOrderType == "prev") {
            const actionBox = document.querySelector(`#prev-${index}`)
            actionBox.style.display = "none"
            console.log(actionBox)
        }
    }
    function closeAllActions() {
        const allActionBoxes = document.querySelectorAll('[id^="prev-"], [id^="new-"]');
        allActionBoxes.forEach(box => {
            if (box.classList.contains(styles["order-item-actions-box"])) {
                box.style.display = "none";
            }
        });
    }
    function openActions(index) {
        if (displayOrderType == "prev") {
            const actionBox = document.querySelector(`#prev-${index}`)
            console.log("actionbox is", actionBox)
            actionBox.style.display = "flex"
            console.log(actionBox)
        } else if (displayOrderType == "new") {
            const actionBox = document.querySelector(`#new-${index}`)
            actionBox.style.display = "flex"
            console.log(actionBox)
        }
    }
    useEffect(() => {
        if (isDelete) {
            setOrderToDB(false)
            setIsDelete(false)
        }
    }, [isDelete])

    function deleteOrder(index) {
        if (displayOrderType == "prev") {
            console.log(prevOrders[index])
            const prevOrdersToDelete = [...prevOrders]
            const priceToSub = parseFloat(prevOrdersToDelete[0].price)
            setTotalPrice(totalPrice - priceToSub)
            prevOrdersToDelete.splice(index, 1)
            setPrevOrders(prevOrdersToDelete)
            closeAllActions()
            setIsDelete(true)
        } else {
            const newOrdersToDelete = [...newOrders]
            const priceToSub = parseFloat(newOrdersToDelete[0].price)
            setTotalPrice(totalPrice - priceToSub)
            newOrdersToDelete.splice(index, 1)
            setNewOrders(newOrdersToDelete)
            closeAllActions()
        }
    }
    function displayOrderTypeChange(display) {
        setDisplayOrderType(display)
        closeAllActions()
    }
    function addDescription(index) {
        console.log(index)

    }
    function newOrdersDiv() {
        return <><ul className={styles["order-items"]}>
            {newOrders.map((order, index) => (
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
                        <button onClick={() => openActions(index)}>
                            <i className="bi bi-three-dots"></i>
                        </button>
                    </div>

                    <div id={`new-${index}`} className={styles["order-item-actions-box"]}>
                        <button onClick={(index) => addDescription(index)}>
                            <i className="bi bi-file-text"> </i>
                        </button>
                        <button>
                            <i className="bi bi-percent"></i>
                        </button>
                        <button>
                            <i className="bi bi-basket3"></i>
                        </button>
                        <button onClick={() => deleteOrder(index)}>
                            <i className="bi bi-trash"></i>
                        </button>
                        <button onClick={() => closeActions(index)}>
                            <i className="bi bi-x-circle"></i>
                        </button>
                    </div>
                    <div className={styles["order-description"]}>
                        <div>
                            <h1>Açıklama Ekle</h1>
                            <div className={styles["new-description-input"]}>
                                <input
                                    id="new-description-input"
                                    type="text"
                                    placeholder="Açıklama"
                                />
                                <div className={styles["action-buttons"]}>
                                    <div className={styles["save-new-button"]}>
                                        <button >Kaydet</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </li>
            ))}
        </ul>
        </>

    }
    function prevOrdersDiv() {
        return <><ul className={styles["order-items"]}>
            {prevOrders.map((order, index) => (
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
                        <button onClick={() => openActions(index)}>
                            <i className="bi bi-three-dots"></i>
                        </button>
                    </div>

                    <div id={`prev-${index}`} className={styles["order-item-actions-box"]}>
                        <button onClick={(index) => addDescription(index)}>
                            <i className="bi bi-file-text"> </i>
                        </button>
                        <button>
                            <i className="bi bi-percent"></i>
                        </button>
                        <button>
                            <i className="bi bi-basket3"></i>
                        </button>
                        <button onClick={() => deleteOrder(index)}>
                            <i className="bi bi-trash"></i>
                        </button>
                        <button onClick={() => closeActions(index)}>
                            <i className="bi bi-x-circle"></i>
                        </button>
                    </div>
                    <div id={`prev-${index}`} className={styles["order-description"]}>
                        <div>
                            <h1>Açıklama Ekle</h1>
                            <div className={styles["new-description-input"]}>
                                <input
                                    id="new-description-input"
                                    type="text"
                                    placeholder="Açıklama"
                                />
                                <div className={styles["action-buttons"]}>
                                    <div className={styles["save-new-button"]}>
                                        <button >Kaydet</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </li>
            ))}
        </ul>
        </>
    }


    function changeCategory(e) {
        console.log("chosenCategory", chosenCategory)
        const categoryName = e.target.textContent
        const index = productCategory.findIndex(p => p.category == categoryName)
        setChosenCategory(productCategory[index])
        setChosenSubCategory(productCategory[index].subCategories[0])
    }

    useEffect(() => {
        console.log("products", products)
    }, [products])

    const setOrderToDB = async (isDelete) => {
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
                total_price: totalPrice,
                guest_count: guestCount
            };
            console.log("req body", requestBody)
            const response = await fetch("http://localhost:5000/orders", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })
            console.log("total orders,", totalOrders)
            if (response.ok && isDelete) {
                navigate("/tables")
            } else {
                console.log("Bir hata oluştu:", response.statusText);
            }
        } catch (error) {
            console.error("Hata:", error);
        }


    };
    useEffect(() => {
        console.log("chosenCategory", chosenCategory.subCategories)
        console.log("chosenSubCategory", chosenSubCategory)
        const index = chosenCategory?.subCategories?.findIndex(c => c.subCategoryName == chosenSubCategory)
        chosenCategory?.subCategories?.forEach((category, index) => {
            if (category.subCategoryName == chosenSubCategory) {
                setProducts(category.products)
            }
        })
    }, [chosenSubCategory])

    useEffect(()=>{
        setProducts(chosenCategory.subCategories?.[0].products)
    },[chosenCategory])

    function routePaymentScreen() {
        if (totalPrice > 0 && prevOrders.length > 0) {
            console.log(typeof totalPrice)
            navigate(`/payment/${table_id}`)
        }
    }
    return (
        <div className={staticStyles["containers"]}>
            <div className={staticStyles["middle-bar"]}>
                <div className={staticStyles["middle-bar-top-bar"]}>
                    <div className={staticStyles["go-back-button"]}>
                        <button onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-return-left"></i>
                        </button>
                    </div>
                    <div className={staticStyles["datetime"]}>
                        <Clock></Clock>
                    </div>
                    <div className={styles["people-count"]}>
                        <p>Kişi Sayısı</p>
                        <input className={styles["people-count-input"]} value={guestCount} type="number" onChange={(e) => setGuestCount(e.target.value)} />
                    </div>
                </div>

                <div className={styles["menu-items"]}>
                    <div className={styles["menu-items-sections"]}>
                        {productCategory.map((category, index) => (
                            <button onClick={() => setChosenCategory(productCategory[index])} > {category.category} </button>
                        ))}

                    </div>

                    <div className={styles["sub-menu-sections"]}>
                        {chosenCategory.subCategories?.map((category, index) => (
                            <button onClick={() => setChosenSubCategory(category.subCategoryName)} > {category.subCategoryName} </button>
                        ))}

                    </div>

                    <div className={styles["products"]}>
                        {isLoading ? (
                            <div className={styles["loading-state"]}>
                                <div className={styles["loading-spinner"]}></div>
                                <p>Menü yükleniyor...</p>
                            </div>
                        ) : products && products.length > 0 ? (
                            products.map((product, index) => (
                                <button 
                                    key={index}
                                    onClick={(event) => appendOrder(event)}
                                    className={styles["product-button"]}
                                    disabled={product.activeness !== "Active"}
                                >
                                    {product.activeness === "Active" ? (
                                        <>
                                            <span className={styles["product-name"]} id="product-name">{product.name}</span>
                                            <span className={styles["product-price"]} id="product-price">{product.price}</span>
                                        </>
                                    ) : (
                                        <span className={styles["product-disabled"]}>{product.name} (Pasif)</span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className={styles["no-products"]}>
                                <p>Bu kategoride ürün bulunamadı</p>
                            </div>
                        )}
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
                            <button className={styles["new-orders"]} onClick={() => displayOrderTypeChange("new")}>Yeni Siparişler</button>
                            <button className={styles["prev-orders"]} onClick={() => displayOrderTypeChange("prev")}>Eski Siparişler</button>
                        </div>


                        <div className={styles["orders"]}>
                            {(displayOrderType === "prev" ? prevOrdersDiv() : newOrdersDiv())}
                        </div>


                    </div>
                    <div className={styles["order-summary"]}>
                        <div className={styles["order-details"]}>
                            <p>Total: <span className={`${styles["price"]} ${styles["total-price"]}`}>{totalPrice} ₺</span></p>
                        </div>

                        <div className={styles["action-buttons"]}>
                            <div className={styles["action-container"]}>
                                <div className={styles["print-buttons"]}>
                                    <button onClick={() => setOrderToDB(true)} className={styles["send-order"]}>
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
