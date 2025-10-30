import { useEffect, useState } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import Tables from "../tables/Tables"
import Settings from "../settings/Settings"
import styles from './Orders.module.css'
import staticStyles from '../staticStyle/StaticStyle.module.css'
import LeftBar from "../staticStyle/LeftBar"
import Clock from "../staticStyle/Clock"
import { Link } from 'react-router-dom'

function Order() {
    const params = useParams()
    const table_id = (params["table_id"])
    const navigate = useNavigate()

    const [prevOrders, setPrevOrders] = useState([])
    const [groupedPrevOrdersByTime, setGroupedPrevOrdersByTime] = useState([])
    const [newOrders, setNewOrders] = useState([])
    const [displayOrderType, setDisplayOrderType] = useState("prev")
    const [totalPrice, setTotalPrice] = useState(0);
    const [productCategory, setProductCategory] = useState([])
    const [products, setProducts] = useState([])
    const [chosenCategory, setChosenCategory] = useState()
    const [chosenSubCategory, setChosenSubCategory] = useState()
    const [guestCount, setGuestCount] = useState(0)
    const [taxTotal, setTaxTotal] = useState(0)
    const [isDelete, setIsDelete] = useState(false)
    const [descriptionText, setDescriptionText] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [showDiscountService, setShowDiscountService] = useState(false)
    const [noteInput, setNoteInput] = useState("")
    const [addDescription, setAddDescription] = useState(false)
    const [displayServiceDiscount, setDisplayServiceDiscount] = useState(false)
    const [addDiscount, setAddDiscount] = useState(false)

    const [staticDiscount, setStaticDiscount] = useState([])
    const [staticServiceCharges, setStaticServiceCharges] = useState([])

    const [chosenDiscount, setChosenDiscount] = useState()
    //discount for check or item?
    const [checkDiscounts, setCheckDiscounts] = useState([])
    const [discountFor, setDiscountFor] = useState("item")
    const [discounts, setDiscounts] = useState(0)
    const [newDiscountTypes, setNewDiscountTypes] = useState("new")

    const [itemDiscountIndex, setItemDiscountIndex] = useState([null, null])
    const [checkDiscountOpen, setCheckDiscountOpen] = useState(false)

    const [chosenServiceCharge, setChosenServiceCharge] = useState()
    const [newServiceChargeTypes, setNewServiceChargeTypes] = useState("new")
    const [checkServiceCharges, setCheckServiceCharges] = useState([])
    const [checkServiceOpen, setCheckServiceOpen] = useState(false)
    const [serviceChargeTotal, setServiceChargeTotal] = useState(0)

    useEffect(() => {
        const getOrderFromDB = async () => {
            try {
                console.log("table id is ", table_id)
                const getOrdersResponse = await fetch(`http://127.0.0.1:5000/get_table_order/${table_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                })
                if (getOrdersResponse.ok) {
                    const getOrdersData = await getOrdersResponse.json()
                    setDiscounts(parseFloat(getOrdersData[0].total_discount))
                    setServiceChargeTotal(parseFloat(getOrdersData[0].total_service_charge))
                    setCheckServiceCharges(getOrdersData[0].checkservicecharges)
                    setCheckDiscounts(getOrdersData[0].checkdiscounts)
                    setPrevOrders([...getOrdersData[0].products])
                    setTotalPrice(parseFloat(getOrdersData[0].total_price))
                    setGuestCount(getOrdersData[0].guest_count)
                    setTaxTotal(getOrdersData[0].tax_total)

                } else {
                    console.log("error happened", getOrdersResponse.statusText)
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
            console.log("staticCategory", staticCategory)
            const staticProducts = JSON.parse(localStorage.getItem("Products"))
            console.log("discounts ", JSON.parse(localStorage.getItem("Discounts")))
            setStaticDiscount(JSON.parse(localStorage.getItem("Discounts")))
            console.log("staticservice", JSON.parse(localStorage.getItem("ServiceCharges")))

            setStaticServiceCharges(JSON.parse(localStorage.getItem("ServiceCharges")))
            if (!staticCategory || !staticProducts) {
                console.error("Menu or Products data not found in localStorage")
                setIsLoading(false)
                return
            }
            setProductCategory(staticCategory)
            setProducts(staticProducts)
            console.log("category", staticCategory)
            console.log("firstuppercategoryfirstuppercategoryfirstuppercategoryfirstuppercategory", staticCategory.filter(c => c.ui_index == 0))

            const firstUpperCategory = staticCategory.filter(c => c.ui_index == 0)[0].id
            console.log("firstuppercategory", firstUpperCategory)
            setChosenCategory(firstUpperCategory)
            const firstSubCategory = staticCategory.filter(c => c.parent_id == firstUpperCategory)[0]?.id
            console.log("firstSubCategory", firstSubCategory)
            setChosenSubCategory(firstSubCategory)

            /*staticCategory.forEach((item, index) => {
                const category = item.categoryName
                const subCategoryProducts = []
                if (item.subCategories.length > 0) {
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
            })*/
            /*console.log("asd", tempCategories)
            setProductCategory(tempCategories)
            if (tempCategories.length > 0) {
                setChosenCategory(tempCategories[0])
                if (tempCategories[0].subCategories && tempCategories[0].subCategories.length > 0) {
                    setChosenSubCategory(tempCategories[0].subCategories[0])
                    setProducts(tempCategories[0].subCategories[0].products)
                } else if (tempCategories[0].products) {
                    setProducts(tempCategories[0].products)
                }
            }*/
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
        console.log("taxTotal", taxTotal)
    }, [taxTotal])
    useEffect(() => {
        console.log("itemdiscountindex", itemDiscountIndex)
    }, [itemDiscountIndex])
    function appendOrder(product) {
        const productName = product.name
        const productPrice = product.price
        const taxPercent = product.tax_percent
        setDisplayOrderType("new");
        const new_date = new Date();
        console.log("asdfsdfa", product)
        const time = (new_date.toLocaleTimeString('tr-TR', { hour: "numeric", minute: "numeric" }))
        const existingIndex = newOrders.findIndex(order => order.name === productName && order.note == undefined && order.onHouse == undefined)
        if (existingIndex !== -1) {
            console.log("-1")
            const updatedOrders = [...newOrders]
            updatedOrders[existingIndex].amount += 1
            updatedOrders[existingIndex].price += productPrice
            updatedOrders[existingIndex].time = time
            setNewOrders(updatedOrders)
            console.log("neworders", newOrders)
        } else {
            const newOrder = {
                id: product.id,
                amount: 1,
                name: productName,
                price: productPrice,
                discounts: [],
                time: time,
                related_recipe_id: product.related_recipe_id,               
                taxPercent: taxPercent
            }
            console.log("neworders", newOrders)
            setNewOrders([...newOrders, newOrder]);
        }
        const tax = Number((productPrice * (taxPercent / (100 + taxPercent))).toFixed(2))
        console.log("tax is ", tax, "tax total is ", taxTotal)
        setTaxTotal(Number((taxTotal + tax).toFixed(2)))
        const newTotalPrice = totalPrice + Number(productPrice);
        setTotalPrice(newTotalPrice);
    }

    function closeActions(index) {
        if (displayOrderType == "prev") {
            const actionBox = document.querySelector(`#prev-${index}`)
            actionBox.style.display = "none"
        } else {
            const actionBox = document.querySelector(`#new-${index}`)
            actionBox.style.display = "none"
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
    function openActions(index, groupIndex) {
        console.log("group", groupIndex, "index", index)
        if (displayOrderType == "prev") {
            const group = document.getElementsByClassName(styles["order-items"])[0].childNodes[groupIndex]
            const actionBox = group.querySelector(`#prev-${index}`)
            actionBox.style.display = "flex"
        } else if (displayOrderType == "new") {
            const actionBox = document.querySelector(`#new-${index}`)
            actionBox.style.display = "flex"
        }
    }
    useEffect(() => {
        if (isDelete) {
            setOrderToDB(false)
            setIsDelete(false)
        }
    }, [isDelete])

    useEffect(() => {
        const grouped_orders = prevOrders.reduce((acc, order) => {
            if (!acc[order.time]) {
                acc[order.time] = []
            }
            acc[order.time].push(order);
            return acc
        }, {})
        setGroupedPrevOrdersByTime(grouped_orders)
        console.log(grouped_orders)
    }, [prevOrders])

    function deleteOrder(index, groupIndex) {
        if (displayOrderType == "prev") {
            console.log(groupIndex)
            console.log("groupedPrevOrdersByTime[groupIndex]", groupedPrevOrdersByTime[groupIndex][index])
            const prevOrdersToDelete = { ...groupedPrevOrdersByTime }
            console.log("prevOrdersToDelete[groupIndex][index]", prevOrdersToDelete[groupIndex][index])
            if (prevOrdersToDelete[groupIndex][index].onHouse) {
                prevOrdersToDelete[groupIndex][index].onHouse = false
            }
            if (prevOrdersToDelete[groupIndex][index].discounts.length > 0) {
                prevOrdersToDelete[groupIndex][index].discounts = []
                setTotalPrice(totalPrice - prevOrdersToDelete[index].discountedPrice)
                delete prevOrdersToDelete[groupIndex][index].discountedPrice
            } else {
                console.log(prevOrdersToDelete)
                setTotalPrice(totalPrice - prevOrdersToDelete[groupIndex][index].price)
            }
            if (prevOrdersToDelete[groupIndex].length == 1) {
                delete prevOrdersToDelete[groupIndex]
            } else {
                prevOrdersToDelete[groupIndex].splice(index, 1)
            }
            setGroupedPrevOrdersByTime(prevOrdersToDelete)

        } else {
            const newOrdersToDelete = [...newOrders]
            console.log(newOrdersToDelete)
            if (newOrdersToDelete[index].onHouse) {
                newOrdersToDelete[index].onHouse = false
            }
            if (newOrdersToDelete[index].discounts.length > 0) {
                newOrdersToDelete[index].discounts = []
                setTotalPrice(totalPrice - newOrdersToDelete[index].discountedPrice)
                delete newOrdersToDelete[index].discountedPrice
            } else {
                console.log(newOrdersToDelete)
                setTotalPrice(totalPrice - newOrdersToDelete[index].price)
            }
            newOrdersToDelete.splice(index, 1)
            setNewOrders(newOrdersToDelete)
        }
        setIsDelete(true)
        closeAllActions()
    }
    function displayOrderTypeChange(display) {
        setDisplayOrderType(display)
        closeAllActions()
    }



    function saveDescription(index) {
        const tempNewOrders = [...newOrders]
        if (tempNewOrders[index].note) {
            tempNewOrders[index].note.push(noteInput)

        } else {
            tempNewOrders[index].note = [noteInput]
        }
        setNewOrders(tempNewOrders)
        setAddDescription(false)
    }
    useEffect(() => {
        console.log("cd", checkDiscounts)
    }, [checkDiscounts])

    function saveDiscount(discountForWhat, index, groupIndex) {
        const updateOrderDiscountsForItem = (orders, setOrders) => {
            console.log("index is ", index, groupIndex)
            const tempOrders = displayOrderType == "prev" ? { ...groupedPrevOrdersByTime } : [...orders]
            const order = displayOrderType == "prev" ? tempOrders[groupIndex][index] : tempOrders[index]
            console.log(order)
            if (!order.discounts) {
                order.discounts = []
                order.discountedPrice = order.price
            }
            const tempChosenDiscount = chosenDiscount
            if (chosenDiscount.is_fixed) {
                tempChosenDiscount.discountAmount = chosenDiscount.amount
                order.discountedPrice = order.price - chosenDiscount.amount
                setTotalPrice(totalPrice - chosenDiscount.amount)
                setDiscounts(discounts + chosenDiscount.amount)

            }
            else {
                tempChosenDiscount.discountAmount = order.price * chosenDiscount.amount / 100
                order.discountedPrice = order.price - (order.price * chosenDiscount.amount / 100)
                setDiscounts(discounts + order.price * chosenDiscount.amount / 100)
                setTotalPrice(totalPrice - (order.price * chosenDiscount.amount / 100))
            }
            order.discounts.push(tempChosenDiscount)
            setOrders(tempOrders);
            setChosenDiscount()
            setAddDiscount(false);
        }
        const updateOrderDiscountsForCheck = () => {
            let tempChosenDiscount = chosenDiscount
            if (chosenDiscount.is_fixed) {
                tempChosenDiscount.discountAmount = chosenDiscount.amount
                setDiscounts(discounts + chosenDiscount.amount)
                setTotalPrice(totalPrice - chosenDiscount.amount)
            } else {
                tempChosenDiscount.discountAmount = totalPrice * (chosenDiscount.amount / 100)
                setDiscounts(discounts + totalPrice * (chosenDiscount.amount / 100))
                setTotalPrice(totalPrice - totalPrice * (chosenDiscount.amount / 100))
            }
            setCheckDiscounts(prev => (
                [...prev, tempChosenDiscount]
            ))
            setChosenDiscount()
            setAddDiscount(false)

        }
        if (discountForWhat === "item") {
            if (displayOrderType === "prev") {
                updateOrderDiscountsForItem(groupedPrevOrdersByTime, setGroupedPrevOrdersByTime)
            } else {
                updateOrderDiscountsForItem(newOrders, setNewOrders)
            }
        } else {
            updateOrderDiscountsForCheck()
        }
    }

    function saveCheckServiceCharge() {
        setCheckServiceCharges(prev => [...prev, chosenServiceCharge])
        if (chosenServiceCharge.serviceChargeType == "Percentage") {
            setServiceChargeTotal(serviceChargeTotal + totalPrice * (chosenServiceCharge.serviceChargeAmount / 100))
            setTotalPrice(totalPrice + totalPrice * (chosenServiceCharge.serviceChargeAmount / 100))
        } else {
            setServiceChargeTotal(serviceChargeTotal + chosenServiceCharge.serviceChargeAmount)
            setTotalPrice(totalPrice + chosenServiceCharge.serviceChargeAmount)
        }
        setCheckServiceOpen(false)
    }

    function deleteCheckService(index) {
        const tempCheckServiceCharges = [...checkServiceCharges]
        if (tempCheckServiceCharges[index].serviceChargeType == "Percentage") {
            setTotalPrice(totalPrice * (100 / (100 + chosenServiceCharge.serviceChargeAmount)))
            setServiceChargeTotal(serviceChargeTotal - totalPrice * (10 / (100 + chosenServiceCharge.serviceChargeAmount)))
        } else {
            setTotalPrice(totalPrice - chosenServiceCharge.serviceChargeAmount)
            setServiceChargeTotal(serviceChargeTotal - chosenServiceCharge.serviceChargeAmount)
        }
        tempCheckServiceCharges.splice(index, 1)
        setCheckServiceCharges(tempCheckServiceCharges)
    }

    function deleteCheckDiscount(index) {
        const tempCheckDiscounts = [...checkDiscounts]
        setTotalPrice(totalPrice + tempCheckDiscounts[index].discountAmount)
        tempCheckDiscounts.splice(index, 1)
        setCheckDiscounts(tempCheckDiscounts)
    }
    function deleteItemDiscount(group_index, index, discountIndex) {
        if (displayOrderType == "prev") {
            const orders = { ...groupedPrevOrdersByTime }
            console.log(group_index)
            console.log(orders[group_index][index].discounts[index])

            orders[group_index][index].discountedPrice += orders[group_index][index].discounts[discountIndex].discountAmount

            if (orders[group_index][index].discountedPrice == orders[group_index][index].price) {
                console.log("eşit")
                delete orders[group_index][index].discountedPrice
            }
            orders[group_index][index].discounts.splice(discountIndex, 1)
            setGroupedPrevOrdersByTime(orders)
        } else {
            const orders = [...newOrders]
        }
    }
    useEffect(() => {
        console.log(groupedPrevOrdersByTime)
    }, [groupedPrevOrdersByTime])
    useEffect(() => {
        console.log("type", typeof (totalPrice))
        console.log("totalprice", totalPrice)
    }, [totalPrice])
    function onHouse(index, groupIndex) {
        if (displayOrderType == "prev") {
            console.log("asd")
            const tempPrevOrders = { ...groupedPrevOrdersByTime }
            console.log(tempPrevOrders[groupIndex])
            const price = parseFloat(tempPrevOrders[groupIndex][index].price)
            console.log("tempPrevOrders[index].onHouse", tempPrevOrders[groupIndex][index].onHouse)
            if (tempPrevOrders[groupIndex][index].onHouse) {
                tempPrevOrders[groupIndex][index].onHouse = false
                console.log(totalPrice + price)
                setTotalPrice(totalPrice + price)
            } else {
                tempPrevOrders[groupIndex][index].onHouse = true
                console.log(totalPrice - price)
                setTotalPrice(totalPrice - price)
            }
            setGroupedPrevOrdersByTime(tempPrevOrders)
            closeAllActions()
        } else {
            const tempNewOrders = [...newOrders]
            const price = parseFloat(tempNewOrders[index].price)
            console.log("tempNewOrders[index].onHouse", tempNewOrders[index].onHouse)
            if (tempNewOrders[index].onHouse) {
                tempNewOrders[index].onHouse = false
                console.log(totalPrice + price)
                setTotalPrice(totalPrice + price)
            } else {
                tempNewOrders[index].onHouse = true
                console.log(totalPrice - price)
                setTotalPrice(totalPrice - price)
            }
            setNewOrders(tempNewOrders)
            closeAllActions()
        }
    }
    function newOrdersDiv() {
        return <><ul className={styles["order-items"]}>
            {newOrders.map((order, index) => (
                <li key={index}>
                    <div className={styles["product-amount"]}>
                        <span>{order["amount"]}</span>
                    </div>
                    <div className={styles["order-name"]}>
                        <span>{order["name"]}</span>
                        {order.note && <div className={styles["order-note"]}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                                <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                            </svg>
                            <span> {order.note} </span>
                        </div>}
                    </div>

                    <div className={styles["price"]}>
                        {order.onHouse ?
                            (<span>İKRAM</span>) : (order.discountedPrice ? <><del>{order["price"]} ₺</del> <span>{order["discountedPrice"]}₺</span></> : <span>{order["price"]}₺</span>)
                        }

                    </div>

                    <div className={styles["order-item-actions"]}>
                        <button onClick={() => openActions(index)}>
                            <i className="bi bi-three-dots-vertical"></i>

                        </button>
                    </div>

                    <div id={`new-${index}`} className={styles["order-item-actions-box"]}>
                        <button onClick={() => { setAddDescription(!addDescription), closeAllActions() }}>
                            <i className="bi bi-file-text"> </i>
                        </button>
                        <button onClick={() => setItemDiscountIndex(index)}>
                            <i className="bi bi-percent"></i>
                        </button>
                        <button onClick={() => onHouse(index)} >
                            <i className="bi bi-basket3"></i>
                        </button>
                        <button onClick={() => deleteOrder(index)}>
                            <i className="bi bi-trash"></i>
                        </button>
                        <button onClick={() => closeActions(index)}>
                            <i className="bi bi-x-circle"></i>
                        </button>
                    </div>
                    {itemDiscountIndex == index && (
                        <div id={`new-${index}`} className={styles["product-discount-container"]}>
                            <div className={styles["product-discount"]}>
                                <div className={styles["order-note-header"]}>
                                    <h1>İndirim Uygula</h1>
                                </div>
                                <div className={styles["defined-discount-types"]}>
                                    <div className={styles["prev-new-discounts"]} >
                                        <button className={newDiscountTypes == "new" ? styles["chosen-discount"] : ""} onClick={() => setNewDiscountTypes("new")} >Yeni İndirim</button>
                                        <button className={newDiscountTypes == "prev" ? styles["chosen-discount"] : ""} onClick={() => setNewDiscountTypes("prev")}>Uygulanan İndirimler</button>
                                    </div>
                                    {newDiscountTypes == "new" ? <>
                                        {staticDiscount.map((discount, index) => (
                                            <div onClick={() => setChosenDiscount(discount)} className={chosenDiscount == discount ? `${styles["defined-discount-active"]} ${styles["defined-discount"]}` : styles["defined-discount"]}>
                                                <h1>{discount.name}</h1>
                                                <p> {discount.is_fixed ? `Sabit ${discount.amount}%` : `Yüzdesel ${discount.amount} ₺`} </p>
                                            </div>
                                        ))
                                        }
                                        <div className={styles["manual-discount-input"]}>
                                            <p>Farklı bir ücret girmek için:</p>
                                            <input value="Tutar giriniz.." onChange={(e) => setChosenDiscount({ discountAmount: e.target.value, discountName: "Custom Discount", discountType: "Fixed" })} type="number" name="" id="" />
                                        </div></> :
                                        <div className={styles["applied-discount"]}>
                                            {discountFor == "item" ? order?.discounts?.map((discount, itemDiscountIndex) => (
                                                <div>
                                                    <p>{discount.name}
                                                        <svg onClick={() => deleteItemDiscount(null, index, itemDiscountIndex)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                        </svg>
                                                    </p>
                                                </div>
                                            )) : checkDiscounts.map((discount, checkDiscountIndex) => (
                                                <div onClick={() => deleteCheckDiscount(checkDiscountIndex)}>
                                                    <p>{discount.name}
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                        </svg>
                                                    </p>
                                                </div>
                                            ))}

                                        </div>
                                    }
                                </div>
                                <div className={styles["discount-action-buttons"]}>
                                    <div onClick={() => { setItemDiscountIndex([null, null]); setChosenDiscount() }} className={styles["discount-cancel-new-button"]}>
                                        <button>İptal</button>
                                    </div>
                                    <div onClick={() => saveDiscount("item", index, null)} className={styles["discount-save-new-button"]}>
                                        <button>Kaydet</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    }
                    {addDescription &&
                        <div id={`new-${index}`} className={styles["order-note-container"]}>
                            <div className={styles["order-notes"]}>
                                <div className={styles["order-note-header"]}>
                                    <h1>Not Ekle</h1>
                                </div>
                                <div className={styles["previous-notes-container"]}>
                                    <div className={styles["previous-notes-header"]}>
                                        <h2>Önceki notlar</h2>
                                    </div>
                                    <div className={styles["previous-notes"]}>
                                        {Array.isArray(order?.note) &&
                                            order?.note?.map((note, index) => (
                                                <div className={styles["previous-note"]}>
                                                    <button>{note}</button>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                                    </svg>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                                <div className={styles["new-note-input"]}>
                                    <textarea onChange={(e) => setNoteInput(e.target.value)} name="" id=""></textarea>
                                </div>
                                <div className={styles["note-action-buttons"]}>
                                    <div className={styles["note-cancel-new-button"]}>
                                        <button onClick={() => setAddDescription(!addDescription)}>İptal</button>
                                    </div>
                                    <div className={styles["note-save-new-button"]}>
                                        <button onClick={() => saveDescription(index)}>Kaydet</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                </li>
            ))}
        </ul>
        </>

    }
    function prevOrdersDiv() {
        return <><ul className={styles["order-items"]}>
            {Object.entries(groupedPrevOrdersByTime).map((groupOrders, groupIndex) => (
                <div key={groupIndex} >
                    <p>{groupOrders[0]}</p>
                    {groupOrders[1].map((order, index) => (
                        <li key={index}>
                            <div className={styles["product-amount"]}>
                                <span>{order["amount"]}</span>
                            </div>
                            <div className={styles["order-name"]}>
                                <span>{order["name"]}</span>
                                {order.note && <div className={styles["order-note"]}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                                        <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                                        <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                                    </svg>
                                    <span> {order.note} </span>
                                </div>}
                            </div>

                            <div className={styles["price"]}>
                                {order.onHouse ?
                                    (<span>İKRAM</span>) : (order.discountedPrice ? <><del>{order["price"]} ₺</del> <span>{order["discountedPrice"]}₺</span></> : <span>{order["price"]}₺</span>)
                                }

                            </div>


                            <div className={styles["order-item-actions"]}>
                                <button onClick={() => openActions(index, groupIndex)}>
                                    <i className="bi bi-three-dots"></i>
                                </button>
                            </div>

                            <div id={`prev-${index}`} className={styles["order-item-actions-box"]}>
                                <button onClick={() => { setItemDiscountIndex([groupOrders[0], index]), setDiscountFor("item"), closeAllActions() }}>
                                    <i className="bi bi-percent"></i>
                                </button>
                                <button onClick={() => { onHouse(index, groupOrders[0]), closeAllActions() }}>
                                    <i className="bi bi-basket3"></i>
                                </button>
                                <button onClick={() => { deleteOrder(index, groupOrders[0]), closeAllActions() }}>
                                    <i className="bi bi-trash"></i>
                                </button>
                                <button onClick={() => { closeActions(index), closeAllActions() }}>
                                    <i className="bi bi-x-circle"></i>
                                </button>
                            </div>
                            {itemDiscountIndex[0] == groupOrders[0] && itemDiscountIndex[1] == index && (
                                <div id={`prev-${index}`} className={styles["product-discount-container"]}>
                                    <div className={styles["product-discount"]}>
                                        <div className={styles["order-note-header"]}>
                                            <h1>İndirim Uygula</h1>
                                        </div>
                                        <div className={styles["defined-discount-types"]}>
                                            <div className={styles["prev-new-discounts"]} >
                                                <button className={newDiscountTypes == "new" ? styles["chosen-discount"] : ""} onClick={() => setNewDiscountTypes("new")} >Yeni İndirim</button>
                                                <button className={newDiscountTypes == "prev" ? styles["chosen-discount"] : ""} onClick={() => setNewDiscountTypes("prev")}>Uygulanan İndirimler</button>
                                            </div>
                                            {newDiscountTypes == "new" ? <>
                                                {staticDiscount.map((discount, index) => (
                                                    <div onClick={() => setChosenDiscount(discount)} className={chosenDiscount == discount ? `${styles["defined-discount-active"]} ${styles["defined-discount"]}` : styles["defined-discount"]}>
                                                        <h1>{discount.name}</h1>
                                                        <p> {discount.is_fixed ? `Sabit ${discount.amount}%` : `Yüzdesel ${discount.amount} ₺`} </p>
                                                    </div>
                                                ))
                                                }
                                                <div className={styles["manual-discount-input"]}>
                                                    <p>Farklı bir ücret girmek için:</p>
                                                    <input onChange={(e) => setChosenDiscount({ discountAmount: e.target.value, discountName: "Custom Discount", discountType: "Fixed" })} type="number" name="" id="" />
                                                </div></> :
                                                <div className={styles["applied-discount"]}>
                                                    {discountFor == "item" ? order?.discounts?.map((discount, itemDiscountIndex) => (
                                                        <div>
                                                            <p>{discount.name}
                                                                <svg onClick={() => deleteItemDiscount(groupOrders[0], index, itemDiscountIndex)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                                </svg>
                                                            </p>
                                                        </div>
                                                    )) : checkDiscounts.map((discount, checkDiscountIndex) => (
                                                        <div onClick={() => deleteCheckDiscount(checkDiscountIndex)}>
                                                            <p>{discount.name}aasdfasdf
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                                </svg>
                                                            </p>
                                                        </div>
                                                    ))}

                                                </div>
                                            }
                                        </div>
                                        <div className={styles["discount-action-buttons"]}>
                                            <div onClick={() => { setItemDiscountIndex([null, null]); setChosenDiscount() }} className={styles["discount-cancel-new-button"]}>
                                                <button>İptal</button>
                                            </div>
                                            <div onClick={() => saveDiscount("item", index, groupOrders[0])} className={styles["discount-save-new-button"]}>
                                                <button>Kaydet</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                            }
                        </li>
                    ))}</div>
            ))}
        </ul>
        </>
    }


    const setOrderToDB = async (isDelete) => {
        const totalOrders = []
        const asd = []
        Object.entries(groupedPrevOrdersByTime).forEach((group, indx) => (
            group[1].forEach((order, _) => {
                asd.push(order)
            })
        ))
        asd.forEach(prev => totalOrders.push({ ...prev }))
        newOrders.forEach(newOrder => {
            const existingIndex = totalOrders.findIndex(order => order.name === newOrder.name && order.note == undefined && order.time == newOrder.time)
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
                guest_count: guestCount,
                checkDiscounts: checkDiscounts,
                total_discount: discounts,
                total_service_charge: serviceChargeTotal,
                checkServiceCharges: checkServiceCharges,
                tax_total: taxTotal
            }
            console.log("req body", requestBody)
            const token = localStorage.getItem("token")
            const response = await fetch("http://localhost:5000/orders", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    function changeCategory(category_id) {
        setChosenCategory(category_id)
        const firstSubCategory = productCategory.filter(sc => sc.parent_id == category_id)[0]?.id
        setChosenSubCategory(firstSubCategory)
        console.log("first sub", firstSubCategory)
    }

    function routePaymentScreen() {
        if (totalPrice > 0 && prevOrders.length > 0) {
            navigate(`/payment/${table_id}`)
        }
    }
    return (
        <div className={staticStyles["containers"]}>
            <div className={staticStyles["middle-bar"]}>
                <div className={staticStyles["middle-bar-top-bar"]}>
                    <div className={staticStyles["go-back-button"]}>
                        <button onClick={() => navigate("/tables")}>
                            <i className="bi bi-arrow-left"></i>
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
                        {productCategory.filter(sc => sc.parent_id == null).sort((a, b) => a.ui_index - b.ui_index).map((category, index) => (
                            <button style={{backgroundColor: category.id == chosenCategory ? "#3B82F6" : "",
                                            color: category.id == chosenCategory ? "white" : ""}} onClick={() => changeCategory(category.id)} > {category.name} </button>
                        ))}

                    </div>

                    <div className={styles["sub-menu-sections"]}>
                        {productCategory.filter(sc => sc.parent_id == chosenCategory).map((category, index) => (
                            <button style={{
                                backgroundColor: category.id == chosenSubCategory ? "#3B82F6" : "",
                                color: category.id == chosenSubCategory ? "white" : ""

                            }}
                                onClick={() => setChosenSubCategory(category.id)}>{category.name} </button>
                        ))}
                    </div>

                    <div className={styles["products"]}>
                        {isLoading ? (
                            <div className={styles["loading-state"]}>
                                <div className={styles["loading-spinner"]}></div>
                                <p>Menü yükleniyor...</p>
                            </div>
                        ) : products && products.length > 0 ? (
                            products.filter(p => chosenSubCategory !== undefined ? p.category_id === chosenSubCategory : p.category_id === chosenCategory).map((product, index) => (
                                <button
                                    key={index}
                                    onClick={() => appendOrder(product)}
                                    className={styles["product-button"]}
                                >
                                    {product.activeness === true ? (
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
                    <div onClick={() => setDisplayServiceDiscount(!displayServiceDiscount)} className={styles["order-id"]}>
                        <div>
                            <p>Masa Numarası: <span id="table-id">{table_id}</span></p>
                            {displayServiceDiscount && <div className={styles["service-discounts-input-box-container"]}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                                    <path  d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                                </svg>
                                <div className={styles["service-discounts-input-box-options"]}>
                                    <div onClick={() => { setCheckDiscountOpen(true); setDiscountFor("check") }} className={styles["service-discounts-input-box-option"]} >
                                        <p>İndirim Uygula</p>
                                    </div>
                                    <div onClick={() => setCheckServiceOpen(true)} className={styles["service-discounts-input-box-option"]}>
                                        <p>Servis Ücreti Uygula</p>
                                    </div>
                                    <div className={styles["service-discounts-input-box-option"]}>
                                        <p>Çek Birleştir</p>
                                    </div>
                                    <div className={styles["service-discounts-input-box-option"]}>
                                        <p>Çek Sil</p>
                                    </div>
                                </div>
                            </div>}

                        </div>
                        <p>Order ID: <span>1</span></p>
                    </div>
                    <div className={styles["order-details"]} > </div>
                    <div className={styles["order-list"]}>
                        <div className={styles["new-prev-orders"]}>
                            <button style={{ backgroundColor: displayOrderType == "new" ? "rgb(75 85 99)" : "" }} className={styles["new-orders"]} onClick={() => displayOrderTypeChange("new")}>Yeni Siparişler</button>
                            <button style={{ backgroundColor: displayOrderType == "prev" ? "rgb(75 85 99)" : "" }} className={styles["prev-orders"]} onClick={() => displayOrderTypeChange("prev")}>Eski Siparişler</button>
                        </div>


                        <div className={styles["orders"]}>
                            {(displayOrderType === "prev" ? prevOrdersDiv() : newOrdersDiv())}
                        </div>


                    </div>
                    <div className={styles["order-summary"]}>
                        <div className={styles["order-details"]}>
                            <i onClick={() => setShowDiscountService(!showDiscountService)} className="bi bi-arrow-up-short"></i>
                            {showDiscountService && <div className={styles["service-discounts"]}>
                                <p>İndirim: {discounts}₺</p>
                                <p>Servis Ücreti: {serviceChargeTotal}₺</p>
                            </div>}
                            <p>Total: <span className={`${styles["price"]} ${styles["total-price"]}`}>{totalPrice}₺</span></p>
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
            {checkDiscountOpen && (
                <div className={styles["product-discount-container"]}>
                    <div className={styles["product-discount"]}>
                        <div className={styles["order-note-header"]}>
                            <h1>İndirim Uygula</h1>
                        </div>
                        <div className={styles["defined-discount-types"]}>
                            <div className={styles["prev-new-discounts"]} >
                                <button className={newDiscountTypes == "new" ? styles["chosen-discount"] : ""} onClick={() => setNewDiscountTypes("new")}  >Yeni İndirim</button>
                                <button className={newDiscountTypes == "prev" ? styles["chosen-discount"] : ""} onClick={() => setNewDiscountTypes("prev")}>Uygulanan İndirimler</button>
                            </div>
                            {newDiscountTypes == "new" ? <>
                                {staticDiscount.map((discount, index) => (
                                    <div onClick={() => setChosenDiscount(discount)} className={chosenDiscount == discount ? `${styles["defined-discount-active"]} ${styles["defined-discount"]}` : styles["defined-discount"]}>
                                        <h1>{discount.name}</h1>
                                        <p> {discount.is_fixed ? `Sabit ${discount.amount}₺` : `Yüzdesel ${discount.amount}%`} </p>
                                    </div>
                                ))
                                }
                                <div className={styles["manual-discount-input"]}>
                                    <p>Farklı bir ücret girmek için:</p>
                                    <input onChange={(e) => setChosenDiscount({ discountAmount: e.target.value, discountName: "Custom Discount", discountType: "Fixed" })} type="number" name="" id="" />
                                </div></> :
                                <div className={styles["applied-discount"]}>
                                    {checkDiscounts.map((discount, checkDiscountIndex) => (
                                        <div onClick={() => deleteCheckDiscount(checkDiscountIndex)}>
                                            <p>{discount.name}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                </svg>
                                            </p>
                                        </div>
                                    ))}

                                </div>
                            }
                        </div>
                        <div className={styles["discount-action-buttons"]}>
                            <div onClick={() => { setCheckDiscountOpen(false); setChosenDiscount() }} className={styles["discount-cancel-new-button"]}>
                                <button>İptal</button>
                            </div>
                            <div onClick={() => saveDiscount(discountFor == "check")} className={styles["discount-save-new-button"]}>
                                <button>Kaydet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {checkServiceOpen && (
                <div className={styles["product-discount-container"]}>
                    <div className={styles["product-discount"]}>
                        <div className={styles["order-note-header"]}>
                            <h1>Servis Ücreti Uygula</h1>
                        </div>
                        <div className={styles["defined-discount-types"]}>
                            <div className={styles["prev-new-discounts"]} >
                                <button className={newServiceChargeTypes == "new" ? styles["chosen-discount"] : ""} onClick={() => setNewServiceChargeTypes("new")}  >Yeni Servis Ücreti</button>
                                <button className={newServiceChargeTypes == "prev" ? styles["chosen-discount"] : ""} onClick={() => setNewServiceChargeTypes("prev")}>Uygulanan Servis Ücretleri</button>
                            </div>
                            {newServiceChargeTypes == "new" ? <>
                                {staticServiceCharges.map((charge, index) => (
                                    console.log("charge", charge),
                                    <div onClick={() => setChosenServiceCharge(charge)} className={chosenServiceCharge == charge ? `${styles["defined-discount-active"]} ${styles["defined-discount"]}` : styles["defined-discount"]}>
                                        <h1>{charge.name}</h1>
                                        <p> {charge.is_fixed ? `Sabit ${charge.amount} ₺` : `Yüzdesel ${charge.amount}%` } </p>
                                    </div>
                                ))
                                }
                                <div className={styles["manual-discount-input"]}>
                                    <p>Farklı bir ücret girmek için:</p>
                                    <input placeholder="Tutar Giriniz.." onChange={(e) => setChosenServiceCharge({ chosenServiceCharge: e.target.value, serviceChargeName: "Custom Discount", serviceChargeType: "Fixed" })} type="number" name="" id="" />
                                </div></> :
                                <div className={styles["applied-discount"]}>
                                    {checkServiceCharges.length > 0 ? (checkServiceCharges.map((charge, checkServiceIndex) => (
                                        <div>
                                            <p>{charge.serviceChargeName}
                                                <svg onClick={() => deleteCheckService(checkServiceIndex)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                </svg>
                                            </p>
                                        </div>)
                                    )): 
                                    <div>
                                        <p> Uygulanmış indirim bulunmamakta..
                                        </p>
                                    </div>}

                                </div>
                            }
                        </div>
                        <div className={styles["discount-action-buttons"]}>
                            <div onClick={() => { setCheckServiceOpen(false); setChosenServiceCharge() }} className={styles["discount-cancel-new-button"]}>
                                <button>İptal</button>
                            </div>
                            <div onClick={() => saveCheckServiceCharge()} className={styles["discount-save-new-button"]}>
                                <button>Kaydet</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Order;