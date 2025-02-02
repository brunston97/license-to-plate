import axios from 'axios'

console.log(import.meta.env)
axios.defaults.baseURL = import.meta.env.DEV
  ? `http://localhost:${import.meta.env.VITE_PORT}/api`
  : `https://server-186646240494.us-central1.run.app/api`
export default axios
