import "bootstrap-icons/font/bootstrap-icons.css"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Link } from 'react-router-dom';
import Order from '../order/Order'
import Settings from "../settings/Settings"
import staticStyles from '../staticStyle/StaticStyle.module.css'
import tablesStyle from './Tables.module.css'
import Clock from "../staticStyle/Clock"
import LeftBar from "../staticStyle/LeftBar"
function Tables() {
    const params = useParams();
    console.log(params)
    const [tables, setTables] = useState([])
    const [chosenTable, setChosenTable] = useState("")
    const [isSettings, setIsSettings] = useState(false)


    const getTables = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/tables")

            if (response.ok) {
                const data = await response.json()
                console.log(data)
                setTables(data)
            } else {
                console.log("error happened", response.statusText)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getTables()
    }, [])

    if (isSettings) {
        return <Settings />
    } else if (chosenTable) {
        return <Order table_id={chosenTable}></Order>
    } else {
        return (
            <div className={staticStyles.containers}>
                <LeftBar></LeftBar>
                <div style={{ width: "100%" }} className={staticStyles['middle-bar']}>
                    <div className={staticStyles['middle-bar-top-bar']}>
                        <div className={staticStyles["datetime"]}>
                            <Clock></Clock>
                        </div>
                        <div className={staticStyles['search-bar']}>
                            <form action="/search" method="get">
                                <input
                                    type="text"
                                    id="search"
                                    name="q"
                                    placeholder="Search products..."
                                />
                            </form>
                        </div>
                    </div>
                    <div className={tablesStyle['tables-items']}>
                        <div className={tablesStyle["tables"]}>
                            {tables.map((table, index) => (
                                <Link className={tablesStyle['table-buttons']}
                                    key={index}
                                    to={`/tables/${table[0]}`}
                                    style={{ backgroundColor: table[1] > 0 ? "aquamarine" : "" }}>
                                    <div className={tablesStyle['table-species']}>
                                        <span className={tablesStyle['table-id']}>{table[0]}</span>{" "}
                                        <span className={tablesStyle['table-price']}>{table[1]}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Tables
