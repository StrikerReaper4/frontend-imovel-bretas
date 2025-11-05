import axios from 'axios';

const api = axios.create({
  baseURL: "https://api-go-imovel.onrender.com",
  headers: {
    'Content-Type': 'application/json',
  },
});



export default api;
