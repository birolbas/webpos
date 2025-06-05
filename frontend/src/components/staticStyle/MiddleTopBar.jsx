import staticStyles from './StaticStyle.module.css'
import Clock from './Clock'
function MiddleTopBar() {
  return (
    <>
        <div className={staticStyles["middle-bar-top-bar"]}>
          <div>goback</div>
          <div className={staticStyles["datetime"]}>
            <Clock></Clock>
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
    </>
  )
}
export default MiddleTopBar
