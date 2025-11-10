import 'bootstrap-icons/font/bootstrap-icons.css';
import WaiterLoginStyles from './waiterLogin.module.css';
import Tables from '../tables/Tables';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { customerSettings  } from '../staticStyle/StaticFetch';
function WaiterLogin() {
	const [passWord, setPassWord] = useState('');
	const [index, setIndex] = useState(0);
	const [loginSuccess, setLoginSuccess] = useState(false);
	const [users, setUsers] = useState([])
	async function getStaticData() {
		const customer_settings = await customerSettings()
		console.log("customer_settings", customer_settings.table_layout[0])
		localStorage.setItem("Taxes", JSON.stringify(customer_settings.taxes))
		localStorage.setItem("Menu", JSON.stringify(customer_settings.product_categories))
		localStorage.setItem("PaymentMethods", JSON.stringify(customer_settings.payment_methods))
		localStorage.setItem("TableLayout", JSON.stringify(customer_settings.table_layout[0].tablelayout))
		localStorage.setItem("Products", JSON.stringify(customer_settings.products))
		localStorage.setItem("ServiceCharges", JSON.stringify(customer_settings.service_charges))
		localStorage.setItem("Discounts", JSON.stringify(customer_settings.discounts))
		localStorage.setItem("Users", JSON.stringify(customer_settings.users))
		localStorage.setItem("Condiments", JSON.stringify(customer_settings.condiments))
		setUsers(customer_settings.users)
	}

	useEffect(()=>{
		getStaticData()
	},[])
	useEffect(()=>{
		console.log("users, ", users)
	},[users])
	function appendPassword(event) {
		const number = event.target.innerHTML;
		if (passWord.length < 4) {
			const newPass = passWord + number;
			setPassWord(newPass);
			const boxId = "box" + index;
			const box = document.getElementById(boxId);
			if (box) box.style.backgroundColor = "green";
			setIndex(index + 1);
		}
	}
	function deletePassword() {
		if (passWord.length > 0) {
			const newPass = passWord.slice(0, -1); // son karakteri sil
			setPassWord(newPass);

			const newIndex = index - 1;
			const boxId = "box" + newIndex;
			const box = document.getElementById(boxId);
			if (box) box.style.backgroundColor = ""; // eski rengi temizle

			setIndex(newIndex);
		}
	}
	function login() {
		console.log(users)
		const existingIndex = users.findIndex(u=>u.pin == passWord)
		console.log(existingIndex)
		if (existingIndex != -1) {
			localStorage.setItem("ActiveUser", JSON.stringify(users[existingIndex]))
			setLoginSuccess(true)
		}
	}

	if (loginSuccess) {
		return <Navigate to="/main_menu" />;
	}

	return (
		<div className={WaiterLoginStyles["container"]}>
			<div>
				<div className={WaiterLoginStyles["restourantName"]}>
					<h1 className={WaiterLoginStyles["restopos"]}>Resto POS</h1>
					<h2 className={WaiterLoginStyles["restopos"]}>Point of Sale System</h2>
					<div className={WaiterLoginStyles["pin-container"]}>
						<div className={WaiterLoginStyles["in-boxes"]}>
							<div className={WaiterLoginStyles["pin-box"]} id="box0">{passWord[0]}</div>
							<div className={WaiterLoginStyles["pin-box"]} id="box1">{passWord[1]}</div>
							<div className={WaiterLoginStyles["pin-box"]} id="box2">{passWord[2]}</div>
							<div className={WaiterLoginStyles["pin-box"]} id="box3">{passWord[3]}</div>
						</div>
					</div>
				</div>

				<div className={WaiterLoginStyles["buttons"]}>
					<div className={WaiterLoginStyles["firstline"]}>
						{[1, 2, 3].map(n => <button key={n} onClick={appendPassword}>{n}</button>)}
					</div>
					<div className={WaiterLoginStyles["secondline"]}>
						{[4, 5, 6].map(n => <button key={n} onClick={appendPassword}>{n}</button>)}
					</div>
					<div className={WaiterLoginStyles["thirdline"]}>
						{[7, 8, 9].map(n => <button key={n} onClick={appendPassword}>{n}</button>)}
					</div>
					<div className={WaiterLoginStyles["forthline"]}>
						<button onClick={()=>deletePassword()} className={WaiterLoginStyles["actionButtons"]}>
							<i className={`bi bi-backspace ${WaiterLoginStyles["actionButtons"]}`}></i>
						</button>
						<button onClick={appendPassword}>0</button>
						<button onClick={login} className={WaiterLoginStyles["actionButtons"]}>
							<i className={`bi bi-check2-circle ${WaiterLoginStyles["actionButtons"]}`}></i>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default WaiterLogin;