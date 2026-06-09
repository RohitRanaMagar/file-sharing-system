import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {},
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('easyshare_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('easyshare_token')
      localStorage.removeItem('easyshare_user')
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

export default client
