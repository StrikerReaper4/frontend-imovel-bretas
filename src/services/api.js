import axios from "axios";

const api = axios.create({
  baseURL: "https://api.bretasimoveis.cloud",
});

export default api;
