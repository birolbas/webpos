import { use, useEffect, useState } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import Tables from "../tables/Tables"
import Settings from "../settings/Settings"
import styles from './Orders.module.css'
import staticStyles from '../staticStyle/StaticStyle.module.css'
import LeftBar from "../staticStyle/LeftBar"
import Clock from "../staticStyle/Clock"
import { Link } from 'react-router-dom'
import inputButtons from './Payment.module.css'
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
    const [productsCost, setProductsCost] = useState(0)

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
    const [staticCondiments, setStaticCondiments] = useState([])
    const [staticDiscount, setStaticDiscount] = useState([])
    const [staticServiceCharges, setStaticServiceCharges] = useState([])

    const [appliedToHowManyBox, setAppliedToHowManyBox] = useState(false)
    const [howManyFunction, setHowManyFunction] = useState(null)
    const [howManyIndexes, setHowManyIndexes] = useState([null, null])
    const [howManyInput, setHowManyInput] = useState(0)
    const [maxHowMany, setMaxHowMany] = useState(null)
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


    const [condimentInputBox, setCondimentInputBox] = useState(false)
    const [productToAddCondiment, setProductToAddCondiment] = useState(null)
    const [activeCondiment, setActiveCondiment] = useState(null)
    const [groupedCondimentOrders, setGroupedCondimentItems] = useState([])
    const [condimentTotal, setCondimentTotal] = useState(0)


    const setGuestCountToDB = async (temp_table_id) => {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:5000/setGuestCount", {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                table_id: table_id,
                guest_count: temp_table_id
            })
        })
        if (response.ok) {
            const s = await response.json()
            console.log(s)
        }
    }


    useEffect(() => {
        console.log("31",
            howManyFunction
        )
    }, [howManyFunction])

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
                    console.log("getordersdata", getOrdersData)
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
            const staticCondiments = JSON.parse(localStorage.getItem("Condiments"))
            setStaticCondiments(staticCondiments)
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
    function openCondiment(condiment_id, alreadyHasCondiment, product) {
        const tempActiveCondiment = (staticCondiments.find(sC => sC.id == condiment_id))
        setActiveCondiment(tempActiveCondiment)
        setCondimentInputBox(true)
        if (!alreadyHasCondiment) {
            const grouped_orders = tempActiveCondiment.items.reduce((acc, groupName) => {
                if (!acc[groupName.name]) {
                    console.log("groupnAME", groupName.name)
                    acc[groupName.name] = []
                }
                return acc
            }, {})
            console.log(grouped_orders)
            setGroupedCondimentItems(grouped_orders)
        }
        product.condiments = []
        setProductToAddCondiment(product)
    }

    function appendCondiment(condiment_name, condiment_item) {
        const tempGroupedCondiments = { ...groupedCondimentOrders }
        const existingIndex = tempGroupedCondiments[condiment_name].findIndex(gC => gC.id == condiment_item.id)
        if (existingIndex == -1) {
            condiment_item.quantity = 1
            tempGroupedCondiments[condiment_name].push(condiment_item)
        } else {
            tempGroupedCondiments[condiment_name][existingIndex].quantity += 1
            console.log(tempGroupedCondiments[condiment_name][existingIndex].quantity)
        }
        const tempProductToAddCondiment = { ...productToAddCondiment }
        console.log("temp is ", tempProductToAddCondiment)
        tempProductToAddCondiment.condiments = tempGroupedCondiments
        tempProductToAddCondiment.price += condiment_item.price
        setGroupedCondimentItems(tempGroupedCondiments)
        setCondimentTotal(condimentTotal + condiment_item.price)
        setProductToAddCondiment(tempProductToAddCondiment)
    }

    function appendOrder(product) {
        const productName = product.name
        const productPrice = product.price
        const taxPercent = product.taxpercent
        console.log("product i,s ", product)
        setDisplayOrderType("new")
        const new_date = new Date()
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
                staticPrice: productPrice,
                price: productPrice,
                discounts: [],
                time: time,
                related_recipe_id: product.related_recipe_id,
                taxPercent: taxPercent
            }
            if (product.condiments) {
                newOrder.condiments = product.condiments
            }
            console.log("neworders", newOrders)
            setNewOrders([...newOrders, newOrder]);
        }
        const tax = Number((productPrice * (taxPercent / (100 + taxPercent))).toFixed(2))
        console.log("tax is ", tax, "tax total is ", taxTotal)
        setTaxTotal(Number((taxTotal + tax).toFixed(2)))
        const newTotalPrice = totalPrice + Number(productPrice)
        setTotalPrice(newTotalPrice)
        setProductsCost(parseFloat((productsCost + product.cost).toFixed(2)))
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
            const prevOrdersToDelete = { ...groupedPrevOrdersByTime }
            const order = prevOrdersToDelete[groupIndex][index]
            const quantity = order.amount
            if (maxHowMany == howManyInput || quantity == 1) {
                console.log(groupIndex)
                console.log("groupedPrevOrdersByTime[groupIndex]", groupedPrevOrdersByTime[groupIndex][index])
                if (order.onHouse) {
                    order.onHouse = false
                }
                const copied = { ...order }
                console.log("copied", copied)
                if (order.discounts.length > 0) {
                    order.discounts = []
                    setTotalPrice(totalPrice - order.price)
                    setDiscounts(discounts + order.price - (order.staticPrice * order.amount))
                    delete order.discountedPrice
                    order.price = quantity * order.staticPrice

                } else {
                    console.log(prevOrdersToDelete)
                    setTotalPrice(totalPrice - order.price)
                }
            } else{
                const prevOrdersToDelete = { ...groupedPrevOrdersByTime }
                const copied = { ...prevOrdersToDelete[groupIndex][index]}
                const prevTotal = copied.price
                copied.amount = copied.amount - howManyInput
                copied.price = copied.amount * copied.staticPrice
                if(copied.discounts){
                    let totalDiscoutedFromOrder = 0
                    copied?.discounts.forEach((disc, indx)=>{
                        if(disc.is_fixed){
                            totalDiscoutedFromOrder += disc.amount
                            copied.price -= disc.amount
                            disc.discountAmount = disc.amount
                        }else{
                            totalDiscoutedFromOrder += (disc.amount * copied.price) / 100
                            disc.discountAmount = (disc.amount * copied.price) / 100
                            copied.price -= (disc.amount * copied.price) / 100
                        }
                    })
                    console.log("toatldiscount", totalDiscoutedFromOrder)
                    setTotalPrice(totalPrice - prevTotal + copied.price)
                    setDiscounts(discounts - totalDiscoutedFromOrder)
                }
                prevOrdersToDelete[groupIndex].push(copied)
                /*if (prevOrdersToDelete[groupIndex].length == 1) {
                    delete prevOrdersToDelete[groupIndex]
                } else {
                    prevOrdersToDelete[groupIndex].splice(index, 1)
                }*/

            }
            order.amount = howManyInput
            prevOrdersToDelete[groupIndex][index].isDeleted = true
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
        setAppliedToHowManyBox(false)
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
        console.log("orders", groupedPrevOrdersByTime)
    }, [groupedPrevOrdersByTime])


    const saveCheckDiscountToDB = async (newDiscounts, tTotalPrice, tDiscountTotal) => {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:5000/setCheckDiscounts", {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                table_id: table_id,
                checkDiscounts: newDiscounts,
                total_discount: tDiscountTotal,
                total_price: tTotalPrice
            })
        })
        if (response.ok) {
            setDiscounts(tDiscountTotal)
            setTotalPrice(tTotalPrice)
            setCheckDiscounts(newDiscounts)
            setChosenServiceCharge(null)
        }
    }

    const saveDiscountItemsToDB = async (tempOrders, tTotalPrice, tDiscountTotal) => {
        const asd = []
        Object.entries(tempOrders).forEach((group, indx) => (
            group[1].forEach((order, _) => {
                asd.push(order)
            })
        ))
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:5000/setItemDiscounts", {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                table_id: table_id,
                orders: asd,
                total_price: tTotalPrice,
                total_discount: tDiscountTotal,
            })
        })
        if (response.ok) {
            setDiscounts(tDiscountTotal)
            setTotalPrice(tTotalPrice)
            setGroupedPrevOrdersByTime(tempOrders)
            setChosenDiscount(null)
        }
    }

    const updateOrderDiscountsForItem = (groupIndex, index) => {
        console.log("index is ", index, groupIndex)
        const tempOrders = JSON.parse(JSON.stringify(groupedPrevOrdersByTime))
        const order = tempOrders[groupIndex][index]
        if (!order.discounts) {
            order.discounts = []
        }
        const tempChosenDiscount = { ...chosenDiscount }
        console.log("chosendiscount", tempChosenDiscount)
        if (chosenDiscount.is_fixed) {
            tempChosenDiscount.discountAmount = chosenDiscount.amount
            //burası
            const tTotalPrice = totalPrice - chosenDiscount.amount
            const tTotalDiscounts = discounts + chosenDiscount.amount
            order.discounts.push(tempChosenDiscount)
            order.price -= chosenDiscount.amount
            saveDiscountItemsToDB(tempOrders, tTotalPrice, tTotalDiscounts)
        }
        else {
            tempChosenDiscount.discountAmount = (order.price * chosenDiscount.amount / 100)
            const tTotalPrice = totalPrice - (order.price * chosenDiscount.amount / 100)
            const tTotalDiscounts = discounts + (order.price * chosenDiscount.amount / 100)
            order.discounts.push(tempChosenDiscount)
            order.price -= ((order.price * chosenDiscount.amount / 100))
            saveDiscountItemsToDB(tempOrders, tTotalPrice, tTotalDiscounts)
        }
    }

    useEffect(() => {
        console.log("chjosendiscount", chosenDiscount)
    }, [chosenDiscount])

    const updateOrderDiscountsForCheck = () => {
        let tempChosenDiscount = { ...chosenDiscount }
        if (chosenDiscount.is_fixed) {
            tempChosenDiscount.discountAmount = chosenDiscount.amount
            tempChosenDiscount.isCheckDiscount = true
            const tempDiscounts = [...(checkDiscounts) || []]
            tempDiscounts.push(tempChosenDiscount)
            const tempTotalPrice = totalPrice - chosenDiscount.amount
            const tempDiscountTotal = discounts + chosenDiscount.amount
            saveCheckDiscountToDB(tempDiscounts, tempTotalPrice, tempDiscountTotal)
        } else {
            const tempDiscounts = [...(checkDiscounts) || []]
            tempDiscounts.push(tempChosenDiscount)
            tempChosenDiscount.discountAmount = totalPrice * (chosenDiscount.amount / 100)
            console.log()
            const tempTotalPrice = totalPrice - totalPrice * (chosenDiscount.amount / 100)
            const tempDiscountTotal = discounts + totalPrice * (chosenDiscount.amount / 100)
            saveCheckDiscountToDB(tempDiscounts, tempTotalPrice, tempDiscountTotal)
        }
        setChosenDiscount()
        setAddDiscount(false)

    }


    const saveCheckServiceToDB = async (newServiceCharges, sChargeTotal, tTotalPrice) => {
        const token = localStorage.getItem("token")
        console.log({
            table_id: table_id,
            checkServiceCharges: newServiceCharges,
            total_service_charge: sChargeTotal,
            total_price: tTotalPrice
        })
        const response = await fetch("http://localhost:5000/setServiceCharge", {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                table_id: table_id,
                checkServiceCharges: newServiceCharges,
                total_service_charge: sChargeTotal,
                total_price: tTotalPrice
            })
        })
        if (response.ok) {
            setTotalPrice(tTotalPrice)
            setServiceChargeTotal(sChargeTotal)
            setCheckServiceCharges(newServiceCharges)
            setChosenServiceCharge(null)
        }
    }
    function saveCheckServiceCharge() {
        if (chosenServiceCharge.is_fixed) {
            const tempServiceChargeTotal = serviceChargeTotal + chosenServiceCharge.amount
            const tempTotalPrice = totalPrice + chosenServiceCharge.amount
            const newCheckServiceStateIfSuccess = [...checkServiceCharges]
            newCheckServiceStateIfSuccess.push(chosenServiceCharge)
            saveCheckServiceToDB(newCheckServiceStateIfSuccess, tempServiceChargeTotal, tempTotalPrice)
        } else {
            const tempServiceChargeTotal = serviceChargeTotal + totalPrice * (chosenServiceCharge.amount / 100)
            const tempTotalPrice = totalPrice + totalPrice * (chosenServiceCharge.amount / 100)
            const newCheckServiceStateIfSuccess = [...checkServiceCharges]
            newCheckServiceStateIfSuccess.push(chosenServiceCharge)
            saveCheckServiceToDB(newCheckServiceStateIfSuccess, tempServiceChargeTotal, tempTotalPrice)
        }
        setCheckServiceOpen(false)
    }

    function deleteCheckService(index) {
        const tempCheckServiceCharges = [...(checkServiceCharges || [])]
        console.log(tempCheckServiceCharges[index])
        const chosenDeleteService = tempCheckServiceCharges[index]
        if (tempCheckServiceCharges[index].is_fixed) {
            const tempTotalPrice = totalPrice - chosenDeleteService.amount
            const tempServiceChargeTotal = serviceChargeTotal - chosenDeleteService.amount
            const newCheckServiceStateIfSuccess = [...checkServiceCharges]
            newCheckServiceStateIfSuccess.splice(index, 1)
            saveCheckServiceToDB(newCheckServiceStateIfSuccess, tempServiceChargeTotal, tempTotalPrice)
        } else {
            const tempTotalPrice = totalPrice * (100 / (100 + chosenDeleteService.amount))
            const tempServiceChargeTotal = serviceChargeTotal - totalPrice * (10 / (100 + chosenDeleteService.amount))
            const newCheckServiceStateIfSuccess = [...checkServiceCharges]
            newCheckServiceStateIfSuccess.splice(index, 1)
            saveCheckServiceToDB(newCheckServiceStateIfSuccess, tempServiceChargeTotal, tempTotalPrice)
        }
    }

    function deleteCheckDiscount(index) {
        const tempCheckDiscounts = [...checkDiscounts]
        setTotalPrice(totalPrice + tempCheckDiscounts[index].discountAmount)
        tempCheckDiscounts.splice(index, 1)
        setCheckDiscounts(tempCheckDiscounts)
    }
    function deleteItemDiscount(group_index, index, discountIndex) {
        const orders = { ...groupedPrevOrdersByTime }
        console.log(group_index)
        console.log(orders[group_index][index].discounts[index])
        const tTotalPrice = totalPrice + orders[group_index][index].discounts[discountIndex].discountAmount
        const tDiscountTotal = discounts - orders[group_index][index].discounts[discountIndex].discountAmount
        orders[group_index][index].discountedPrice += orders[group_index][index].discounts[discountIndex].discountAmount
        orders[group_index][index].price += orders[group_index][index].discounts[discountIndex].discountAmount
        if (orders[group_index][index].discountedPrice == orders[group_index][index].staticPrice * orders[group_index][index].amount) {
            console.log("eşit")
            delete orders[group_index][index].discountedPrice
        }
        orders[group_index][index].discounts.splice(discountIndex, 1)
        saveDiscountItemsToDB(orders, tTotalPrice, tDiscountTotal)
    }


    function onHouse(index, groupIndex) {
        const tempPrevOrders = { ...groupedPrevOrdersByTime }
        const quantity = tempPrevOrders[groupIndex][index].amount
        if (tempPrevOrders[groupIndex][index].onHouse) {
            const price = parseFloat(tempPrevOrders[groupIndex][index].price)
            tempPrevOrders[groupIndex][index].onHouse = false
            console.log(totalPrice + price)
            setTotalPrice(totalPrice + price)
        } else {
            if (maxHowMany == howManyInput || quantity == 1) {
                console.log("if")
                const price = parseFloat(tempPrevOrders[groupIndex][index].price)
                tempPrevOrders[groupIndex][index].onHouse = true
                console.log(totalPrice - price)
                setTotalPrice(totalPrice - price)
            } else {
                const copied = { ...tempPrevOrders[groupIndex][index] }
                copied.amount = howManyInput
                copied.price = howManyInput * copied.staticPrice
                copied.onHouse = true
                tempPrevOrders[groupIndex][index].amount -= howManyInput
                tempPrevOrders[groupIndex][index].price = howManyInput * tempPrevOrders[groupIndex][index].staticPrice
                tempPrevOrders[groupIndex].push(copied)
                setTotalPrice(totalPrice - copied.price)
            }
        }
        setGroupedPrevOrdersByTime(tempPrevOrders)
        closeAllActions()
        setAppliedToHowManyBox(false)
    }

    function paymentInputChange(e) {
        var digit = e.target.textContent
        let prev = String(howManyInput)
        console.log("asdf", parseInt(prev + digit))
        if (howManyInput == 0) {
            if (parseInt(prev + digit) > parseInt(maxHowMany)) {
                setHowManyInput(maxHowMany)
                console.log("1")
            } else {
                setHowManyInput(parseInt(digit))
                console.log("2")
            }

        }
        else {
            if (parseInt(prev + digit) > parseInt(maxHowMany)) {
                console.log("3")
                setHowManyInput(maxHowMany)
            } else {
                console.log("4")
                setHowManyInput(parseInt(prev + digit))
            }
        }
    }

    useEffect(() => {
        console.log("3131", howManyInput)
    }, [howManyInput])

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
                        <button onClick={() => deleteOrder(index)}>
                            <i className="bi bi-trash"></i>
                        </button>
                        <button onClick={() => closeActions(index)}>
                            <i className="bi bi-x-circle"></i>
                        </button>
                    </div>

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
                        <div className={styles["order-item-container"]}>
                            <li key={index}>
                                <div style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "center" }}>
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
                                            (<span>İKRAM</span>) : 
                                            (order.staticPrice * order.amount > order.price ? <><del>{order.staticPrice * order.amount} ₺</del><span>{order["price"]}₺</span></> 
                                            : (order.isDeleted ? <span className={styles["order-deleted"]} >İPTAL EDİLDİ</span> : <span>{order["price"]}₺</span>))
                                        }
                                 
                                    </div>

                                    {!order.isDeleted ? (
                                    <div className={styles["order-item-actions"]}>
                                        <button onClick={() => openActions(index, groupIndex)}>
                                            <i className="bi bi-three-dots"></i>
                                        </button>
                                    </div>

                                    ):""}

                                    <div id={`prev-${index}`} className={styles["order-item-actions-box"]}>
                                        <button onClick={() => { setItemDiscountIndex([groupOrders[0], index]), setDiscountFor("item"), closeAllActions() }}>
                                            <i className="bi bi-percent"></i>
                                        </button>
                                        <button onClick={() => {
                                            order.amount > 1
                                                ? (setHowManyFunction("onhouse"), setHowManyIndexes([index, groupOrders[0]]), setAppliedToHowManyBox(true), setMaxHowMany(order.amount))
                                                : onHouse(index, groupOrders[0]), closeAllActions()
                                        }}>
                                            <i className="bi bi-basket3"></i>
                                        </button>
                                        <button onClick={() => {
                                            order.amount > 1
                                                ? (setHowManyFunction("delete"), setHowManyIndexes([index, groupOrders[0]]), setAppliedToHowManyBox(true), setMaxHowMany(order.amount))
                                                : deleteOrder(index, groupOrders[0]), closeAllActions()
                                        }}>
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
                                                            <input onChange={(e) => setChosenDiscount({ discountAmount: parseFloat(e.target.value), name: "Custom Discount", is_fixed: true })} type="number" name="" id="" />
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
                                                    <div onClick={() => updateOrderDiscountsForItem(groupOrders[0], index)} className={styles["discount-save-new-button"]}>
                                                        <button>Kaydet</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    }
                                </div>

                            </li>
                            {order?.condiments ? (
                                <div className={styles["condiment-display-container"]}>
                                    {Object.entries(order?.condiments).map((condimentGroup, i) => (
                                        condimentGroup[1].map((condiment, _) => (
                                            <div className={styles["condiment-display"]}>
                                                <p>{condiment.name}</p>
                                                <p style={{ color: "#FACC15" }}>+{condiment.price * condiment.quantity}₺</p>
                                            </div>
                                        ))
                                    ))}
                                </div>

                            ) : ""}
                        </div>
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
                        <input className={styles["people-count-input"]} value={guestCount} type="number" onChange={(e) => { setGuestCount(e.target.value); setGuestCountToDB(e.target.value) }} />
                    </div>
                </div>

                <div className={styles["menu-items"]}>
                    <div className={styles["menu-items-sections"]}>
                        {productCategory.filter(sc => sc.parent_id == null).sort((a, b) => a.ui_index - b.ui_index).map((category, index) => (
                            <button style={{
                                backgroundColor: category.id == chosenCategory ? "#3B82F6" : "",
                                color: category.id == chosenCategory ? "white" : ""
                            }} onClick={() => changeCategory(category.id)} > {category.name} </button>
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
                                            <span onClick={(e) => { openCondiment(product.condiment_id, false, product); e.stopPropagation() }} style={{ backgroundColor: "rgb(59, 130, 246)", color: "white", borderRadius: "10px", display: "flex", alignItems: "center" }} className={styles["product-condiment"]}>{product.condiment_id ? <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                            </svg> : ""} </span>
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
                                    <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
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
                                        <p> {discount.is_fixed ? `${discount.amount}₺` : `${discount.amount}%`} </p>
                                    </div>
                                ))
                                }
                                <div className={styles["manual-discount-input"]}>
                                    <p>Farklı bir ücret girmek için:</p>
                                    <input onChange={(e) => setChosenDiscount({ amount: parseFloat(e.target.value), name: "Custom Discount", is_fixed: true })} type="number" name="" id="" />
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
                            <div onClick={() => updateOrderDiscountsForCheck()} className={styles["discount-save-new-button"]}>
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
                                        <p> {charge.is_fixed ? `Sabit ${charge.amount} ₺` : `Yüzdesel ${charge.amount}%`} </p>
                                    </div>
                                ))
                                }
                                <div className={styles["manual-discount-input"]}>
                                    <p>Farklı bir ücret girmek için:</p>
                                    <input placeholder="Tutar Giriniz.." onChange={(e) => setChosenServiceCharge({ chosenServiceCharge: e.target.value, serviceChargeName: "Custom Discount", serviceChargeType: "Fixed" })} type="number" name="" id="" />
                                </div></> :
                                <div className={styles["applied-discount"]}>
                                    {checkServiceCharges.length > 0 ? (checkServiceCharges.map((charge, checkServiceIndex) => (
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <p>{charge.name} {charge.amount}
                                                <svg onClick={() => deleteCheckService(checkServiceIndex)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                </svg>

                                            </p>
                                        </div>)
                                    )) :
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
            {condimentInputBox && (
                <div className={`${staticStyles["middle-bar"]} ${styles["combo-container"]}`}>
                    <div className={staticStyles["middle-bar-top-bar"]}>
                        <div className={staticStyles["go-back-button"]}>
                            <button onClick={() => setCondimentInputBox(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className={staticStyles["datetime"]}>
                            <Clock></Clock>
                        </div>
                    </div>
                    <div className={styles["condiment-item-container"]}>
                        <div className={styles["condimend-append"]}>
                            <h1 style={{ marginTop: "0px" }}>{activeCondiment.name}</h1>
                            <div>
                                {activeCondiment.items.map((condiment, index) => (
                                    <div>
                                        <p className={styles["condiment-item-group-name"]}>{condiment.name}</p>
                                        <div className={styles["condiment-item-group"]} >
                                            {condiment.items.map((condiment_item, _) => (
                                                <button onClick={() => appendCondiment(condiment.name, condiment_item)} className={styles["condiment-item-button"]}>
                                                    <p >{condiment_item.name}</p>
                                                    <p style={{ color: "rgb(7, 196, 7)" }}>{condiment_item.price}₺</p>
                                                </button>
                                            ))}
                                        </div>

                                    </div>

                                ))}

                            </div>
                        </div>
                        <div className={`${styles["order-list"]} ${styles["condiment-order-menu"]}`}>
                            <div style={{ height: "84%" }} className={styles["condiment-order-group-container"]}>
                                {Object.entries(groupedCondimentOrders).map(([groupName, items], index) => (
                                    <div key={index}>
                                        <p style={{ color: "black", marginBottom: "1rem" }}>{groupName}</p>
                                        {items.length > 0 ? (
                                            items.map((item, i) => (
                                                <div className={styles["condiment-item"]}>
                                                    <div className={styles["condiment-item-info"]}>
                                                        <div className={styles["condiment-item-amount"]}>
                                                            <span>{item.quantity}</span>
                                                        </div>
                                                        <div>
                                                            <p style={{ color: "#1F2937", fontSize: "18px" }}>{item.name}</p>
                                                            <p style={{ color: "rgb(7, 196, 7)", fontSize: "14px" }}>{item.price}₺</p>
                                                        </div>
                                                    </div>
                                                    <div className={styles["delete-condiment-item"]}>
                                                        <svg style={{ color: "red" }} xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles["no-condiment-input-yet"]}>
                                                <p>Henüz ürün eklenmemiş</p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                            </div>
                            <div className={styles["actions-condiment"]}>
                                <div className={styles["condiment-total"]}>
                                    <p>Total:</p>
                                    <p>{condimentTotal.toFixed(2)}₺</p>
                                </div>
                                <div className={styles["condiment-action-buttons"]}>
                                    <button onClick={() => {
                                        setCondimentInputBox(false),
                                            setActiveCondiment(null),
                                            setGroupedCondimentItems([]),
                                            setCondimentTotal(0)
                                    }}
                                        style={{ backgroundColor: "#E5E7EB", color: "black" }}>İptal</button>
                                    <button onClick={() => { appendOrder(productToAddCondiment), setCondimentInputBox(false) }} style={{ backgroundColor: "#4F46E5", color: "white" }}>Kaydet</button>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            )}
            {appliedToHowManyBox ? (
                <div className={styles["how-many-container"]} >
                    <div className={styles["order-note-header"]}>
                        <h1 style={{ color: "white", marginBottom: "1rem" }}>Kaç Ürüne Uygulanacak</h1>
                    </div>
                    <div style={{ backgroundColor: "#111827" }} className={styles["count-input"]}>
                        {howManyInput}
                    </div>
                    <div className={inputButtons["input-buttons"]}>
                        <div className={styles["input-button-row"]}>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>7</button>
                            </div>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>8</button>
                            </div>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>9</button>
                            </div>
                        </div>
                        <div className={styles["input-button-row"]}>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>4</button>
                            </div>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>5</button>
                            </div>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>6</button>
                            </div>

                        </div>
                        <div className={styles["input-button-row"]}>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>1</button>
                            </div>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>2</button>
                            </div>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>3</button>
                            </div>
                        </div>


                        <div className={styles["input-button-row"]}>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>C</button>
                            </div>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}>0</button>
                            </div>
                            <div style={{ width: "100%", backgroundColor: "#374151", border: "0px" }} onClick={(e) => paymentInputChange(e)} className={inputButtons["calculator-button"]}>
                                <button style={{ backgroundColor: "#374151", color: "white" }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-backspace-fill" viewBox="0 0 16 16">
                                    <path d="M15.683 3a2 2 0 0 0-2-2h-7.08a2 2 0 0 0-1.519.698L.241 7.35a1 1 0 0 0 0 1.302l4.843 5.65A2 2 0 0 0 6.603 15h7.08a2 2 0 0 0 2-2zM5.829 5.854a.5.5 0 1 1 .707-.708l2.147 2.147 2.146-2.147a.5.5 0 1 1 .707.708L9.39 8l2.146 2.146a.5.5 0 0 1-.707.708L8.683 8.707l-2.147 2.147a.5.5 0 0 1-.707-.708L7.976 8z" />
                                </svg></button>
                            </div>
                        </div>
                        <div className={styles["how-many-actions"]}>
                            <button onClick={() => setAppliedToHowManyBox(false)} style={{ backgroundColor: "rgb(55, 65, 81)", color: "white", fontWeight: "700", fontSize: "18px" }}>İptal</button>
                            <button onClick={() => howManyFunction == "onhouse" ? onHouse(howManyIndexes[0], howManyIndexes[1])
                                : howManyFunction == "delete" ? deleteOrder(howManyIndexes[0], howManyIndexes[1]) :
                                    ""} style={{ backgroundColor: "rgb(239 68 68)", color: "white", fontWeight: "700", fontSize: "18px" }}>Uygula</button>
                        </div>
                    </div>
                </div>
            ) : ""}
        </div>
    );
}
export default Order;
