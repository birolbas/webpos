import staticStyles from '../staticStyle/StaticStyle.module.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Calendar-override.css'
import styles from './Income.module.css'
import Clock from '../staticStyle/Clock'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

function Income() {
    const navigate = useNavigate()
    const [payments, setPayments] = useState({
        "Kredi Kartı": 0,
        "Nakit": 0,
        "Total": 0,
        "Average Check": 0
    })
    const [peakHour, setPeakHour] = useState({})
    const [date, setDate] = useState();

    function displayCalendar() {
        document.getElementsByClassName(styles["calendar"])[0].style.display = "block"
    }
    function displayCalendarNone(){
        document.getElementsByClassName(styles["calendar"])[0].style.display = "none"

    }
    const onChangeDate = date => {
        date[0] = date[0].toISOString().slice(0, 10)
        date[1] = date[1].toISOString().slice(0, 10)
        setDate([date[0], date[1]])

    }

    useEffect(()=>{
        console.log(date)
    },[date])

    const getDailyFromDB = async (date) => {

        console.log("date is",date)
        try {
            const response = await fetch("http://localhost:5000/income", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(date)
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data)
                const pTypes = {
                    "Kredi Kartı": 0,
                    "Nakit": 0,
                    "Total": 0,
                    "Average per Person": 0,
                    "Guest Count": 0,
                    "Peak Hours": [],
                    "Open Total": 0,
                    "Closed Total": 0
                }
                console.log()
                console.log("data is ", data)
                data.forEach((check, index) => {
                    pTypes["Guest Count"] += parseInt(check[7])
                    const time = (check[8])
                    let [hour, _] = time.split(":")
                    hour = hour + ":00"
                    const peakHourData = {
                        hour: hour,
                        guestCount: check[7],
                        income: check[6],
                    }
                    
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

                    if (check[5]?.length) {
                        check[5].forEach((payment, _) => {
                            const paymentType = payment.paymentType
                            console.log("asdfasdfasdf", payment.payedPrice)
                            pTypes[paymentType] += parseFloat(payment.payedPrice)
                            pTypes["Total"] += parseFloat(payment.payedPrice)
                        })
                    } else {
                        pTypes["Total"] += parseFloat(data[index][4])
                    }
                })
                if ((pTypes["Guest Count"]) == 0) {
                    pTypes['Average Check'] = pTypes["Total"]
                } else {
                    pTypes['Average Check'] = (pTypes["Total"] / pTypes["Guest Count"]).toFixed(2)
                }
                if (isNaN(pTypes["Average per Person"]) === true) {
                    pTypes["Average per Person"] = 0
                }
                console.log(pTypes["Guest Count"])
                pTypes["Open Total"] = pTypes["Total"] - pTypes["Kredi Kartı"] - pTypes["Nakit"]
                pTypes["Closed Total"] = pTypes["Total"] - pTypes["Open Total"] 

                setPayments(pTypes)
                console.log("peak saatler", pTypes["Peak Hours"])
                if(pTypes["Peak Hours"].length > 0){
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
    }, [])



    return (
        <div style={{ overflow: "auto" }} className={staticStyles["containers"]}>
            <div style={{ width: "100%" }} className={staticStyles["middle-bar"]}>
                <div className={staticStyles["middle-bar-top-bar"]}>
                    <div className={staticStyles["go-back-button"]}>
                        <button onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-return-left"></i>
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
                            <p className={styles["last-week-comp"]}> Açık Çekler: {payments["Open Total"]}₺ Kapalı Çekler: {payments["Closed Total"]} </p>
                        </div>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Toplam Müşteri</p>
                            <p className={styles["summary-data"]}>{payments["Guest Count"]} Kişi</p>
                            <p className={styles["last-week-comp"]}>
                                <svg style={{ marginRight: "5px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4 text-green-400 mr-1"
                                ><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>
                                </svg>
                                +135₺
                            </p>
                        </div>
                    </div>
                    <div className={styles["income-summary"]}>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Müşteri Başına Ortalama</p>
                            <p className={styles["summary-data"]}>{payments["Average Check"]}₺</p>
                            <p className={styles["last-week-comp"]}>
                                <svg style={{ marginRight: "5px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4 text-green-400 mr-1"
                                ><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>
                                </svg>
                                +135₺
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
                        <div className={styles["payment-method"]}>
                            <p>Kredi Kartı</p>
                            <p className={styles["payment-amount"]}>{payments['Kredi Kartı']}₺</p>
                        </div>
                        <div className={styles["payment-method"]}>
                            <p>Nakit</p>
                            <p className={styles["payment-amount"]}>{payments['Nakit']}₺</p>
                        </div>
                    </div>
                </div>

                <div className={styles["action-buttons-container"]}>
                    <div className={styles["action-buttons"]}>
                        <button onClick={() => (displayCalendar())} style={{ backgroundColor: "green" }}>Tarih Seç</button>
                        <button style={{ backgroundColor: "red" }}>Aylık</button>
                    </div>
                    <div className={styles["action-buttons"]}>
                        <button style={{ backgroundColor: "blue" }}>Detaylı Rapor</button>
                        <button style={{ backgroundColor: "purple" }}>Yazdır</button>
                    </div>
                </div>
                <div className={styles["calendar"]}>
                    <div className={styles["calendar-headers"]}>
                        <button onClick={displayCalendarNone} className={styles["calendar-close"]}>
                            <i className="bi bi-x-circle"></i>
                        </button>
                        <h1>Tarih Seçiniz</h1>
                    </div>
                    <Calendar selectRange={true} onChange={onChangeDate} value={date} />
                    <button onClick={()=>{(getDailyFromDB(date)); displayCalendarNone() }} className={styles["change-date-button"]}> Seçimi Onayla</button>
                </div>

            </div>
        </div>)
} 
export default Income