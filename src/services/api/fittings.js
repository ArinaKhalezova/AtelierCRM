import apiClient from "../config";

export default {
  getOrderFittings(orderId) {
    return apiClient.get(`/orders/${orderId}/fittings`);
  },
  addFitting({ orderId, fittingData }) {
    return apiClient.post(`/orders/${orderId}/fittings`, fittingData);
  },
  updateFitting(fittingId, fittingData) {
    return apiClient.put(`/orders/fittings/${fittingId}`, fittingData);
  },
  deleteFitting(fittingId) {
    return apiClient.delete(`/orders/fittings/${fittingId}`);
  },
};
