import apiClient from "../config";

export default {
  getMaterials() {
    return apiClient.get("/materials");
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
};
