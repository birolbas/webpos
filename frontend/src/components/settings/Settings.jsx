import resto from '../../assets/resto.png'
import "bootstrap-icons/font/bootstrap-icons.css"
import staticStyles from '../staticStyle/StaticStyle.module.css'
import settingsStyles from './Settings.module.css'
import LeftBar from '../staticStyle/LeftBar'
import Clock from '../staticStyle/Clock'
import { Link } from 'react-router-dom'
function Settings() {
    return (
    <div className={staticStyles["containers"]}>
        <LeftBar/>

        <div style={{ width: "100%" }} className={staticStyles["middle-bar"]}>
            <div className={staticStyles["middle-bar-top-bar"]}>
                <div className={staticStyles["datetime"]}>
                    <Clock/>
                </div>
                <div className={staticStyles["search-bar"]}>
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
            <div className={settingsStyles["settings"]} >
                <Link to="/settings/table_settings" className={settingsStyles["setting"]}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5 1v8H1V1zM1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm13 2v5H9V2zM9 1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM5 13v2H3v-2zm-2-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1zm12-1v2H9v-2zm-6-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z" />
                    </svg>
                    <div className={settingsStyles["setting-explanation"]}>
                        <h1>MASA AYARLARI</h1>
                        <h2>Masa ekle, masa sil, masaların yerleşimini ayarla</h2>
                    </div>
                </Link>

            </div>
        </div>
    </div>)
}
export default Settings