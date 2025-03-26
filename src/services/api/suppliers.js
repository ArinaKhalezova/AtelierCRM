import apiClient from "../config";

export default {
  getSuppliers() {
    return apiClient.get("/suppliers");
  },
  addSupplier(supplier) {
    return apiClient.post("/suppliers", supplier);
  },
  updateSupplier(id, supplier) {
    return apiClient.put(`/suppliers/${id}`, supplier);
  },
  deleteSupplier(id) {
    return apiClient.delete(`/suppliers/${id}`);
  },
};
