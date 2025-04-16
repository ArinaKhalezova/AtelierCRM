import apiClient from "../config";

export default {
  getClients() {
    return apiClient.get("/clients");
  },
  addClient(client) {
    return apiClient.post("/clients", client);
  },
  updateClient(id, clientData) {
    return apiClient.put(`/clients/${id}`, clientData);
  },
  deleteClient(id) {
    return apiClient.delete(`/clients/${id}`);
  },
};
