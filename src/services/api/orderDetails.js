import apiClient from "../config";

export default {
  //история работы
  getOrderHistory(orderId) {
    return apiClient.get(`/orders/${orderId}/history`);
  },

  getOrderServiceHistory(orderId) {
    return apiClient.get(`/orders/${orderId}/services/history`);
  },

  // Услуги в заказе
  getOrderServices(orderId) {
    return apiClient.get(`/orders/${orderId}/services`);
  },
  addOrderService(orderId, service) {
    return apiClient.post(`/orders/${orderId}/services`, service);
  },
  deleteOrderService(orderId, serviceId) {
    return apiClient.delete(`/orders/${orderId}/services/${serviceId}`);
  },
  updateOrderServiceStatus(orderServiceId, status) {
    return apiClient.patch(`/orders/services/${orderServiceId}/status`, {
      status,
    });
  },

  // Материалы в заказе
  getOrderMaterials(orderId) {
    return apiClient.get(`/orders/${orderId}/materials`);
  },
  addOrderMaterial(orderId, material) {
    return apiClient.post(`/orders/${orderId}/materials`, material);
  },
  deleteOrderMaterial(orderId, orderMaterialId) {
    return apiClient.delete(`/orders/${orderId}/materials/${orderMaterialId}`);
  },

  // Мерки в заказе
  getOrderMeasurements(orderId) {
    return apiClient.get(`/orders/${orderId}/measurements`);
  },
  saveOrderMeasurements(orderId, measurements) {
    return apiClient.post(`/orders/${orderId}/measurements`, measurements);
  },
};
