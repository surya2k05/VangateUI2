import axios from "axios";
import * as mock from "../mock/mockData";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export const http = axios.create({ baseURL: API });

http.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("vg_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const cfg = err.config;
    if (!err.response || err.response.status === 404 || !BACKEND_URL) {
      console.warn("Backend offline or not configured. Falling back to local mock data for:", cfg.url);
      const url = cfg.url || "";
      
      if (url.includes("/auth/login")) {
        try {
          const body = JSON.parse(cfg.data);
          const found = mock.USERS_SEED.find(
            (u) => u.username === body.username && u.password === body.password
          );
          if (found) {
            return {
              data: {
                access_token: "mock-token-xyz-123",
                token_type: "bearer",
                user: { username: found.username, role: found.role, full_name: found.full_name }
              }
            };
          }
        } catch (e) {}
        return Promise.reject({ response: { status: 401, data: { detail: "Invalid username or password" } } });
      }
      
      if (url.includes("/auth/me")) {
        const cached = localStorage.getItem("vg_user");
        if (cached) {
          return { data: JSON.parse(cached) };
        }
        return Promise.reject({ response: { status: 401, data: { detail: "Not authenticated" } } });
      }
      
      if (url.includes("/plants")) {
        return { data: mock.PLANTS };
      }
      
      if (url.includes("/overview")) {
        let plant = "VJNRJSW";
        if (url.includes("?")) {
          const parts = url.split("?")[1].split("&");
          const plantPart = parts.find(p => p.startsWith("plant="));
          if (plantPart) plant = plantPart.split("=")[1];
        }
        const motors = mock.MOTORS_SEED.filter((m) => m.plant === plant);
        const counts = { healthy: 0, warning: 0, critical: 0 };
        motors.forEach((m) => { counts[m.status] = (counts[m.status] || 0) + 1; });
        return {
          data: {
            total: motors.length,
            healthy: counts.healthy,
            warning: counts.warning,
            critical: counts.critical
          }
        };
      }
      
      if (url.includes("/logs")) {
        return { data: mock.SAMPLE_LOGS };
      }
      
      if (url.includes("/hierarchy")) {
        const tree = {};
        mock.MOTORS_SEED.forEach((m) => {
          const p = tree[m.plant] || (tree[m.plant] = { id: m.plant, name: m.plant, departments: {} });
          const d = p.departments[m.department] || (p.departments[m.department] = { id: m.department, name: m.department, areas: {} });
          const a = d.areas[m.area] || (d.areas[m.area] = { id: m.area, name: m.area, gateways: {} });
          const g = a.gateways[m.gateway] || (a.gateways[m.gateway] = { id: m.gateway, name: m.gateway, motors: [] });
          g.motors.push(m);
        });
        const flatten = (node, key) => {
          node[key] = Object.values(node[key]);
          node[key].forEach((child) => {
            if (child.departments) flatten(child, "departments");
            if (child.areas) flatten(child, "areas");
            if (child.gateways) flatten(child, "gateways");
          });
        };
        const root = { plants: tree };
        flatten(root, "plants");
        return { data: root.plants };
      }
      
      if (url.match(/\/motors\/([A-Za-z0-9_]+)$/)) {
        const match = url.match(/\/motors\/([A-Za-z0-9_]+)$/);
        const motorId = match[1];
        const m = mock.MOTORS_SEED.find((x) => x.motor_id === motorId);
        if (m) return { data: m };
        return Promise.reject({ response: { status: 404, data: { detail: "Motor not found" } } });
      }
      
      if (url.includes("/motors")) {
        let plant = null;
        let status = null;
        if (url.includes("?")) {
          const parts = url.split("?")[1].split("&");
          const plantPart = parts.find(p => p.startsWith("plant="));
          if (plantPart) plant = plantPart.split("=")[1];
          const statusPart = parts.find(p => p.startsWith("status_f="));
          if (statusPart) status = statusPart.split("=")[1];
        }
        let resMotors = mock.MOTORS_SEED;
        if (plant) resMotors = resMotors.filter((m) => m.plant === plant);
        if (status && status !== "all") resMotors = resMotors.filter((m) => m.status === status);
        
        const enriched = resMotors.map((m) => {
          const f = mock.FAULTS_SEED.find((x) => x.motor_id === m.motor_id);
          return {
            ...m,
            recent_fault: f ? f.fault_type : "-",
            last_updated: f ? f.timestamp : "-"
          };
        });
        return { data: enriched };
      }
      
      if (url.includes("/telemetry/trend/")) {
        const parts = url.split("/");
        const motorId = parts[parts.length - 1];
        return { data: mock.getMockTrend(motorId, "rms") };
      }
      
      if (url.includes("/telemetry/fft/")) {
        const parts = url.split("/");
        const motorId = parts[parts.length - 1];
        return { data: mock.getMockFFT(motorId) };
      }
      
      if (url.includes("/faults")) {
        let motorId = null;
        if (url.includes("?")) {
          const parts = url.split("?")[1].split("&");
          const motorPart = parts.find(p => p.startsWith("motor_id="));
          if (motorPart) motorId = motorPart.split("=")[1];
        }
        let resFaults = mock.FAULTS_SEED;
        if (motorId) resFaults = resFaults.filter((f) => f.motor_id === motorId);
        return { data: resFaults };
      }
    }
    return Promise.reject(err);
  }
);
