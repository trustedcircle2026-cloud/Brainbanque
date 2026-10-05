const API_URL = import.meta.env.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbxBA2rbWC79Ze9KIQekouEh1X7oCSsvya7XMOKSV7Ixmt4K38B6HYgp8EMSUxBl2Pp33w/exec'
async function call(action, body = null, token = '') {
  if (!API_URL) throw new Error('VITE_API_URL is not configured.')
  const url = new URL(API_URL); url.searchParams.set('action', action)
  if (token && !body) url.searchParams.set('token', token)
  const r = await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'text/plain;charset=utf-8'}:undefined,body:body?JSON.stringify({...body,token}):undefined})
  const data=await r.json(); if(!data.success) throw new Error(data.error||'Request failed'); return data.data
}
export const erpApi={
 login:(email,password)=>call('login',{email,password}),
 logout:(token)=>call('logout',{token}),
 me:(token)=>call('me',null,token),
 list:(entity,token,filters)=>{ const qs = new URLSearchParams({action:'list',entity,token}); return fetch(API_URL+'?'+qs).then(r=>r.json()).then(x=>{if(!x.success)throw new Error(x.error||'Request failed');return filters?x.data.filter(r=>Object.entries(filters).every(([k,v])=>String(r[k]||'').toLowerCase()===String(v).toLowerCase())):x.data}) },
 create:(entity,data,token)=>call('create',{entity,data},token),
 update:(entity,id,data,token)=>call('update',{entity,id,data},token),
 delete:(entity,id,token)=>call('delete',{entity,id},token)
}