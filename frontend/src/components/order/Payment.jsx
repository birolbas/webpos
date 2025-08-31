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
        const paymentMet = JSON.parse(localStorage.getItem("PaymentMethods"))
        console.log("paymentmet", paymentMet)
        setPaymentMethods(paymentMet)
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
        const paymentType = (e.target.textContent.trim())
        console.log(paymentType.length)
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
            console.log("object.paymentType", object.paymentType.length)
            const nav = false
            setPaymentToDB(updatedPayments, nav)

        } else if (mInput >= remainingPrice) {
            console.log("else")
            const object = {
                paymentType: paymentType,
                payedPrice: remainingPrice,
            }
            console.log("object.paymentType", object.paymentType.length)
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
        var digit = e.target.textContent;
        setMoneyInput(prev => {
            let raw = prev.replace(".", "").replace(/^0+/, ""); 
            console.log("raw", raw)
            raw += digit; 
            console.log("raw", raw)
            let num = parseFloat(raw) / 100; 
            console.log("num", num)
            return num.toFixed(2);
        });
    
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
                                Toplam:{order.price}₺
                            </div>
                        </div>
                    ))}
                </div>
                <div></div>
                <div className={style["payment-inputs"]}>
                    <div className={style["price-input"]}>
                        <h1> {moneyInput} </h1>
                    </div>
                    <div className={style["input-buttons"]}>
                        <div className={style["input-button-row"]}>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>C</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>1/2</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>1/3</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>1/4</button>
                            </div>                            
                        </div>
                        <div className={style["input-button-row"]}>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>7</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>8</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>9</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button>1/X</button>
                            </div>                            
                        </div>   
                        <div className={style["input-button-row"]}>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>4</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>5</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>6</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>0</button>
                            </div>                            
                        </div>     
                        <div className={style["input-button-row"]}>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>1</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>2</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>3</button>
                            </div>
                            <div className={style["calculator-button"]}>
                                <button onClick={(e) => paymentInputChange(e)}>00</button>
                            </div>                            
                        </div>                                                               
                    </div>
                    <div className={style["payment-methods"]}>
                        {paymentMethods?.map((method, index)=>(
                            <div onClick={(e) => setPayment(e)} style={{ backgroundColor: "brown" }} className={style["method"]}>
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