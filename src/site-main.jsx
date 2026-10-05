import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import Site from './Site'
import './site.css'
import './erp.css'
const ERPApp = lazy(() => import('./ERP'))
const root=document.getElementById('root')
function Root(){
  const isERP=window.location.hash.startsWith('#/erp')
  const page=document.body.dataset.page||'home'
  return isERP?<Suspense fallback={<div style={{minHeight:'100vh',display:'grid',placeItems:'center'}}>Loading workspace…</div>}><ERPApp/></Suspense>:<Site page={page}/>
}
ReactDOM.createRoot(root).render(<Root/>)
