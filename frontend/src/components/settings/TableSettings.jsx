import LeftBar from "../staticStyle/LeftBar"
import staticStyles from '../staticStyle/StaticStyle.module.css'
import MiddleTopBar from "../staticStyle/MiddleTopBar"
import styles from "./TableSettings.module.css"
function TableSettings(){
    return(
        <>
            <div className={staticStyles.containers}>
                <LeftBar></LeftBar>
                <div style={{ width: "100%" }} className={staticStyles["middle-bar"]}>
                    <MiddleTopBar></MiddleTopBar>
                    <div className={styles["table-options"]}>
                        <div className={styles["tables-to-drag-container"]}>
                            <button className={styles["tables-to-drag-buttons"]}>
                                asd
                            </button>
                            <button className={styles["tables-to-drag-buttons"]}>
                                asd
                            </button>
                            <button className={styles["tables-to-drag-buttons"]}>
                                asd
                            </button>
                            <button className={styles["tables-to-drag-buttons"]}>
                                asd
                            </button>                                                        
                        </div>
                    </div>
                </div>
            </div>


                    
            

        </>

    )




}export default TableSettings