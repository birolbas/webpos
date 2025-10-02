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
    const [paymentMethods, setPaymentMethods] = useState(JSON.parse(localStorage.getItem("PaymentMethods")))
    const [payments, setPayments] = useState({
        "Kredi Kartı": 0,
        "Nakit": 0,
        "Total": 0,
        "Average Check": 0
    })
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
                const pTypes = {
                    "Total": 0,
                    "Net": 0,
                    "Tax": 0,
                    "DiscountTotal": 0,
                    "ServiceChargeTotal": 0,
                    "CheckCount": 0,
                    "Guest Count": 0,
                    "Average per Person": 0,
                    "Average per Check": 0,
                    "Payment Methods": paymentMethods,
                    "Peak Hours": [],
                    "Open Total": 0,
                    "Closed Total": 0,
                }
                pTypes["Payment Methods"].forEach((type, index) => {
                    type["Total"] = 0
                })
                console.log("data", data)
                data.forEach((check, index) => {
                    pTypes["Tax"] += check[13]
                    pTypes["Guest Count"] += parseInt(check[7])
                    pTypes["ServiceChargeTotal"] += check[11]
                    pTypes["DiscountTotal"] += check[10]
                    pTypes["CheckCount"] += 1
                    const time = (check[8])
                    let [hour, _] = time.split(":")
                    hour = hour + ":00"
                    const peakHourData = {
                        hour: hour,
                        guestCount: check[7],
                        income: check[6],
                    }



                    if (check[5]?.length > 0) {
                        check[5].forEach((payment, _) => {
                            const paymentType = payment.paymentType.name
                            console.log("SEÇİLEN ÖDEME TYÜRÜ", paymentType)
                            console.log("PAYMENT", payment)
                            console.log(pTypes["Payment Methods"])
                            const methodIndex = pTypes["Payment Methods"].findIndex(p => p.name == paymentType)
                            console.log("pTypes[Payment Methods][index]", pTypes["Payment Methods"][methodIndex])
                            console.log("methodIndeasdx", methodIndex)
                            pTypes["Payment Methods"][methodIndex].Total += parseFloat(payment.payedPrice)
                            if (payment.paymentType.includedIncome == "Evet") {
                                pTypes["Total"] += parseFloat(payment.payedPrice)
                                let existingHour = pTypes["Peak Hours"].find(h => h.hour === hour)
                                if (existingHour) {
                                    existingHour.total += parseFloat(check[4])
                                    existingHour.guestCount += check[7]
                                } else {
                                    pTypes["Peak Hours"].push({
                                        hour: hour,
                                        guestCount: check[7],
                                        total: parseFloat(check[4])
                                    });
                                }
                            }

                        })
                    } else {
                        pTypes["Total"] += parseFloat(data[index][4])

                    }
                })
                if ((pTypes["Guest Count"]) == 0) {
                    pTypes['Average Check'] = pTypes["Total"]
                } else {
                    pTypes['Average Check'] = (parseFloat(pTypes["Total"]) / parseFloat(pTypes["Guest Count"])).toFixed(2)


                }
                if (isNaN(pTypes["Average per Person"]) === true) {
                    pTypes["Average per Person"] = 0
                }

                let closedSum = 0
                pTypes["Payment Methods"].forEach((method, _) => {
                    console.log("method", method)
                    if (method.includedIncome == "Evet") {
                        closedSum += parseFloat(method.Total)
                    }
                })
                pTypes["Closed Total"] = closedSum
                pTypes["Open Total"] = parseFloat(pTypes["Total"]) - closedSum
                pTypes["Net"] = pTypes["Total"] - pTypes["Tax"]
                if (pTypes["CheckCount"] != 0) {
                    pTypes["Average per Check"] = (pTypes["Total"] / pTypes["CheckCount"]).toFixed(2)
                }
                setPayments(pTypes)
                if (pTypes["Peak Hours"].length > 0) {
                    const peak = pTypes["Peak Hours"]?.reduce((max, current) =>
                        current.total > max.total ? current : max
                    )
                    setPeakHour(peak)
                }
            }
        }
        catch (error) {
            console.log(error)
        }

    }
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

    function displayMonthlyIncome() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = "01"
        const date2 = `${year}-${month}-${day}`;
        console.log([date2, date])
        getDailyFromDB([date2, date]);
    }

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
                            <p className={styles["summary-data"]}>{payments["Total"]}₺</p>
                            <p className={styles["last-week-comp"]}> Açık Çekler: {payments["Open Total"]}₺ Kapalı Çekler: {payments["Closed Total"]}₺</p>
                        </div>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Toplam Müşteri</p>
                            <p className={styles["summary-data"]}>{payments["Guest Count"]} Kişi</p>
                            <p className={styles["last-week-comp"]}>
                            </p>
                        </div>
                    </div>
                    <div className={styles["income-summary"]}>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Müşteri Başına Ortalama</p>
                            <p className={styles["summary-data"]}>{payments["Average Check"]}₺</p>
                            <p className={styles["last-week-comp"]}>

                            </p>
                        </div>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>En Yoğun Saat</p>
                            <p className={styles["summary-data"]}>{peakHour.hour}</p>
                            <p className={styles["last-week-comp"]}> {peakHour.guestCount} müşteri ile {peakHour.total}₺ ciro. </p>
                        </div>
                    </div>
                </div>

                <div className={styles["payment-methods"]}>
                    <div className={`${styles["method"]} ${styles["summary-headers"]}`}>
                        <p className={styles["summary-headers"]}>Ödeme Şekilleri</p>
                        {paymentMethods.map((method, index) => {
                            if (method.includedIncome == "Evet") {
                                return <>
                                    <div className={styles["payment-method"]}>
                                        <p>{method.name}</p>
                                        <p className={styles["payment-amount"]}>{method.Total}₺</p>
                                    </div>
                                </>
                            }
                        })}

                    </div>
                </div>

                <div className={styles["action-buttons-container"]}>
                    <div className={styles["action-buttons"]}>
                        <button onClick={() => setDisplayCalendar(!displayCalendar)} style={{ backgroundColor: "#14b8a6" }}>Tarih Seç</button>
                        <button onClick={() => displayMonthlyIncome()} style={{ backgroundColor: "#f97316" }}>Aylık</button>
                    </div>
                    <div className={styles["action-buttons"]}>
                        <button onClick={() => setDisplayDetailedIncome(!displayDetailedIncome)} style={{ backgroundColor: "#6366f1" }}>Detaylı Rapor</button>
                        <button style={{ backgroundColor: "#ec4899" }}>Yazdır</button>
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
                        <p>Başlangıç Tarihi <span> {date[0]} </span> </p>
                        <p>Bitiş Tarihi <span> {date[1]} </span></p>
                        <p>İşletme <span> {restaurant} </span> </p>
                    </div>
                    <div className={styles["income-details"]}>
                        <p>Brüt <span>{payments["Total"]}₺</span></p>
                        <p>Net <span> {payments["Net"]}₺ </span></p>
                        <p>Vergi <span> {payments["Tax"].toFixed(2)}₺ </span> </p>
                        <p>İndirim <span> {payments["DiscountTotal"]}₺ </span></p>
                        <p>Servis Ücreti <span> {payments["ServiceChargeTotal"]}₺ </span></p>
                        <p>Hesap Sayısı <span> {payments["CheckCount"]} </span></p>
                        <p>Müşteri Sayısı <span>{payments["Guest Count"]}</span></p>
                        <p>Müşteri Başına Tutar <span>{payments["Average per Person"]}₺</span></p>
                        <p>Ortalama Hesap Tutarı <span>{payments["Average per Check"]}₺</span> </p>
                    </div>
                    <div className={styles["payment-details"]}>
                        {payments["Payment Methods"].map((method, index) => (
                            <p>{method.name} <span> {method.Total}₺ </span> </p>
                        ))}
                    </div>

                </div>
            )}
        </div>
    )
}
export default Income