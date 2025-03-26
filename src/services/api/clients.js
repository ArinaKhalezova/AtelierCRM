import apiClient from "../config";

export default {
  getClients() {
    return apiClient.get("/clients");
  },
  addClient(client) {
    return apiClient.post("/clients", client);
  },
  deleteClient(id) {
    return apiClient.delete(`/clients/${id}`);
  },
};
