import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем интерсептор для авторизации
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // Аутентификация
  login(credentials) {
    return apiClient
      .post("/auth/login", credentials)
      .then((response) => {
        console.log("API Login response:", response); // Логирование
        return response;
      })
      .catch((error) => {
        console.error("API Login error:", error); // Логирование
        throw error;
      });
  },
  register(userData) {
    return apiClient.post("/auth/register", userData);
  },
  checkAuth() {
    return apiClient.get("/auth/me");
  },
  logout() {
    localStorage.removeItem("authToken");
    // Можно добавить запрос на бэкенд для инвалидации токена
  },

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
  updateSupplier(id, supplier) {
    return apiClient.put(`/suppliers/${id}`, supplier);
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

  // Методы для работы с заказами
  getOrders() {
    return apiClient.get("/orders");
  },
  getOrderDetails(id) {
    return apiClient.get(`/orders/${id}`);
  },
  createOrder(order) {
    return apiClient.post("/orders", order);
  },
  deleteOrder(id) {
    return apiClient.delete(`/orders/${id}`);
  },

  // Методы для услуг в заказе
  getOrderServices(orderId) {
    return apiClient.get(`/orders/${orderId}/services`);
  },
  addOrderService(orderId, service) {
    return apiClient.post(`/orders/${orderId}/services`, service);
  },
  deleteOrderService(orderId, serviceId) {
    return apiClient.delete(`/orders/${orderId}/services/${serviceId}`);
  },

  getOrdersCountByStatus() {
    return apiClient
      .get("/orders/status-counts")
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error fetching order counts:", error);
        throw error;
      });
  },

  // Методы для обновления статусов
  updateOrderStatus(orderId, status) {
    return apiClient.patch(`/orders/${orderId}/status`, { status });
  },

  updateOrderServiceStatus(orderServiceId, status) {
    return apiClient.patch(`/orders/services/${orderServiceId}/status`, {
      status,
    });
  },

  getOrdersCountByStatus() {
    return apiClient.get("/orders/status-counts");
  },

  // Методы для материалов в заказе
  getOrderMaterials(orderId) {
    return apiClient.get(`/orders/${orderId}/materials`);
  },
  addOrderMaterial(orderId, material) {
    return apiClient.post(`/orders/${orderId}/materials`, material);
  },
  deleteOrderMaterial(orderId, orderMaterialId) {
    return apiClient.delete(`/orders/${orderId}/materials/${orderMaterialId}`);
  },

  // Методы для мерок в заказе
  getOrderMeasurements(orderId) {
    return apiClient.get(`/orders/${orderId}/measurements`).catch((error) => {
      if (error.response?.status === 404) {
        // Если мерок нет - возвращаем null
        return { data: null };
      }
      throw error;
    });
  },

  saveOrderMeasurements(orderId, measurements) {
    return apiClient
      .post(`/orders/${orderId}/measurements`, measurements, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error saving measurements:", error);
        throw error;
      });
  },
};
