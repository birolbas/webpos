import 'bootstrap-icons/font/bootstrap-icons.css';
import WaiterLoginStyles from './waiterLogin.module.css';
import Tables from '../tables/Tables';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
function WaiterLogin() {
  const [passWord, setPassWord] = useState('');
  const [index, setIndex] = useState(0);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    console.log("şifre değişti", passWord);
  }, [passWord]);

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

  function login() {
    if (passWord === "1234") {
      console.log("DOĞRU");
      setLoginSuccess(true);
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
            <button className={WaiterLoginStyles["actionButtons"]}>
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
