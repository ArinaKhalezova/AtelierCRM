import apiClient from "../config";

export default {
  login(credentials) {
    return apiClient.post("/auth/login", credentials);
  },
  register(userData) {
    return apiClient.post("/auth/register", userData);
  },
  checkAuth() {
    return apiClient.get("/auth/me");
  },
  logout() {
    localStorage.removeItem("authToken");
  },
};
