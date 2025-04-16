import apiClient from "../config";

export default {
  getDeliveries() {
    return apiClient.get("/deliveries");
  },
  addDelivery(delivery) {
    return apiClient.post("/deliveries", delivery);
  },
  uploadDocument(deliveryId, file) {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("delivery_id", deliveryId);

    return apiClient.post("/deliveries/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  downloadDocument(deliveryId) {
    return apiClient.get(`/deliveries/${deliveryId}/download`, {
      responseType: "blob",
    });
  },
  updateDelivery(id, deliveryData) {
    return apiClient.put(`/deliveries/${id}`, deliveryData);
  },
  deleteDelivery(id) {
    return apiClient.delete(`/deliveries/${id}`);
  },
};
