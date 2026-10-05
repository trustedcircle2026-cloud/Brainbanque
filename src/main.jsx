import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import './erp.css'

const ERPApp = lazy(() => import('./ERP'))
const root = document.getElementById('root')

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'32px',fontFamily:'Arial,sans-serif',background:'#f7f7f3',color:'#18211f'}}>
          <div style={{maxWidth:'620px',textAlign:'center'}}>
            <div style={{fontSize:'13px',fontWeight:700,letterSpacing:'.12em',marginBottom:'16px',color:'#173b35'}}>BRAINBANQUE</div>
            <h1 style={{fontSize:'34px',margin:'0 0 12px'}}>We’re updating the website.</h1>
            <p style={{color:'#68716e',lineHeight:1.7,margin:'0 0 18px'}}>The application encountered a temporary loading issue. Please refresh the page.</p>
            <button onClick={() => window.location.reload()} style={{border:0,borderRadius:'6px',padding:'12px 18px',background:'#173b35',color:'#fff',fontWeight:700,cursor:'pointer'}}>Refresh</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function Root() {
  const isERP = window.location.hash.startsWith('#/erp')

  return isERP ? (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'grid',placeItems:'center',fontFamily:'Arial,sans-serif',color:'#173b35'}}>Loading workspace…</div>}>
      <ERPApp />
    </Suspense>
  ) : <App />
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Root />
    </AppErrorBoundary>
  </React.StrictMode>
)
