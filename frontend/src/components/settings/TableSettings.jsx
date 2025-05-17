import LeftBar from "../staticStyle/LeftBar"
import staticStyles from "../staticStyle/StaticStyle.module.css"
import MiddleTopBar from "../staticStyle/MiddleTopBar"
import styles from "./TableSettings.module.css"
import { useEffect, useState } from "react"
function TableSettings() {
    const [tables, setTables] = useState([])

    function newTable() {
        console.log("BASTIK ")
    }

    const getTablesFromDB = async () => {
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
            console.log("an error acc", error)
        }
    }

    useEffect(() => {
        getTablesFromDB()
    }, [])

    return (
        <> 
        <div className={styles["new-table-input-box"]}>
        <div>
            <h1>Yeni Masa Ekle</h1>
            <h2>Masa Adı:</h2>
            <div className={styles["new-table-input"]}>
                <input  type="text" placeholder="Masa İsmi" />
            </div>
        </div>
        </div>
            <div className={staticStyles.containers}>
                <LeftBar></LeftBar>
                <div style={{ width: "100%" }} className={staticStyles["middle-bar"]}>
                    <MiddleTopBar></MiddleTopBar>
                    <div className={styles["table-options"]}>

                        <div className={styles["tables-to-drag-container"]}>
                            <button onClick={newTable} className={styles["new-table"]}>
                                +
                            </button>

                            {tables.map((table, index) => (
                                <button className={styles["tables-to-drag-buttons"]}>
                                    {table[0]}
                                </button>
                            ))}
                        </div>
                        <div className={styles["table-grid-options-container"]}>
                            <div className={styles["grid-layout-floor-options"]}>
                                <div className={styles["grid-options"]}>
                                    <span>Grid:</span>
                                    <input
                                        className={styles["grid-row"]}
                                        type="text"
                                        placeholder="5"
                                    />
                                    <span>x</span>
                                    <input
                                        className={styles["grid-col"]}
                                        type="text"
                                        placeholder="5"
                                    />
                                </div>
                                <div className={styles["floor-options"]}>
                                    <button>Kat</button>
                                </div>
                                <div className={styles["save-button"]}>
                                    <button>Kaydet</button>
                                </div>
                            </div>
                            <div className={styles["grid-layout"]}>
                                <div className={styles["grid-items"]}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default TableSettings
