import LeftBar from "../staticStyle/LeftBar"
import staticStyles from "../staticStyle/StaticStyle.module.css"
import styles from "./TableSettings.module.css"
import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
function TableSettings() {
    const navigate = useNavigate()
    const [placedTables, setPlacedTables] = useState([])
    const [placeableTables, setPlaceableTables] = useState([])
    const [totalTables, setTotalTables] = useState([])
    const [isNewTable, setIsNewTable] = useState(false)
    const [row, setRow] = useState(5)
    const [col, setCol] = useState(5)
    const [matrix, setMatrix] = useState(25)
    const [layout, setLayout] = useState([])
    const [isFloor, setIsFloor] = useState(false)
    const [floors, setFloors] = useState([{
        Name: "İlk Kat",
        gridRow: 5,
        gridCol: 5,
        tables: [],
        tablePrice: 0,
    }])
    const [floorData, setFloorData] = useState(floors[0])

    const getTablesFromDB = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/table_grid")
            if (response.ok) {
                var data = await response.json()
                console.log("data is ", data)
                data = data.map((item) => item[0])
                console.log("data map", data)
            } else {
                console.log("error happened", response.statusText)
            }
        } catch (error) {
            console.log("an error acc", error)
        }
    }

    const sendStructureToDB = async () => {
        try {
            const response = await fetch("http://localhost:5000/table_grid_save", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(floors)
            })
            if (response.ok) {
                const data = await response.json()
                console.log("ok", data);
            } else {
                console.log("error ac", response.statusText)
            }
        } catch (error) {
            console.log("error happened", error)
        }
    }


    function saveNewTable() {
        const table_id = document.getElementById("new-table-input").value
        console.log(table_id)
        const index = totalTables.findIndex((item) => item === table_id)
        if (index !== -1) {
            document.getElementById("new-table-input").value = ""
            document.getElementById("new-table-input").placeholder =
                "MASA ZATEN OLUŞTURULMUŞ"

        } else {
            setTotalTables([...totalTables, table_id])
            setPlaceableTables([...placeableTables, table_id])
            console.log("PLACEABLE OLAN DEİŞTİ", placeableTables)
            document.getElementById("new-table-input").value = ""
            document.getElementById("new-table-input").placeholder = "Masa İsmi"
        }
    }

    function saveGridLayout() {
        setCol(document.getElementById("grid-col").value)
        setRow(document.getElementById("grid-row").value)
        const tablesToUngrid = []
        floorData.tables.forEach(el => {
            console.log(el)
            tablesToUngrid.push(el.tableName)
        }
        )
        floorData.tables = []
        setTotalTables([...totalTables, ...tablesToUngrid])
        console.log("bu floors", floors)
        console.log("bu da floors data", floorData)

    }
    useEffect(() => {
        setMatrix(row * col)
        const gridLay = document.getElementsByClassName(styles["grid-layout"])[0]
        gridLay.style.gridTemplateColumns = `repeat(${col},1fr)`
        gridLay.style.gridTemplateRows = `repeat(${row},1fr)`
        floorData.gridCol = col
        floorData.gridRow = row
    }, [row, col])



    useEffect(() => {
        getTablesFromDB()
    }, [])

    function changeGridLayout() {
        setLayout()
        const tablesArray = Array.isArray(floorData?.tables)
            ? floorData.tables
            : Object.values(floorData?.tables || {});

        const buttons = [];

        for (let i = 1; i <= col; i++) {
            for (let j = 1; j <= row; j++) {
                const table = tablesArray.find(table =>
                    table.tableGridCol === i &&
                    table.tableGridRow === j
                );
                const item = (
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={styles["grid-items"]}
                        style={{ gridColumnStart: i, gridRowStart: j }}
                    >
                        <div className={styles["buttons-container"]}>
                            <div className={styles["plus-button"]}>
                                <button style={{ backgroundColor: table ? "#4361ee" : "" }}>
                                    {table ? table.tableName : "+"}
                                </button>
                            </div>
                            <div
                                className={styles["trash-button"]}
                                style={{ display: table ? "flex" : "none" }}
                            >
                                <button onClick={(e) => deleteTable(e, table)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                );

                buttons.push(item);
            }
        }

        const elements = document.querySelectorAll(`.${styles["tables-to-drag-container"]} button`);
        elements.forEach((el) => {
            el.style.display = "flex";
        });

        setLayout(buttons);
    }


    function setTablePosition(e) {
        const tableId = e.dataTransfer.getData("tableID");
        const gridItem = e.target.closest(`.${styles["grid-items"]}`);
        const gridCol = parseInt(gridItem.style.gridColumnStart);
        const gridRow = parseInt(gridItem.style.gridRowStart);

        if (gridItem) {
            setFloors(prevFloors => {
                const updatedFloors = prevFloors.map(floor => {
                    if (floor.Name === floorData.Name) {
                        console.log("floor data", floorData)
                        const exists = floorData.tables.some(t => t.tableName === tableId);
                        if (exists) return floor;

                        const newTable = {
                            tableName: tableId,
                            tableGridCol: gridCol,
                            tableGridRow: gridRow
                        };
                        return {
                            ...floor,
                            tables: [...floor.tables, newTable]
                        };
                    }
                    return floor;
                });

                const updatedFloorData = updatedFloors.find(f => f.Name === floorData.Name);
                setFloorData(updatedFloorData);

                return updatedFloors;
            });

            setPlaceableTables(prevTables => {
                const indexToRemove = prevTables.findIndex(tables => tables === tableId);
                return prevTables.filter((_, index) => index !== indexToRemove);
            });
        }
    }


    function deleteTable(e) {
        const trashButton = e.target.closest(`.${styles["trash-button"]}`);
        let plusButton = trashButton.parentElement;
        plusButton = plusButton.querySelector("button");
        const tableName = plusButton.innerHTML;
        const floorName = floorData.Name;
        const updatedFloors = floors.map(floor => {
            if (floor.Name === floorName) {
                const newTables = floor.tables.filter(table => table.tableName !== tableName);
                return { ...floor, tables: newTables };
            }
            return floor;
        });

        setFloors(updatedFloors);
        setPlaceableTables([...placeableTables, tableName])
        const updatedFloorData = updatedFloors.find(f => f.Name === floorData.Name);
        setFloorData(updatedFloorData);
        changeGridLayout()
    }

    useEffect(() => {
        const current = floors.find(f => f.Name === floorData.Name);
        if (current) {
            setFloorData(current);
        }
        changeGridLayout()
    }, [floors]);

    function handleDragStart(e) {
        e.dataTransfer.setData("tableID", e.target.textContent)

    }
    function handleDragOver(e) {
        e.preventDefault()
    }
    function handleDrop(e) {
        e.preventDefault()
        setTablePosition(e)
    }

    useEffect(() => {
        changeGridLayout()
    }, [matrix])

    useEffect(() => {
        console.log(floorData)
        document.getElementById("choosed-floor").textContent = floorData.Name

        const gridRow = floorData.gridRow
        setRow(gridRow)
        const gridCol = floorData.gridCol
        setCol(gridCol)
    }, [floorData])

    function changeFloor() {
        console.log(floorData)
        const options = document.querySelector(`.${styles["choose-create-floor"]}`)
        console.log("options", options)
        if (isFloor === false) {
            setIsFloor(true)
            options.style.display = "block"
        } else {
            setIsFloor(false)
            options.style.display = "none"
        }
    }

    function saveFloor(e) {
        const newFloorInput = document.getElementById("new-floor")
        const newFloorName = (newFloorInput.value)
        if (newFloorName.length > 0) {
            const floorIndex = floors.findIndex(floor => floor.Name === newFloorName)
            console.log("floor index", floorIndex)
            if (floorIndex !== -1) {
                newFloorInput.value = ""
                newFloorInput.placeholder = "Bu isimde bir kat zaten mevcut."
            } else {
                const newFloor = { Name: newFloorName, gridRow: 3, gridCol: 3, tables: [] }
                setFloors([...floors, newFloor])
                newFloorInput.value = ""
                newFloorInput.placeholder = "Yeni Kat Adı Giriniz"
            }
        }
        console.log(floors)
    }

    function deleteFloor(e) {
        const deleteFloor = (e.target)
        console.log(deleteFloor.parentElement.parentElement.parentElement)
    }

    function choosedFloor(e) {
        const floorName = (e.target.textContent)
        floors.forEach((floor, index) => {
            if (floor.Name === floorName) {
                setFloorData(floor)
                changeGridLayout()
            }
        })
    }


    function saveTableGridLayout() {
        const newTables = []
        const layout = document.querySelectorAll(`.${styles["plus-button"]}`)
        const floorName = document.querySelectorAll(`.${styles["floor-options"]} button`)[0].textContent

        layout.forEach((item, index) => {
            const buttonName = item.textContent
            if (buttonName !== "+") {
                const layoutProperties = (item.parentElement.parentElement.style)
                const row = layoutProperties.gridRowStart
                const col = layoutProperties.gridColumnStart
                const table = {
                    tableName: buttonName,
                    tableGridRow: parseInt(row),
                    tableGridCol: parseInt(col)
                }
                newTables.push(table)
            }
        })

        setFloors(prevFloors => {
            const updatedFloors = prevFloors.map(floor =>
                floor.Name === floorName
                    ? { ...floor, tables: newTables }
                    : floor
            );

            const updatedFloorData = updatedFloors.find(f => f.Name === floorName);
            setFloorData(updatedFloorData);

            return updatedFloors;
        });
        sendStructureToDB()
    }

    useEffect(() => {
        if (floorData) {
            changeGridLayout();
        }
    }, [floorData?.tables, matrix]);

    return (
        <>
            <div className={styles["page-container"]}>
                <div className={staticStyles.containers}>

                    <div style={{ width: "100%" }} className={staticStyles["middle-bar"]}>
                        <div
                            className={`${styles["new-table-input-box"]} ${isNewTable ? styles["shown"] : ""}`}
                        >
                            <div>
                                <h1>Yeni Masa Ekle</h1>
                                <h2>Masa Adı:</h2>
                                <div className={styles["new-table-input"]}>
                                    <input
                                        id="new-table-input"
                                        type="text"
                                        placeholder="Masa İsmi"
                                    />
                                    <div className={styles["action-buttons"]}>
                                        <div className={styles["save-new-button"]}>
                                            <button onClick={saveNewTable}>Kaydet</button>
                                        </div>

                                        <div className={styles["cancel-new-button"]}>
                                            <button onClick={() => setIsNewTable(false)}>
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles["table-options"]}>
                            <div className={styles["tables-to-drag-container"]}>
                                <button
                                    onClick={() => setIsNewTable(true)}
                                    className={styles["new-table"]}
                                >
                                    +
                                </button>

                                {placeableTables.map((table, index) => (
                                    <button
                                        draggable="true"
                                        onDragStart={handleDragStart}
                                        className={styles["tables-to-drag-buttons"]}
                                    >
                                        {table}
                                    </button>
                                ))}
                            </div>
                            <div className={styles["table-grid-options-container"]}>
                                <div className={styles["grid-layout-floor-options"]}>
                                    <div className={styles["grid-options"]}>
                                        <span>Grid:</span>
                                        <input
                                            id="grid-col"
                                            className={styles["grid-col"]}
                                            type="text"
                                            placeholder="5"
                                        />
                                        <span>x</span>
                                        <input
                                            id="grid-row"
                                            className={styles["grid-row"]}
                                            type="text"
                                            placeholder="5"
                                        />
                                        <div className={styles["grid-save"]}>
                                            <button onClick={saveGridLayout}>
                                                Grid Düzenini Kaydet
                                            </button>
                                        </div>
                                        <div className={styles["info"]}>
                                            <h1>
                                                Sol tarafta bulunan menüden sürükle bırak yaparak masa
                                                düzeninizi oluşturabilirsiniz.
                                            </h1>
                                        </div>
                                    </div>
                                    <div className={styles["floor-options"]}>
                                        <div>
                                            <button id="choosed-floor" onClick={changeFloor}>{floors[0].Name}</button>
                                        </div>
                                        <div className={styles["choose-create-floor"]}>
                                            <div className={styles["floor-choose-input"]}>
                                                <h1>Kat Düzeni Seçiniz.</h1>
                                                <div className={styles["floors-container"]}>
                                                    {floors.map((floor, index) =>
                                                        <div>
                                                            <div className={styles["floors"]}>
                                                                <div className={styles["floor-name"]}>
                                                                    <button id="choose-floor" onClick={choosedFloor} >{floor.Name}</button>
                                                                </div>
                                                                <div className={styles["delete-floor"]}>
                                                                    <button onClick={deleteFloor}>
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>


                                                <div className={styles["input-box"]} >
                                                    <h2 className={styles["new-floor-paragraph"]}>Yeni Kat Oluştur:</h2>
                                                    <input placeholder="Yeni Kat Adı Giriniz" type="text" name="" id="new-floor" />
                                                    <div className={styles["action-buttons"]}>
                                                        <div onClick={(e) => saveFloor(e)} className={styles["floor-save-button"]}>
                                                            <button>Kaydet</button>
                                                        </div>
                                                        <div className={styles["floor-cancel-button"]}>
                                                            <button>İptal</button>
                                                        </div>
                                                    </div>


                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                    <div className={styles["save-button"]}>
                                        <button onClick={saveTableGridLayout}>Kaydet</button>
                                    </div>

                                </div>
                                <div id="grid-layout" className={styles["grid-layout"]}>{layout}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}
export default TableSettings
