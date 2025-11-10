import { useParams, useNavigate } from "react-router-dom"
import style from "./Payment.module.css"
import staticStyles from "../staticStyle/StaticStyle.module.css"
import { useEffect, useState } from "react";
function Payment() {
    const { table_id } = useParams();
    const [paymentMethods, setPaymentMethods] = useState()
    const [orders, setTotalOrders] = useState()
    const [totalPrice, setTotalPrice] = useState()
    const [moneyInput, setMoneyInput] = useState("0.00")
    const [payments, setPayments] = useState([])
    const [payedPrice, setPayedPrice] = useState(0)
    const [remainingPrice, setRemainingPrice] = useState(0)
    const [zeroOnClick, setZeroOnClick] = useState(true)
    const [paymentCost, setPaymentCost] = useState(0)
    const navigate = useNavigate()
    useEffect(()=>{
        console.log("payments", payments)
    },[payments])
    useEffect(() => {
        const getOrderFromDB = async () => {
            try {
                const getOrdersResponse = await fetch(`http://127.0.0.1:5000/get_payment_orders/${table_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                if (getOrdersResponse.ok) {
                    const getOrdersData = await getOrdersResponse.json();
                    console.log("getOrdersData", getOrdersData)
                    setTotalOrders(getOrdersData[0].products)
                    const price = parseFloat(getOrdersData[0].total_price).toFixed(2)
                    console.log("price", price)
                    setTotalPrice(price)
                    setRemainingPrice(price)
                    setMoneyInput(price)
                    console.log("payments",getOrdersData[0].payments)
                    if (getOrdersData[0].payments) {
                        setPayments(getOrdersData[0].payments)
                    }
                    let totalPayed = 0
                    getOrdersData[0].payments.forEach((payment, _) => {
                        const price = parseFloat(payment.payedPrice)
                        totalPayed += price
                    })
                    setPayedPrice(totalPayed)

                } else {
                    console.log("error happened", getOrdersResponse.statusText);
                }
            } catch (error) {
                console.log(error);
            }
        };

        getOrderFromDB();
        const paymentMet = JSON.parse(localStorage.getItem("PaymentMethods"))
        console.log("paymentmet", paymentMet)
        setPaymentMethods(paymentMet)
    }, [table_id])

    useEffect(() => {
        setRemainingPrice(totalPrice - payedPrice)
    }, [orders])


    function getTodayDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    function setPayment(index) {
        const paymentType = paymentMethods[index]
        let pPrice = parseFloat(payedPrice)
        console.log("payed price", pPrice)
        let mInput = parseFloat(moneyInput)
        if (mInput < remainingPrice && mInput > 0) {
            pPrice += mInput
            console.log("mInput is ", mInput, "type is ", typeof mInput)
            console.log("remainingPrice is ", remainingPrice, "type is ", typeof remainingPrice)
            const paymentCommission = (paymentType.commission / 100) * moneyInput
            const totalPaymentCommission = parseFloat((paymentCost + paymentCommission).toFixed(2))
            const object = {
                paymentName: paymentType.name,
                paymentCommission: paymentType.commission,
                isIncludedIncome: paymentType.includedincome,
                payedPrice: mInput,
            }
            setPayedPrice(parseFloat(pPrice))
            setRemainingPrice((totalPrice - pPrice).toFixed(2))
            console.log("payments are ", payments, "and the is ", typeof payments)
            setPayments([...payments, object])
            setMoneyInput((remainingPrice- moneyInput).toFixed(2))
            setZeroOnClick(true)
            const updatedPayments = {
                payments: [...payments, object],
                totalPaymentCommission: totalPaymentCommission
            }
            const nav = false
            setPaymentCost(totalPaymentCommission)
            setPaymentToDB(updatedPayments, nav)

        } else if (mInput >= remainingPrice) {
            const paymentCommission = (paymentType.commission / 100) * remainingPrice
            const totalPaymentCommission = parseFloat((paymentCost + paymentCommission).toFixed(2))
            const object = {
                paymentName: paymentType.name,
                paymentCommission: paymentType.commission,
                isIncludedIncome: paymentType.includedincome,
                payedPrice: remainingPrice,
            }
            setRemainingPrice(0)
            setPayedPrice(parseFloat(totalPrice))
            const updatedPayments = {
                payments: [...payments, object],
                totalPaymentCommission: totalPaymentCommission
            }
            setPayments([...payments, object])
            setMoneyInput(remainingPrice- moneyInput)
            setZeroOnClick(true)

            setPaymentCost(totalPaymentCommission)
            const nav = true
            setPaymentToDB(updatedPayments, nav)
        }
        
    }
    const closeCheck = async (updatedPayments) => {
        try {
            const response = await fetch(`http://localhost:5000/close_check/${table_id}`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(updatedPayments)
            }
            )
            if (response.ok) {
                const data = await response.json()
                console.log("data is ", data)
                navigate("/tables")
            }
        } catch (error) {
            console.log(error)
        }

    }


    const setPaymentToDB = async (updatedPayments, nav) => {
        try {
            const response = await fetch(`http://localhost:5000/set_payments/${table_id}`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(updatedPayments)
            }
            )
            console.log(response.json)
            if (nav) {
                closeCheck(updatedPayments);
            }

        } catch (error) {
            console.log(error)
        }

    }


    function paymentInputChange(e) {
        var digit = e.target.textContent;
        if(zeroOnClick){
            let raw = "0.00".replace(".", "").replace(/^0+/, "");
            raw += digit;
            let num = parseFloat(raw) / 100;
            setMoneyInput(num.toFixed(2))
            setZeroOnClick(false)
        }else{
            setMoneyInput(prev => {
                let raw = prev.replace(".", "").replace(/^0+/, "");
                raw += digit;
                let num = parseFloat(raw) / 100;
                return num.toFixed(2);
            })
        }

    }
    return (
        <div className={style["container"]}>
            <div className={style["top-bar"]}>
                <div className={style["go-back-table-name"]}>
                    <div className={style["go-back"]} style={{ display: "flex" }} >
                        <button onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>

                        <h1>Masa: {table_id} </h1>
                    </div>
                </div>
                <div className={style["payments"]}>
                    <h1>Ödemeler</h1>
                </div>
            </div>
            <div className={style["middle-bar"]}>
                <div className={style["orders"]}>
                    {orders?.map((order, index) => (
                        <div className={style["order"]}>
                            <div className={style["order-first-col"]}>
                                <div className={style["order-name"]}>
                                    {order.name}
                                </div>
                                <div className={style["order-amount"]}>
                                    Miktar:{order.amount}
                                </div>
                            </div>
                            <div className={style["order-price"]}>
                                {order.onHouse ?
                                    (<span>İKRAM</span>) : (order.discountedPrice ? <>Toplam: <del>{order["price"]} ₺</del> <span>{order["discountedPrice"]}₺</span></> : <span>{order["price"]}₺</span>)
                                }          </div>
                        </div>
                    ))}
                </div>
                <div className={style["closed-payments"]}>
                        {payments?.map((payment, index) => (
                        <div className={style["closed-payment"]} >
                            <p style={{fontWeight:"600"}}>{payment.paymentName}</p>
                            <p style={{color:"rgb(22, 163, 74)"}}>{payment.payedPrice}₺</p>
                        </div>
                    ))}
                </div>
                <div className={style["payment-inputs"]}>
                    <div className={style["price-input"]}>
                        <h1> {moneyInput} </h1>
                    </div>
                    <div className={style["input-buttons"]}>
                        <div className={style["input-button-row"]}>
                            <div onClick={() => setMoneyInput("0.00")} className={style["calculator-button"]}>
                                <button>C</button>
                            </div>
                            <div onClick={() => {setMoneyInput(((remainingPrice)/2).toFixed(2)); setZeroOnClick(true)}} className={style["calculator-button"]}>
                                <button >1/2</button>
                            </div>
                            <div onClick={() => {setMoneyInput(((remainingPrice)/3).toFixed(2)); setZeroOnClick(true)}} className={style["calculator-button"]}>
                                <button >1/3</button>
                            </div>
                            <div onClick={() => {setMoneyInput(((remainingPrice)/4).toFixed(2)); setZeroOnClick(true)}} className={style["calculator-button"]}>
                                <button>1/4</button>
                            </div>
                        </div>
                        <div className={style["input-button-row"]}>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>7</button>
                            </div>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>8</button>
                            </div>
                            <div onClick={(e) => paymentInputChange(e)}className={style["calculator-button"]}>
                                <button>9</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button>1/X</button>
                            </div>
                        </div>
                        <div className={style["input-button-row"]}>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button >4</button>
                            </div>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>5</button>
                            </div>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>6</button>
                            </div>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>0</button>
                            </div>
                        </div>
                        <div className={style["input-button-row"]}>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>1</button>
                            </div>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>2</button>
                            </div>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>3</button>
                            </div>
                            <div onClick={(e) => paymentInputChange(e)} className={style["calculator-button"]}>
                                <button>00</button> 
                            </div>
                        </div>
                    </div>
                    <div className={style["payment-methods"]}>
                        {paymentMethods?.map((method, index) => (
                            <div onClick={() => setPayment(index)} style={{ backgroundColor: "brown" }} className={style["method"]}>
                                {method.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <footer>
                <div className={style["payment-prices"]}>
                    <div className={style["total-price"]}>Toplam Tutar: <span>{totalPrice}₺</span></div>
                    <div className={style["payed-price"]}>Ödenen Tutar: <span>{payedPrice}₺</span></div>
                    <div className={style["remaining-price"]}>Kalan Tutar: <span>{remainingPrice}₺</span></div>
                </div>
            </footer>

        </div>

    )
}
export default Payment