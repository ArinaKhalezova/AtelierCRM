import apiClient from "../config";

export default {
  getDeliveries() {
    return apiClient.get("/deliveries");
  },
  addDelivery(delivery) {
    return apiClient.post("/deliveries", delivery);
  },
  deleteDelivery(id) {
    return apiClient.delete(`/deliveries/${id}`);
  },
};
