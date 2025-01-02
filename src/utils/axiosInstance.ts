import axios from "axios";

axios.defaults.baseURL = import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_PORT}/api` : ``
export default axios