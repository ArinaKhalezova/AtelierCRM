import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  // Методы для работы с клиентами
  getClients() {
    return apiClient.get("/clients");
  },
  addClient(client) {
    return apiClient.post("/clients", client);
  },
  deleteClient(id) {
    return apiClient.delete(`/clients/${id}`);
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
  getJobPositions() {
    return apiClient.get("/employees/job-positions");
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

  // Методы для работы с материалами
  getMaterials() {
    return apiClient.get("/materials"); // Уже содержит полный URL
  },
  getMaterialTypes() {
    return apiClient.get("/materials/types");
  },
  getMaterialUnits() {
    return apiClient.get("/materials/units");
  },
  addMaterial(materialData) {
    return apiClient.post("/materials", materialData);
  },
  updateMaterial(id, material) {
    return apiClient.put(`/materials/${id}`, material);
  },
  deleteMaterial(id) {
    return apiClient.delete(`/materials/${id}`);
  },

  // Методы для работы с сервисами
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
