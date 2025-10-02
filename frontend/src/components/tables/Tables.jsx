import "bootstrap-icons/font/bootstrap-icons.css"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Link } from 'react-router-dom';
import Order from '../order/Order'
import staticStyles from '../staticStyle/StaticStyle.module.css'
import tablesStyle from './Tables.module.css'
import Clock from "../staticStyle/Clock"

function Tables() {
    const location = useLocation();
    const navigate = useNavigate();
    const [tables, setTables] = useState([])
    const [chosenTable, setChosenTable] = useState("")
    const [isFloors, setIsFloors] = useState(false)
    const [floors, setFloors] = useState([])
    const [chosenFloor, setChosenFloor] = useState([])
    const [row, setRow] = useState()
    const [col, setCol] = useState()
    const [tablePricing, setTablePricing] = useState([])
    const [chosenFloorTables, setChosenFloorTables] = useState([])
    const [activeFilter, setActiveFilter] = useState("table-grid")
    async function getTables() {
        const data = JSON.parse(localStorage.getItem("TableLayout"))
        const tablePriceData = await fetch("http://127.0.0.1:5000/get_orders",{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            })
        const table_prices = await tablePriceData.json()
        console.log("tables prices", table_prices)
        setTablePricing(table_prices)
        setChosenFloor(data[0])
        console.log("data[0]", data[0])
        setCol(data[0].gridCol)
        setRow(data[0].gridrow)
        setFloors(data)
        console.log("floordata", data)
        const table = []
        data.forEach((data, _) => {
            const floorTables = data.tables
            floorTables.forEach((item, _) => {
                const existingIndex = table_prices.findIndex(pData => pData.table_id === item.tableName)
                if (existingIndex !== -1) {
                    const object = {
                        floorName: data.Name,
                        tableName: item.tableName,
                        tableGridCol: item.tableGridCol,
                        tableGridRow: item.tableGridRow,
                        tablePrice: parseFloat(table_prices[existingIndex].total_price).toFixed(2),
                        isCheckOpen: true
                    }
                    table.push(object)
                } else {
                    const object = {
                        floorName: data.Name,
                        tableName: item.tableName,
                        tableGridCol: item.tableGridCol,
                        tableGridRow: item.tableGridRow,
                        tablePrice: 0,
                        isCheckOpen: false
                    }
                    table.push(object)
                }
            })
        })
        setTables(table)
    }

    function changeFloor(e) {
        const floorName = e.target.textContent
        const index = (floors.findIndex(floor => floor.Name === floorName))
        setRow(floors[index].gridRow)
        setCol(floors[index].gridCol)
        setChosenFloor(floors[index])
        const table = []
        floors[index].tables.forEach((data, _) => {
            const existingIndex = tablePricing.findIndex(pData => pData.table_id === data.tableName)
            if (existingIndex !== -1) {
                const object = {
                    floorName: floorName,
                    tableName: data.tableName,
                    tableGridCol: data.tableGridCol,
                    tableGridRow: data.tableGridRow,
                    tablePrice: tablePricing[existingIndex].total_price,
                    isCheckOpen: true
                }
                table.push(object)
            } else {
                const object = {
                    floorName: floorName,
                    tableName: data.tableName,
                    tableGridCol: data.tableGridCol,
                    tableGridRow: data.tableGridRow,
                    tablePrice: 0,
                    isCheckOpen: false
                }
                console.log("obje", object)
                table.push(object)
            }
        })
        setIsFloors(false)
    }

    useEffect(() => {
        getTables()
    }, [])

    useEffect(() => {
        getTables()
    }, [location]);

    useEffect(() => {
        const style = document.getElementsByClassName(tablesStyle["tables"])[0]
        style.style.gridTemplateColumns = `repeat(${col},1fr)`
        style.style.gridTemplateRows = `repeat(${row},1fr)`
    }, [col, row])

    useEffect(() => {
        console.log("masalar", tables)
    }, [tables])

    useEffect(() => {
        const tempChosenFloorTables = []
        tables.forEach((table, _) => {
            if (table.floorName === chosenFloor.Name) {
                tempChosenFloorTables.push(table)
            }
        })
        setChosenFloorTables(tempChosenFloorTables)
    }, [chosenFloor])

    useEffect(() => {
        const options = document.querySelector(`.${tablesStyle["floor-choose"]}`)
        if (isFloors) {
            options.style.display = "block"
        } else {
            options.style.display = "none"
        }
    }, [isFloors])

    if (chosenTable) {
        return <Order table_id={chosenTable}></Order>
    } else {
        return (
            <div style={{overflowX:"hidden"}}>
                <div style={{ width: "100%" }} className={staticStyles['middle-bar']}>
                    <div className={staticStyles['middle-bar-top-bar']}>
                        <div className={staticStyles["go-back-button"]}>
                            <button onClick={() => navigate("/main_menu")}>
                                <i className="bi bi-arrow-left"></i>
                            </button>
                            <div className={staticStyles["datetime"]}>
                                <Clock></Clock>
                            </div>
                        </div>
                        {activeFilter == "table-grid" && (
                        <div className={tablesStyle["floors"]}>
                            <button onClick={() => setIsFloors(!isFloors)}>{chosenFloor?.Name}</button>
                                <div className={tablesStyle["floor-choose"]}>
                                    {floors.map((floor, _) => {
                                        return <div className={tablesStyle["floor-to-choose"]}><button onClick={(e) => (changeFloor(e))}>{floor.Name}</button> </div>;
                                    })}
                                </div>
                        </div>
                        )}
                    </div>
                    <div className={tablesStyle["table-check-filter-container"]}>
                        <button className={activeFilter == "table-grid" ? tablesStyle["table-check-filter-active"]: ""} onClick={()=>setActiveFilter("table-grid")}>Masa Düzeni</button>
                        <button className={activeFilter == "all-tables" ? tablesStyle["table-check-filter-active"]: ""} onClick={()=>setActiveFilter("all-tables")}>Tüm Masalar</button>
                        <button className={activeFilter == "open-checks" ? tablesStyle["table-check-filter-active"]: ""} onClick={()=>setActiveFilter("open-checks")}>Açık Çekler</button>
                        <button> <Link style={{color:"black"}} to="/closed_checks"> Kapalı Çekler</Link> </button>
                    </div>
                    {activeFilter == "table-grid" && (
                    <div className={tablesStyle['tables-items']}>
                        <div style={{gridTemplateColumns:`repeat(${col},1fr)`, gridTemplateRows: `repeat(${col},1fr)`}} className={tablesStyle["tables"]}>
                            {chosenFloorTables?.map((table, index) => (
                                <Link className={tablesStyle['table-buttons']}
                                    key={index}
                                    to={`/tables/${table.tableName}`}
                                    style={{
                                        backgroundColor: table.isCheckOpen ? "aquamarine" : "",
                                        gridColumnStart: table.tableGridCol,
                                        gridRowStart: table.tableGridRow,
                                        color: table.isCheckOpen ? "white" : "",
                                    }}>
                                    <div className={tablesStyle['table-species']}>
                                        <span className={tablesStyle['table-id']}>{table.tableName}</span>{" "}
                                        <span className={tablesStyle["table-price"]}>{table.tablePrice > 0 ? `${table.tablePrice} ₺` : ""}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    )}
                    {activeFilter == "all-tables" && (
                        <div className={tablesStyle["all-tables"]}>
                            {tables.map((table, index)=>(
                                <Link className={tablesStyle['table-buttons']}
                                    key={index}
                                    to={`/tables/${table.tableName}`}
                                    style={{
                                        backgroundColor: table.isCheckOpen ? "aquamarine" : "",
                                        color: table.isCheckOpen ? "white" : "",
                                    }}>
                                    <div className={tablesStyle['table-species']}>
                                        <span className={tablesStyle['table-id']}>{table.tableName}</span>{" "}
                                        <span className={tablesStyle["table-price"]}>{table.tablePrice > 0 ? `${table.tablePrice} ₺` : ""}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    {activeFilter == "open-checks" && (
                        <div className={tablesStyle["all-tables"]}>
                            {tables.map((table, index)=>(
                                table.tablePrice > 0 && (
                                    <Link className={tablesStyle['table-buttons']}
                                        key={index}
                                        to={`/tables/${table.tableName}`}
                                        style={{
                                            backgroundColor: table.isCheckOpen ? "aquamarine" : "",
                                            color: table.isCheckOpen ? "white" : "",
                                        }}>
                                        <div className={tablesStyle['table-species']}>
                                            <span className={tablesStyle['table-id']}>{table.tableName}</span>{" "}
                                            <span className={tablesStyle["table-price"]}>{table.tablePrice > 0 ? `${table.tablePrice} ₺` : ""}</span>
                                        </div>
                                    </Link>
                                )
                            ))}
                        </div>                        
                    )
                    
                    }
                </div>
            </div>
        )
    }
}

export default Tables
