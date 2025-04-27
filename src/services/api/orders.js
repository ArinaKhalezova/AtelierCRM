import apiClient from "../config";

export default {
  getOrders() {
    return apiClient.get("/orders");
  },
  getOrderDetails(orderId) {
    return apiClient.get(`/orders/${orderId}`);
  },
  getOverdueOrders() {
    return apiClient.get("/orders/overdue");
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
  assignEmployeeToOrder(orderId, employeeId) {
    return apiClient.post(`/orders/${orderId}/assign-employee`, {
      employee_id: employeeId,
    });
  },
  removeEmployeeFromOrder(orderId, employeeId) {
    return apiClient.delete(`/orders/${orderId}/employees/${employeeId}`);
  },
  getOrderEmployees(orderId) {
    return apiClient.get(`/orders/${orderId}/employees`);
  },
  getEmployeesWorkload() {
    return apiClient.get("/orders/employees/workload");
  },
  getOrderDocuments(orderId) {
    return apiClient.get(`/orders/${orderId}/documents`);
  },

  uploadOrderDocuments(orderId, formData) {
    return apiClient.post(`/orders/${orderId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  downloadOrderDocument(documentId) {
    return apiClient.get(`/orders/documents/${documentId}/download`, {
      responseType: "blob",
      transformResponse: (data, headers) => {
        return {
          data: data,
          filename: headers["content-disposition"]
            ? decodeURIComponent(
                headers["content-disposition"]
                  .split("filename*=UTF-8''")[1]
                  .split(";")[0]
              )
            : `document_${documentId}`,
        };
      },
    });
  },

  deleteOrderDocument(documentId) {
    return apiClient.delete(`/orders/documents/${documentId}`);
  },
};
