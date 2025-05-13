import "bootstrap-icons/font/bootstrap-icons.css"
import resto from "../../assets/resto.png"
import { useState, useEffect } from "react"
import Order from '../order/Order'
import Settings from "../settings/Settings"
import styles from './Tables.module.css'

function Tables() {
  const [tables, setTables] = useState([])
  const [chosenTable, setChosenTable] = useState("")
  const [tableOrders, setTableOrders] = useState([])
  const [isSettings, setIsSettings] = useState(false)

  function chosedTable(event) {
    const table_id = event.target.firstChild.textContent
    setChosenTable(table_id)
  }

  function settings() {
    setIsSettings(true)
  }

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
      <div className={styles.containers}>
        <div className={styles['left-bar-items']}>
          <button className={styles.buttons}>
            <img src={resto} alt="resto logo" />
          </button>
          <button className={styles.buttons}>
            <i className="bi bi-house-door"></i>
          </button>
          <button className={styles.buttons}>
            <i className="bi bi-bank"></i>
          </button>
          <button className={styles.buttons}>
            <i className="bi bi-bicycle"></i>
          </button>
          <button className={styles.buttons}>
            <i className="bi bi-box"></i>
          </button>
          <button onClick={settings} className={styles.buttons}>
            <i className="bi bi-gear"></i>
          </button>
          <button className={`${styles.buttons} ${styles['quit-icon']}`}>
            <i className="bi bi-box-arrow-in-left"></i>
          </button>
        </div>

        <div style={{ width: "100%" }} className={styles['middle-bar']}>
          <div className={styles['middle-bar-top-bar']}>
            <div className={styles.datetime}>
              <p>, </p>
              <p></p>
            </div>
            <div className={styles['search-bar']}>
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
          <div className={styles['tables-items']}>
            <div className={styles.tables}>
              {tables.map((table, index) => (
                <button
                  key={index}
                  onClick={chosedTable}
                  style={{ backgroundColor: table[1] > 0 ? "aquamarine" : "" }}
                >
                  <span className={styles['table-id']}>{table[0]}</span>{" "}
                  <span className={styles['table-price']}>{table[1]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Tables
