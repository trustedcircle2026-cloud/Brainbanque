const API_URL = import.meta.env.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbxBA2rbWC79Ze9KIQekouEh1X7oCSsvya7XMOKSV7Ixmt4K38B6HYgp8EMSUxBl2Pp33w/exec'

async function request(action, options = {}) {
  if (!API_URL) {
    throw new Error('Backend API URL is not configured.')
  }

  const url = new URL(API_URL)
  url.searchParams.set('action', action)

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'text/plain;charset=utf-8' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const data = await response.json()
  if (!data.success) throw new Error(data.error || 'Request failed')
  return data.data
}

export const api = {
  health: () => request('health'),
  services: () => request('services'),
  bootstrap: () => request('bootstrap'),
  submitEnquiry: (data) => request('', { method: 'POST', body: { action: 'submitEnquiry', data } })
}