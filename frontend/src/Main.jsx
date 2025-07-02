import ReactDOM from 'react-dom/client'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Tables from './components/tables/Tables.jsx'
import WaiterLogin from './components/waiterLogin/WaiterLogin.jsx'
import Order from './components/order/Order.jsx'
import Settings from './components/settings/Settings.jsx'
import TableSettings from './components/settings/TableSettings.jsx'
import MenuSettings from './components/settings/MenuSettings.jsx'
import MainMenu from './components/mainMenu/MainMenu.jsx'
import Payment from './components/order/Payment.jsx'
import Income from './components/income/Income.jsx'
const router = createBrowserRouter([
    {
        path: '/',
        element: <WaiterLogin />
    },
    {
        path:'/main_menu',
        element:<MainMenu/>
    },
    {
        path: '/tables',
        element:<Tables/>
    },
    {
        path:'/tables/:table_id',
        element:<Order/>
    },
    {
        path:'/settings',
        element:<Settings/>
    },
    {
        path:'/settings/table_settings',
        element:<TableSettings/>
    },
    {
        path:'/settings/menu_settings',
        element:<MenuSettings/>
    },
    {
        path:'/payment/:table_id',
        element:<Payment/>
    },
    {
        path:'/income',
        element:<Income/>
    }


])

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)

