import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const http = axios.create({ baseURL: API });

http.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("vg_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
