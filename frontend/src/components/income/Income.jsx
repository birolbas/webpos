import staticStyles from '../staticStyle/StaticStyle.module.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Income.module.css'
import Clock from '../staticStyle/Clock'
function Income() {
    const navigate = useNavigate()
    const [day, setDate] = useState()
    const [payments, setPayments] = useState({
        "Kredi Kartı": 0,
        "Nakit" : 0,
        "Total": 0,
        "Average Check":0
    })



    useEffect(()=>{

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;


        const getDailyFromDB = async ()=>{
            try {
                const response = await fetch("http://localhost:5000/income",{
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(date)
                })
                if(response.ok){
                    const data = await response.json()
                    console.log(data)
                    const pTypes = {
        "Kredi Kartı": 0,
        "Nakit" : 0,
        "Total": 0,
        "Average Check":0
        }
                    console.log()
                    data.forEach((check, index)=>{
                        check[7].forEach((payment,_)=>{
                            const paymentType = payment.paymentType
                            console.log("asdfasdfasdf",payment.payedPrice)
                            pTypes[paymentType] += parseFloat(payment.payedPrice)
                            pTypes["Total"] += parseFloat(payment.payedPrice)
                        })
                    })
                    pTypes['Average Check'] = (pTypes["Total"] / data.length).toFixed(2)
                    console.log(pTypes)
                    setPayments(pTypes)
                }
            }
            catch(error){
                console.log(error)
            }
            
        }
        getDailyFromDB();
    },[])











    return (
        <div style={{ overflow: "auto"}} className={staticStyles["containers"]}>
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
                            <p className={styles["last-week-comp"]}>
                                <svg style={{marginRight:"5px"}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4 text-green-400 mr-1"
                                ><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>
                                </svg>
                            +135₺
                            </p>
                        </div>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Toplam Müşteri</p>
                            <p className={styles["summary-data"]}>1200₺</p>
                            <p className={styles["last-week-comp"]}>
                                <svg style={{marginRight:"5px"}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4 text-green-400 mr-1"
                                ><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>
                                </svg>
                            +135₺
                            </p>                            
                        </div>
                    </div>
                    <div className={styles["income-summary"]}>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>Ortalama Fiş</p>
                            <p className={styles["summary-data"]}>{payments["Average Check"]}₺</p>
                            <p className={styles["last-week-comp"]}>
                                <svg style={{marginRight:"5px"}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4 text-green-400 mr-1"
                                ><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>
                                </svg>
                            +135₺
                            </p>
                        </div>
                        <div className={styles["summary"]}>
                            <p className={styles["summary-headers"]}>En Yoğun Saat</p>
                            <p className={styles["summary-data"]}>1200₺</p>
                            <p className={styles["last-week-comp"]}>
                                <svg style={{marginRight:"5px"}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4 text-green-400 mr-1"
                                ><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>
                                </svg>
                            +135₺
                            </p>                       
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
                        <button style={{backgroundColor:"green"}}>Tarih Seç</button>
                        <button style={{backgroundColor:"red"}}>Aylık</button>
                    </div>
                    <div className={styles["action-buttons"]}>
                        <button style={{backgroundColor:"blue"}}>Detaylı Rapor</button>
                        <button style={{backgroundColor:"purple"}}>Yazdır</button>
                    </div>                    
                </div>

            </div>
        </div>)
}
export default Income