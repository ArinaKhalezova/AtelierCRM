import apiClient from "../config";

export default {
  getServices() {
    return apiClient.get("/services");
  },
  getServiceCategories() {
    return apiClient.get("/services/categories");
  },
  addService(serviceData) {
    return apiClient.post("/services", serviceData);
  },
  deleteService(serviceId) {
    return apiClient.delete(`/services/${serviceId}`);
  },
};
