import { Link } from 'react-router-dom';
import staticStyles from './StaticStyle.module.css'
import resto from '../../assets/resto.png'
import "bootstrap-icons/font/bootstrap-icons.css";

function LeftBar() {
    return (<>
        <div className={staticStyles['left-bar-items']}>
            <Link to="/" className={staticStyles['buttons']}>
                <img src={resto} alt="resto logo" />
            </Link>
            <Link to="/tables" className={staticStyles['buttons']}>
                <i className={`bi bi-house-door ${staticStyles['buttons']}`} ></i>
            </Link>
            <Link to="/orders" className={staticStyles['buttons']}>
                <i className={`bi bi-bank ${staticStyles['buttons']}`}></i>
            </Link>
            <Link to="/delivery" className={staticStyles['buttons']}>
                <i className={`bi bi-bicycle ${staticStyles['buttons']}`}></i>
            </Link>
            <Link to="/inventory" className={staticStyles['buttons']}>
                <i className={`bi bi-box ${staticStyles['buttons']}`}></i>
            </Link>
            <Link to="/settings" className={staticStyles['buttons']}>
                <i className={`bi bi-gear ${staticStyles['buttons']}`}></i>
            </Link>
            <Link to="/" className={`${staticStyles['buttons']} ${staticStyles['quit-icon']}`}>
                <i className={`bi bi-box-arrow-in-left ${staticStyles['buttons']}`}></i>
            </Link>
        </div>
    </>
    )
} export default LeftBar
