import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  getClients() {
    return apiClient.get("/clients");
  },
  // Методы для работы с должностями
  getJobPositions() {
    return apiClient.get("/job-positions");
  },
  addJobPosition(position) {
    return apiClient.post("/job-positions", position);
  },
  deleteJobPosition(id) {
    return apiClient.delete(`/job-positions/${id}`);
  },
};
