import "bootstrap-icons/font/bootstrap-icons.css"
import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { Link } from 'react-router-dom';
import Order from '../order/Order'
import Settings from "../settings/Settings"
import staticStyles from '../staticStyle/StaticStyle.module.css'
import tablesStyle from './Tables.module.css'
import Clock from "../staticStyle/Clock"
import LeftBar from "../staticStyle/LeftBar"
function Tables() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const [tables, setTables] = useState([])
    const [chosenTable, setChosenTable] = useState("")
    const [isSettings, setIsSettings] = useState(false)
    const [isFloors, setIsFloors] = useState(false)
    const [floors, setFloors] = useState([])
    const [chosenFloor, setChosenFloor] = useState([])
    const [row, setRow] = useState()
    const [col, setCol] = useState()
    const [tablePricing, setTablePricing] = useState([])

    const getTables = async () => {
        try {
            const tableGridData = await fetch("http://127.0.0.1:5000/table_grid")
            const tablePriceData = await fetch("http://127.0.0.1:5000/get_orders")
            if (tableGridData.ok) {
                const gridData = await tableGridData.json()
                const priceData = await tablePriceData.json()
                console.log("asdfasdf", gridData)
                setTablePricing(priceData)
                setFloors(gridData)
                setChosenFloor(gridData[0])
                setRow(gridData[0][1])
                setCol(gridData[0][2])
                const table = []
                gridData.forEach((data, _) => {
                    const floorTables = data[3]
                    floorTables.forEach((item, _) => {
                        const existingIndex = priceData.findIndex(pData => pData[1] === item.tableName)
                        if (existingIndex !== -1) {
                            const object = {
                                floorName: data[0],
                                tableName: item.tableName,
                                tableGridCol: item.tableGridCol,
                                tableGridRow: item.tableGridRow,
                                tablePrice: priceData[existingIndex][3],
                                isCheckOpen: true
                            }
                            table.push(object)
                        } else {
                            const object = {
                                floorName: data[0],
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

            } else {
                console.log("error happened", tableGridData.statusText)
            }
        } catch (error) {
            console.log(error)
        }
    }

    function changeFloor(e) {
        const floorName = e.target.textContent
        const index = (floors.findIndex(floor => floor[0] === floorName))
        setRow(floors[index][1])
        setCol(floors[index][2])
        setChosenFloor(floors[index])
        setTables(floors[index][3])
        const table = []
        floors[index][3].forEach((data, _) => {
                const existingIndex = tablePricing.findIndex(pData => pData[1] === data.tableName)
                if (existingIndex !== -1) {
                    const object = {
                        floorName: floorName,
                        tableName: data.tableName,
                        tableGridCol: data.tableGridCol,
                        tableGridRow: data.tableGridRow,
                        tablePrice: tablePricing[existingIndex][3],
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
        console.log("tables",table)
        setTables(table)
        setIsFloors(false)
    }

    useEffect(() => {
        getTables()
    }, [])
    useEffect(() => {
        getTables();
    }, [location]);

    useEffect(() => {
        const style = document.getElementsByClassName(tablesStyle["tables"])[0]
        style.style.gridTemplateColumns = `repeat(${col},1fr)`
        style.style.gridTemplateRows = `repeat(${row},1fr)`
    }, [col, row])


    useEffect(() => {
        const chosenFloorTables = []
        tables.forEach((table, _) => {
            if (table.floorName === chosenFloor[0]) {
                chosenFloorTables.push(table)
            }
        })
        console.log("", chosenFloorTables)
        setTables(chosenFloorTables)
    }, [chosenFloor])

    useEffect(() => {
        const options = document.querySelector(`.${tablesStyle["floor-choose"]}`)

        console.log("asd", options)
        if (isFloors) {
            options.style.display = "block"
        } else {
            options.style.display = "none"
        }
    }, [isFloors])


    if (isSettings) {
        return <Settings />
    } else if (chosenTable) {
        return <Order table_id={chosenTable}></Order>
    } else {
        return (
            <div className={staticStyles.containers}>
                <div style={{ width: "100%" }} className={staticStyles['middle-bar']}>
                    <div className={staticStyles['middle-bar-top-bar']}>
                        <div className={staticStyles["go-back-button"]}>
                            <button onClick={() => navigate(-1)}>
                                <i className="bi bi-arrow-return-left"></i>
                            </button>
                            <div className={staticStyles["datetime"]}>
                                <Clock></Clock>
                            </div>
                        </div>
                        <div className={tablesStyle["floors"]}>
                            <button onClick={() => setIsFloors(!isFloors)}>{chosenFloor[0]}</button>
                            <div className={tablesStyle["floor-choose"]}>
                                {floors.map((floor, _) => {
                                    if (floor[0] !== chosenFloor[0]) {
                                        return <div className={tablesStyle["floor-to-choose"]}><button onClick={(e) => (changeFloor(e))}>{floor[0]}</button> </div>;
                                    }
                                    return null;
                                })}

                            </div>
                        </div>


                    </div>
                    <div className={tablesStyle['tables-items']}>
                        <div className={tablesStyle["tables"]}>
                            {tables.map((table, index) => (
                                <Link className={tablesStyle['table-buttons']}
                                    key={index}
                                    to={`/tables/${table.tableName}`}
                                    style={{
                                        backgroundColor: table.isCheckOpen ? "aquamarine" : "",
                                        gridColumnStart: table.tableGridCol,
                                        gridRowStart: table.tableGridRow
                                    }}>
                                    <div className={tablesStyle['table-species']}>
                                        <span className={tablesStyle['table-id']}>{table.tableName}</span>{" "}
                                        <span className={tablesStyle["table-price"]}>{table.tablePrice > 0 ? table.tablePrice : ""} </span>
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
