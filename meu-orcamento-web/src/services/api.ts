import axios from "axios";

// Cria uma instância do Axios com o URL base do teu backend em Node.js
export const api = axios.create({
  baseURL: "https://silver-cod-69pg7xw4jwxphwwg-3000.app.github.dev/", // Certifica-te de que o teu backend corre nesta porta
});

// Intercetor para injetar o token JWT em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fintrack_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
