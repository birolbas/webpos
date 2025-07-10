import { useParams, useNavigate } from "react-router-dom"
import style from "./Payment.module.css"
import staticStyles from "../staticStyle/StaticStyle.module.css"
import { useEffect, useState } from "react";
function Payment() {
    const { table_id } = useParams();
    const [orders, setTotalOrders] = useState()
    const [totalPrice, setTotalPrice] = useState()
    const [moneyInput, setMoneyInput] = useState("0")
    const [payments, setPayments] = useState([])
    const [payedPrice, setPayedPrice] = useState(0)
    const [remainingPrice, setRemainingPrice] = useState(0)
    const navigate = useNavigate()
    useEffect(() => {
        const getOrderFromDB = async () => {
            try {
                const getOrdersResponse = await fetch(`http://127.0.0.1:5000/get_payment_orders/${table_id}`);
                if (getOrdersResponse.ok) {
                    const getOrdersData = await getOrdersResponse.json();
                    console.log("getOrdersData", getOrdersData)
                    setTotalOrders(getOrdersData[0][5])
                    setTotalPrice(parseFloat(getOrdersData[0][6]))
                    setRemainingPrice(parseFloat(getOrdersData[0][6]))
                    console.log(getOrdersData[0][7])
                    if (getOrdersData[0][7]) {
                        setPayments(getOrdersData[0][7])
                    }
                    let totalPayed = 0
                    getOrdersData[0][7].forEach((payment, _) => {
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
    }, [table_id])

    useEffect(() => {
        console.log("orders", orders)
        setRemainingPrice(totalPrice - payedPrice)

    }, [orders])

    function getTodayDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    function setPayment(e) {
        const paymentType = (e.target.textContent)
        let pPrice = parseFloat(payedPrice)
        let mInput = parseFloat(moneyInput)
        if (mInput < remainingPrice && mInput > 0) {
            console.log("if")
            pPrice += mInput
            const object = {
                paymentType: paymentType,
                payedPrice: moneyInput,
            }
            setPayedPrice(parseFloat(pPrice))
            setRemainingPrice((totalPrice - pPrice).toFixed(2))
            setPayments([...payments, object])
            setMoneyInput("0")

            const updatedPayments = [...payments, object];
            console.log("updatedPayments", updatedPayments)
            const nav = false
            setPaymentToDB(updatedPayments, nav)

        } else if (mInput >= remainingPrice) {
            console.log("else")
            const object = {
                paymentType: paymentType,
                payedPrice: remainingPrice,
            }
            setRemainingPrice(0)
            setPayedPrice(parseFloat(totalPrice))
            const updatedPayments = [...payments, object];
            setPayments(updatedPayments)
            setPayedPrice(totalPrice)
            setMoneyInput("0")
            const nav = true
            setPaymentToDB(updatedPayments, nav)
        }
    }
    const closeCheck = async (updatedPayments) => {
        console.log("updatedpayments", updatedPayments)
        try {
            const response = await fetch(`http://localhost:5000/close_check/${table_id}`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
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
    useEffect(() => {
        console.log("orders", payments)

    }, [payments])

    function paymentInputChange(e) {
        const price = e.target.textContent
        if (moneyInput == 0) {
            setMoneyInput(price)
        } else {
            let money = moneyInput
            money += price
            setMoneyInput(money)
        }
    }
    return (
        <div className={style["container"]}>
            <div className={style["table-orders"]}>
                <div className={style["table-species"]}>
                    <div className={style["table-id-go-back"]}>
                        <div style={{marginLeft:16, marginTop:16}} className={staticStyles["go-back-button"]}>
                            <button id="go-back-button" onClick={() => navigate(-1)}>
                                <i className="bi bi-arrow-return-left"></i>
                            </button>
                        </div>
                        <p id={style["table-id"]}>Masa:{table_id}</p>
                    </div>

                    <div className={style["orders"]}>
                        {orders?.map((order, index) => (
                            <div className={style["order"]} >
                                <div className={style["order-name-amount"]}>
                                    <p>{order.name}</p>
                                    <p>Miktar:{order.amount}</p>
                                </div>
                                <div className={style["order-price"]}>
                                    <p>Toplam:{order.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={style["payments"]}>
                    <h1>ÖDEMELER</h1>
                    <div className={style["payment-container"]}>
                        {payments?.map((payment, _) => (
                            <div className={style["payment"]}>
                                <p>{payment.paymentType}</p>
                                <p>{payment.payedPrice}</p>
                            </div>
                        ))}
                    </div>
                </div>


                <div className={style["payment-input"]}>
                    <div className={style["payment-input-price"]}>
                        <p>{moneyInput}<span>₺</span></p>
                    </div>
                    <div className={style["payment-input-buttons"]}>
                        <div className={style["payment-input-button"]}>
                            <button onClick={(e) => paymentInputChange(e)}>1</button>
                            <button onClick={(e) => paymentInputChange(e)}>2</button>
                            <button onClick={(e) => paymentInputChange(e)}>3</button>
                            <button onClick={(e) => paymentInputChange(e)}>00</button>
                        </div>
                        <div className={style["payment-input-button"]}>
                            <button onClick={(e) => paymentInputChange(e)}>4</button>
                            <button onClick={(e) => paymentInputChange(e)}>5</button>
                            <button onClick={(e) => paymentInputChange(e)}>6</button>
                            <button onClick={(e) => paymentInputChange(e)}>0</button>
                        </div>
                        <div className={style["payment-input-button"]}>
                            <button onClick={(e) => paymentInputChange(e)}>7</button>
                            <button onClick={(e) => paymentInputChange(e)}>8</button>
                            <button onClick={(e) => paymentInputChange(e)}>9</button>
                            <button onClick={(e) => paymentInputChange(e)}>.</button>
                        </div>
                    </div>
                    <div className={style["payment-type"]}>
                        <button onClick={(e) => setPayment(e)} style={{ backgroundColor: "brown" }}>Kredi Kartı</button>
                        <button onClick={(e) => setPayment(e)} style={{ backgroundColor: "green" }}>Nakit</button>
                    </div>
                </div>


            </div>



            <div className={style["price-data"]}>
                <div className={style["price"]}>
                    <p>Toplam Tutar</p>
                    <p>{totalPrice}<span>₺</span></p>
                </div>
                <div className={style["price"]}>
                    <p>Ödenen Tutar</p>
                    <p>{payedPrice}<span>₺</span></p>

                </div>
                <div className={style["price"]}>
                    <p>Kalan Tutar</p>
                    <p>{remainingPrice}<span>₺</span></p>

                </div>
            </div>

        </div>

    )
}
export default Payment