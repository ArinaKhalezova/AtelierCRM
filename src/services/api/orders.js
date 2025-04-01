import apiClient from "../config";

export default {
  getOrders() {
    return apiClient.get("/orders");
  },
  getOrderDetails(orderId) {
    return apiClient.get(`/orders/${orderId}`);
  },
  createOrder(order) {
    return apiClient.post("/orders", order);
  },
  deleteOrder(id) {
    return apiClient.delete(`/orders/${id}`);
  },
  updateOrderStatus(orderId, status) {
    return apiClient.patch(`/orders/${orderId}/status`, { status });
  },
  updateOrder(orderId, orderData) {
    return apiClient.put(`/orders/${orderId}`, orderData);
  },
  getOrdersCountByStatus() {
    return apiClient.get("/orders/status-counts");
  },
  getStatusHistory(orderId) {
    return apiClient.get(`/orders/${orderId}/status-history`);
  },
  updateOrderStatusWithHistory(orderId, status) {
    return apiClient.post(`/orders/${orderId}/update-status`, { status });
  },
  getAssignedOrders() {
    return apiClient.get("/orders/assigned-to-me");
  },
  assignOrderToEmployee(orderId) {
    return apiClient.post(`/orders/${orderId}/assign`);
  },
};
