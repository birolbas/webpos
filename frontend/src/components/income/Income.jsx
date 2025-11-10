import staticStyles from '../staticStyle/StaticStyle.module.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Calendar-override.css'
import styles from './Income.module.css'
import Clock from '../staticStyle/Clock'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Payment from '../order/Payment'

function Income() {
    const navigate = useNavigate()
    const [paymentMethods, setPaymentMethods] = useState([])

    const [total, setTotal] = useState(0)
    const [net, setNet] = useState(0)
    const [tax, setTax] = useState(0)
    const [discountTotal, setDiscountTotal] = useState(0)
    const [serviceChargeTotal, setServiceChargeTotal] = useState(0)
    const [checkCount, setCheckCount] = useState(0)
    const [guestCount, setGuestCount] = useState(0)
    const [averagePerPerson, setAveragePerPerson] = useState(0)
    const [averagePerCheck, setAveragePerCheck] = useState(0)
    const [payments, setPayments] = useState([])
    const [openTotal, setOpenTotal] = useState(0)
    const [closedTotal, setClosedTotal] = useState(0)
    const [peakHour, setPeakHour] = useState({})

    const [date, setDate] = useState();
    const [displayDetailedIncome, setDisplayDetailedIncome] = useState(false)
    const [restaurant, setRestaurant] = useState()
    const [displayCalendar, setDisplayCalendar] = useState(false)

    const onChangeDate = date => {
        date[0] = date[0].toISOString().slice(0, 10)
        date[1] = date[1].toISOString().slice(0, 10)
        setDate([date[0], date[1]])
    }
 
    const getDailyFromDB = async (date) => {
        try {
            const response = await fetch("http://localhost:5000/income", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(date)
            })
            if (response.ok) {
                const data = await response.json()
                console.log("data is ", data)
                const pTypes = {
                    "Total": 0,
                    "Net": 0,
                    "CheckCount": 0,
                    "Average per Person": 0,
                    "Average per Check": 0,
                    "Payment Methods": paymentMethods,
                    "Peak Hours": [],
                }
                pTypes["Payment Methods"].forEach((type, index) => {
                    type["Total"] = 0
                })
                console.log("data", data)
                let tempClosedTotal = 0
                let paymentMethodDiscount = 0 
                data.payments.forEach((p, index)=>{
                    if(p.includedincome){
                        tempClosedTotal += p.total_method_money
                    }else{
                        paymentMethodDiscount += p.total_method_money
                    }
                })
                console.log("tempclosedtotal", tempClosedTotal)
                let tempPaymentMethods = JSON.parse(localStorage.getItem("PaymentMethods"))
                tempPaymentMethods.forEach((item)=>{
                    item.total_method_money = 0
                })

                const tempTotalPrice = (data.check_info[0].totalmoney)
                console.log(tempPaymentMethods)
                setCheckCount(data.check_info[0].totalcheckcount)
                setClosedTotal(tempClosedTotal.toFixed(2))
                setOpenTotal((data.check_info[0].totalmoney - tempClosedTotal) || 0)
                setTax(data.check_info[0].totaltaxes.toFixed(2))
                setDiscountTotal((data.check_info[0].totaldiscount + paymentMethodDiscount).toFixed(2))
                setServiceChargeTotal((data.check_info[0].totalservicecharge).toFixed(2))
                setGuestCount(data.check_info[0].guestcount || 0)
                setPaymentMethods(data.payments.length > 0 ? data.payments : tempPaymentMethods)
                setNet((tempTotalPrice - data.check_info[0].totaltaxes).toFixed(2))
                setTotal(tempTotalPrice.toFixed(2))
                setAveragePerCheck((tempTotalPrice / data.check_info[0].totalcheckcount).toFixed(2) || 0)
                setPeakHour(data.busiest_hours[0])
                if(data.check_info[0].guestcount == 0){
                    setAveragePerPerson(tempTotalPrice)
                }else{
                    setAveragePerPerson(tempTotalPrice / data.check_info[0].guestcount)
                }
            }
        }
        catch (error) {
            console.log(error)
        }

    }
    useEffect(()=>{
        console.log("peak hour", peakHour)
    },[peakHour])
    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        setDate(date)
        getDailyFromDB(date);
        setRestaurant(localStorage.getItem("Restaurant"))
    }, [])
    useEffect(()=>{
        console.log("paymentMethods", paymentMethods)
    },[paymentMethods])
    function displayMonthlyIncome() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = "01"
        const date2 = `${year}-${month}-${day}`;
        console.log([date2, date])
        getDailyFromDB([date2, date]);
    }
    useEffect(()=>{
        console.log(date)
    },[date])
    return (
        <div style={{ overflow: "auto" }} className={staticStyles["containers"]}>
            <div style={{ width: "100%" }} className={staticStyles["middle-bar"]}>
                <div className={staticStyles["middle-bar-top-bar"]}>
                    <div className={staticStyles["go-back-button"]}>
                        <button onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                    </div>
                    <div className={staticStyles["datetime"]}>
                        <Clock></Clock>
                    </div>
                </div>
                <div className={styles["income-container"]}>
                    <div className={styles["income-summary"]}>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Toplam Ciro</p>
                            <p className={styles["summary-data"]}>{total}₺</p>
                            <p className={styles["last-week-comp"]}> Açık Çekler: {openTotal}₺ Kapalı Çekler: {closedTotal}₺</p>
                        </div>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Toplam Müşteri</p>
                            <p className={styles["summary-data"]}>{guestCount} Kişi</p>
                            <p className={styles["last-week-comp"]}>
                            </p>
                        </div>
                    </div>
                    <div className={styles["income-summary"]}>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Müşteri Başına Ortalama</p>
                            <p className={styles["summary-data"]}>{averagePerPerson.toFixed(2)}₺</p>
                            <p className={styles["last-week-comp"]}>

                            </p>
                        </div>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>En Yoğun Saat</p>
                            <p className={styles["summary-data"]}>{peakHour?.hour}:00</p>
                            <p className={styles["last-week-comp"]}> {peakHour?.total_guest_count} müşteri ile {peakHour?.total_method_money}₺ ciro. </p>
                        </div>
                    </div>
                </div>

                <div className={styles["payment-methods"]}>
                    <div className={`${styles["method"]} ${styles["summary-headers"]}`}>
                        <p className={styles["summary-headers"]}>Ödeme Şekilleri</p>
                        {paymentMethods.map((method, index) => {
                            if (method.includedincome == true) {
                                console.log(method)
                                return <>
                                    <div className={styles["payment-method"]}>
                                        <p>{method.name}</p>
                                        <p className={styles["payment-amount"]}>{method.total_method_money}₺</p>
                                    </div>
                                </>
                            }
                        })}

                    </div>
                </div>

                <div className={styles["action-buttons-container"]}>
                    <div className={styles["action-buttons"]}>
                        <button style={{width:"100%"}} onClick={() => setDisplayCalendar(!displayCalendar)} style={{ backgroundColor: "#16A34A  " }}>Tarih Seç</button>
                        <button onClick={() => displayMonthlyIncome()} style={{ backgroundColor: "#DC2626" }}>Aylık</button>
                        <button onClick={() => setDisplayDetailedIncome(!displayDetailedIncome)} style={{ backgroundColor: "#6366f1" }}>Detaylı Rapor</button>
                        <button style={{ backgroundColor: "#9333EA" }}>Yazdır</button>
                    </div>
                    <div  className={styles["action-buttons"]}>
                    </div>
                </div>
                {displayCalendar && (
                    <div className={styles["calendar"]}>
                        <div className={styles["calendar-headers"]}>
                            <button onClick={() => setDisplayCalendar(false)} className={styles["calendar-close"]}>
                                <i className="bi bi-x-circle"></i>
                            </button>
                            <h1>Tarih Seçiniz</h1>
                        </div>
                        <Calendar selectRange={true} onChange={onChangeDate} value={date} />
                        <button onClick={() => { (getDailyFromDB(date)); setDisplayCalendar(false) }} className={styles["change-date-button"]}> Seçimi Onayla</button>
                    </div>
                )
                }

            </div>
            {displayDetailedIncome && (
                <div className={styles["detailed-income-container"]}>
                    <div className={styles["detailed-income-headers"]}>
                        <button>
                            <i onClick={()=>setDisplayDetailedIncome(false)} className="bi bi-x-circle"></i>
                        </button>
                        <h1>Detaylı Rapor</h1>
                    </div>
                    <div className={styles["detailed-income-dates"]}>
                        {Array.isArray(date) ? 
                        <>
                        <p>Başlangıç Tarihi <span> {date[0]} </span> </p>
                        <p>Bitiş Tarihi <span> {date[1]} </span></p>
                        </>
                        :<>
                        <p>Başlangıç Tarihi <span> {date} </span> </p>
                        <p>Bitiş Tarihi <span> {date} </span></p>
                        </> }
                        <p>İşletme <span> {restaurant} </span> </p>
                    </div>
                    <div className={styles["income-details"]}>
                        <p>Brüt <span>{total}₺</span></p>
                        <p>Net <span> {net}₺ </span></p>
                        <p>Vergi <span> {tax}₺ </span> </p>
                        <p>İndirim <span> {discountTotal}₺ </span></p>
                        <p>Servis Ücreti <span> {serviceChargeTotal}₺ </span></p>
                        <p>Hesap Sayısı <span> {checkCount} Adet </span></p>
                        <p>Müşteri Sayısı <span> {guestCount}</span></p>
                        <p>Müşteri Başına Tutar <span>{averagePerPerson.toFixed(2)}₺</span></p>
                        <p>Ortalama Hesap Tutarı <span>{averagePerCheck}₺</span> </p>
                    </div>
                    <div className={styles["payment-details"]}>
                        {paymentMethods?.map((method, index) => (
                            <p>{method.name} <span> {method.total_method_money}₺ </span> </p>
                        ))}
                    </div>

                </div>
            )}
        </div>
    )
}
export default Income