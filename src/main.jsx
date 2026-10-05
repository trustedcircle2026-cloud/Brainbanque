import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ERPApp from './ERP'
import './styles.css'
import './erp.css'

const isERP = window.location.hash.startsWith('#/erp')
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isERP ? <ERPApp/> : <App/>}</React.StrictMode>
)
