import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './waiterLogin.module.css';
import Tables from '../tables/Tables';
import { useEffect, useState } from 'react';

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
    return <Tables />;
  }

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.restourantName}>
          <h1 className={styles.restopos}>Resto POS</h1>
          <h2 className={styles.restopos}>Point of Sale System</h2>
          <div className={styles["pin-container"]}>
            <div className={styles["in-boxes"]}>
              <div className={styles["pin-box"]} id="box0">{passWord[0]}</div>
              <div className={styles["pin-box"]} id="box1">{passWord[1]}</div>
              <div className={styles["pin-box"]} id="box2">{passWord[2]}</div>
              <div className={styles["pin-box"]} id="box3">{passWord[3]}</div>
            </div>
          </div>
        </div>

        <div className={styles.buttons}>
          <div className={styles.firstline}>
            {[1, 2, 3].map(n => <button key={n} onClick={appendPassword}>{n}</button>)}
          </div>
          <div className={styles.secondline}>
            {[4, 5, 6].map(n => <button key={n} onClick={appendPassword}>{n}</button>)}
          </div>
          <div className={styles.thirdline}>
            {[7, 8, 9].map(n => <button key={n} onClick={appendPassword}>{n}</button>)}
          </div>
          <div className={styles.forthline}>
            <button className={styles.actionButtons}>
              <i className="bi bi-backspace-fill"></i>
            </button>
            <button onClick={appendPassword}>0</button>
            <button onClick={login} className={styles.actionButtons}>
              <i className="bi bi-check2-circle"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaiterLogin;
