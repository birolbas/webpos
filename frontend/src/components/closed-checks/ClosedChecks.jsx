import staticStyles from '../staticStyle/StaticStyle.module.css'
import Clock from '../staticStyle/Clock'
import styles from './ClosedChecks.module.css'
import { useNavigate } from 'react-router-dom'
import { use, useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import calendarStyle from '../income/Income.module.css'
function ClosedChecks() {
    const navigate = useNavigate()
    const [closedChecks, setClosedChecks] = useState([])
    const [actionBoxIndex, setActionBoxIndex] = useState()
    const [isActionBox, setIsActionBox] = useState(false)

    const [isDeleteBox, setIsDeleteBox] = useState(false)

    const [isReOpenCheck, setIsReOpenCheck] = useState(false)
    const [cantReOpen, setCantReOpen] = useState(false)
    const [chosenCheckIndex, setChosenCheckIndex] = useState()
    const [chosenCheckId, setChosenCheckId] = useState()
    const [chosenCheckDate, setChosenCheckDate] = useState()
    const [chosenCheckTableId, setChosenCheckTableId] = useState()

    const [displayCalendar, setDisplayCalendar] = useState(false)
    const [date, setDate] = useState();
    const onChangeDate = date => {
        date[0] = date[0].toISOString().slice(0, 10)
        date[1] = date[1].toISOString().slice(0, 10)
        setDate({
            startingDate : date[0],
            endingDate: date[1]
        })
        console.log(date)
    }
    const getClosedChecksFromDB = async (paramDate) => {
        const response = await fetch("http://localhost:5000/closed_checks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(paramDate)
        })
        const data = await response.json()
        console.log("data is ", data)
        setClosedChecks(data)
    }
    useEffect(() => {        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        
        setDate({
            startingDate : date,
            endingDate: date
        })
        const onMountDate = {
            startingDate : date,
            endingDate: date
        }
        getClosedChecksFromDB(onMountDate)
    }, [])

    useEffect(()=>{
        console.log("date isasdf ", JSON.stringify(date)
)
    },[date])
    async function deleteClosedCheck() {
        const bodyJson = {
            deleteCheckId: chosenCheckId,
            deleteCheckDate: chosenCheckDate,
            deleteCheckTableId: chosenCheckTableId
        }
        const response = await fetch("http://localhost:5000/delete_closed_check", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(bodyJson)
        })
        if (response.ok) {
            const tempClosedChecks = [...closedChecks]
            tempClosedChecks.splice(chosenCheckIndex, 1)
            setClosedChecks(tempClosedChecks)
            setChosenCheckIndex()
            setChosenCheckId()
            setChosenCheckDate()
            setChosenCheckTableId()
            setIsDeleteBox(false)
        }
    }
    async function reOpenCheck() {
        setIsReOpenCheck(false)
        const bodyJson = {
            reOpenCheckId: chosenCheckId,
            reOpenCheckDate: chosenCheckDate,
            reOpenCheckTableId: chosenCheckTableId
        }
        const response = await fetch("http://localhost:5000/reopen_closed_check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(bodyJson)
        })
        const data = await response.json()
        console.log("data is", data)
        if (data["status"] == "success") {
            const tempClosedChecks = [...closedChecks]
            tempClosedChecks.splice(chosenCheckIndex, 1)
            setClosedChecks(tempClosedChecks)

            navigate(`/tables/${chosenCheckTableId}`)
        }
        else {
            setCantReOpen(true)
            setChosenCheckIndex()
            setChosenCheckId()
            setChosenCheckDate()
            setChosenCheckTableId()
        }
    }
    return <div style={{ overflowX: "hidden" }}>
        <div style={{ width: "100%" }} className={staticStyles['middle-bar']}>
            <div className={staticStyles['middle-bar-top-bar']}>
                <div className={staticStyles["go-back-button"]}>
                    <button onClick={() => navigate("/tables")}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div className={staticStyles["datetime"]}>
                        <Clock></Clock>
                    </div>
                </div>
            </div>
            <h1 style={{color:"black"}}>Kapalı Çekler</h1>
            <div className={styles["filter-check"]}>
                <input placeholder='Çek Ara' type="text" />
                <button onClick={()=>setDisplayCalendar(true)}>Tarih Seç</button>
            </div>
            <div className={styles["closed-checks-headers"]}>
                <p>İşlem</p>
                <p style={{ textAlign: "left" }}>Çek Numarası</p>
                <p>Masa Adı</p>
                <p>Tutar ve Ödeme Türü</p>
                <p>Kişi Sayısı</p>
                <p>Kapanış Tarihi</p>
                <p>Çalışan</p>
            </div>
            <div className={styles["closed-cheks"]}>
                {closedChecks.map((check, index) => (
                    <div className={styles["check"]}>
                        <div onClick={() => { setIsActionBox(!isActionBox); setActionBoxIndex(index) }} className={styles["action-container"]}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="50%" width="30" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                            </svg>
                            {isActionBox && index == actionBoxIndex ? (<>
                                <div className={styles["actions"]}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="30" width="30" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16"><path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"></path></svg>
                                    <div className={styles["action-header"]}>
                                        <h1>Çek İşlemleri</h1>
                                    </div>
                                    <div className={styles["action-options"]}>
                                        <div onClick={() => { setChosenCheckDate(check.closing_date); setChosenCheckId(check.id); setIsReOpenCheck(true); setIsDeleteBox(false); setChosenCheckIndex(index); setChosenCheckTableId(check.table_id) }} className={styles["check-action"]}>
                                            <svg style={{ color: "green" }} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-recycle" viewBox="0 0 16 16">
                                                <path d="M9.302 1.256a1.5 1.5 0 0 0-2.604 0l-1.704 2.98a.5.5 0 0 0 .869.497l1.703-2.981a.5.5 0 0 1 .868 0l2.54 4.444-1.256-.337a.5.5 0 1 0-.26.966l2.415.647a.5.5 0 0 0 .613-.353l.647-2.415a.5.5 0 1 0-.966-.259l-.333 1.242zM2.973 7.773l-1.255.337a.5.5 0 1 1-.26-.966l2.416-.647a.5.5 0 0 1 .612.353l.647 2.415a.5.5 0 0 1-.966.259l-.333-1.242-2.545 4.454a.5.5 0 0 0 .434.748H5a.5.5 0 0 1 0 1H1.723A1.5 1.5 0 0 1 .421 12.24zm10.89 1.463a.5.5 0 1 0-.868.496l1.716 3.004a.5.5 0 0 1-.434.748h-5.57l.647-.646a.5.5 0 1 0-.708-.707l-1.5 1.5a.5.5 0 0 0 0 .707l1.5 1.5a.5.5 0 1 0 .708-.707l-.647-.647h5.57a1.5 1.5 0 0 0 1.302-2.244z" />
                                            </svg>
                                            <p> Çeki Geri Aç</p>
                                        </div>
                                        <div onClick={() => { setChosenCheckDate(check.closing_date); setChosenCheckId(check.id); setIsReOpenCheck(false); setIsDeleteBox(true); setChosenCheckIndex(index); setChosenCheckTableId(check.table_id) }} className={styles["check-action"]}>
                                            <svg style={{ color: "red" }} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                            </svg>
                                            <p>Çeki Sil</p>
                                        </div>
                                    </div>
                                </div></>
                            ) : ""}
                        </div>
                        <p style={{ textAlign: "left" }}> {check.id} </p>
                        <p> {check.table_id} </p>
                        <p style={{ display: "flex", flexDirection: "column" }}> {check.payments.length > 1 ? (
                            <>
                                <span>{check.payments[0].paymentType.name} {check.payments[0].payedPrice}₺</span>
                                <span>+{(check.payments.length) - 1} Ödeme</span>
                            </>

                        ) : <> <span>{check.payments[0].paymentType.name} </span>
                            <span>{check.payments[0].payedPrice}₺</span>
                        </>}
                        </p>

                        <p> {check.guest_count} Kişi </p>
                        <p> {check.closing_date} </p>
                        <p> ÇALIŞAN ADI </p>

                    </div>
                ))}
            </div>

        </div>
        {isDeleteBox && (
            <div className={styles["confirm-container"]}>
                <div className={styles["exclamation"]} >
                    <svg style={{ color: "white" }} xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-exclamation-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
                    </svg>
                </div>
                <div className={styles["confirm-text"]}>
                    <h1>Emin Misiniz?</h1>
                    <p>Çeki silmek istediğinizden emin misiniz? Geri açma şansınız olmayacak!</p>
                </div>
                <div className={styles["confirm-buttons"]}>
                    <button onClick={() => setIsDeleteBox(false)}>İptal</button>
                    <button onClick={() => deleteClosedCheck()} style={{ backgroundColor: "red", color: "white" }}>Çeki Sil</button>
                </div>
            </div>
        )}
        {isReOpenCheck && (
            <div className={styles["confirm-container"]}>
                <div className={styles["exclamation"]} >
                    <svg style={{ color: "white" }} xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-exclamation-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
                    </svg>
                </div>
                <div className={styles["confirm-text"]}>
                    <h1>Emin Misiniz?</h1>
                    <p>Çeki geri açmak istediğinizden emin misiniz?</p>
                </div>
                <div className={styles["confirm-buttons"]}>
                    <button onClick={() => setIsReOpenCheck(false)}>İptal</button>
                    <button onClick={() => reOpenCheck()} style={{ backgroundColor: "green", color: "white" }}>Çeki Geri Aç</button>
                </div>
            </div>
        )}
        {cantReOpen && (
            <div className={styles["confirm-container"]}>
                <div className={styles["exclamation"]} >
                    <svg style={{ color: "white" }} xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-exclamation-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
                    </svg>
                </div>
                <div className={styles["confirm-text"]}>
                    <h1>Hata</h1>
                    <p>Hali hazırda bu masa adında bir çek açık. Lütfen açık çeki kapattıktan sonra tekrar deneyiniz.</p>
                </div>
                <div style={{ gridTemplateColumns: "1fr" }} className={styles["confirm-buttons"]}>
                    <button onClick={() => setCantReOpen(false)}>Tamam</button>
                </div>
            </div>
        )}
        {displayCalendar && (
            <div className={calendarStyle["calendar"]}>
                <div className={calendarStyle["calendar-headers"]}>
                    <button onClick={() => setDisplayCalendar(false)} className={calendarStyle["calendar-close"]}>
                        <i className="bi bi-x-circle"></i>
                    </button>
                    <h1>Tarih Seçiniz</h1>
                </div>
                <Calendar selectRange={true} onChange={onChangeDate}  />
                <button onClick={() => { getClosedChecksFromDB(date); setDisplayCalendar(false) }} className={calendarStyle["change-date-button"]}> Seçimi Onayla</button>
            </div>
        )
        }
    </div>
}
export default ClosedChecks