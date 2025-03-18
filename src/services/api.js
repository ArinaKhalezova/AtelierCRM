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

  // Методы для работы со статусами заказа
  getStatuses() {
    return apiClient.get("/statuses");
  },
  addStatus(status) {
    return apiClient.post("/statuses", status);
  },
  deleteStatus(id) {
    return apiClient.delete(`/statuses/${id}`);
  },

  // Методы для работы с типами материала
  getMaterialTypes() {
    return apiClient.get("/material-types");
  },
  addMaterialType(materialType) {
    return apiClient.post("/material-types", materialType);
  },
  deleteMaterialType(id) {
    return apiClient.delete(`/material-types/${id}`);
  },

  // Методы для работы со статусами станков
  getStates() {
    return apiClient.get("/states");
  },
  addState(state) {
    return apiClient.post("/states", state);
  },
  deleteState(id) {
    return apiClient.delete(`/states/${id}`);
  },

  // Методы для работы с методами оплаты
  getPaymentMethods() {
    return apiClient.get("/payment-methods");
  },
  addPaymentMethod(paymentMethod) {
    return apiClient.post("/payment-methods", paymentMethod);
  },
  deletePaymentMethod(id) {
    return apiClient.delete(`/payment-methods/${id}`);
  },

  // Методы для работы с поставщиками
  getSuppliers() {
    return apiClient.get("/suppliers");
  },
  addSupplier(supplier) {
    return apiClient.post("/suppliers", supplier);
  },
  deleteSupplier(id) {
    return apiClient.delete(`/suppliers/${id}`);
  },

  // Методы для работы с сотрудниками
  getEmployees() {
    return apiClient.get("/employees");
  },
  addEmployee(employee) {
    return apiClient.post("/employees", employee);
  },
  deleteEmployee(id) {
    return apiClient.delete(`/employees/${id}`);
  },

  // Методы для работы с поставками
  getDeliveries() {
    return apiClient.get("/deliveries");
  },
  addDelivery(delivery) {
    return apiClient.post("/deliveries", delivery);
  },
  deleteDelivery(id) {
    return apiClient.delete(`/deliveries/${id}`);
  },

  // Методы для работы с накладными
  getInvoices() {
    return apiClient.get("/invoices");
  },
  addInvoice(invoice) {
    return apiClient.post("/invoices", invoice);
  },
  deleteInvoice(id) {
    return apiClient.delete(`/invoices/${id}`);
  },
};
