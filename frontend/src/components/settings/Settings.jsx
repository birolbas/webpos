import resto from '../../assets/resto.png'
import "bootstrap-icons/font/bootstrap-icons.css"

function Settings(){
    return (   <div className="containers">
            <div className="left-bar-items">
              <button className="buttons">
                <img src={resto} alt="resto logo" />
              </button>
              <button className="buttons">
                <i className="bi bi-house-door"></i>
              </button>
              <button className="buttons">
                <i className="bi bi-bank"></i>
              </button>
              <button className="buttons">
                <i className="bi bi-bicycle"></i>
              </button>
              <button className="buttons">
                <i className="bi bi-box"></i>
              </button>
              <button  className="buttons">
                <i className="bi bi-gear"></i>
              </button>
              <button className="buttons quit-icon">
                <i className="bi bi-box-arrow-in-left"></i>
              </button>
            </div>
    
            <div style={{ width: "100%" }} className="middle-bar">
              <div className="middle-bar-top-bar">
                <div className="datetime">
                  <p>, </p>
                  <p></p>
                </div>
                <div className="search-bar">
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
              <div className="settings" >
                    <button className="setting">
                        <svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor"  viewBox="0 0 16 16">
                            <path d="M5 1v8H1V1zM1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm13 2v5H9V2zM9 1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM5 13v2H3v-2zm-2-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1zm12-1v2H9v-2zm-6-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z"/>
                        </svg>
                        <div className="setting-explanation"> 
                          <h1>MASA AYARLARI</h1>
                          <h2>Masa ekle, masa sil, masaların yerleşimini ayarla</h2>
                          </div>
                    </button>

              </div>
            </div>
          </div>)
}
export default Settings