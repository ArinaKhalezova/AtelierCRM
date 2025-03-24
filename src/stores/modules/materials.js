import api from "@/services/api"; // Убедитесь, что этот импорт есть

export default {
  namespaced: true,
  state: () => ({
    materials: [],
    materialTypes: [],
    materialUnits: [],
    error: null,
  }),
  mutations: {
    SET_MATERIALS(state, materials) {
      state.materials = materials;
    },
    SET_MATERIAL_TYPES(state, types) {
      state.materialTypes = types;
    },
    SET_MATERIAL_UNITS(state, units) {
      state.materialUnits = units;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchMaterials({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.getMaterials();
        commit("SET_MATERIALS", response.data);
      } catch (error) {
        commit("SET_ERROR", error.message);
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchMaterialTypes({ commit }) {
      try {
        const response = await api.getMaterialTypes();
        commit("SET_MATERIAL_TYPES", response.data);
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Ошибка загрузки типов:", error);
      }
    },
    async fetchMaterialUnits({ commit }) {
      try {
        const response = await api.getMaterialUnits();
        commit("SET_MATERIAL_UNITS", response.data);
      } catch (error) {
        commit("SET_ERROR", error.message);
        console.error("Ошибка загрузки единиц:", error);
      }
    },
    async addMaterial({ commit }, materialData) {
      commit("SET_LOADING", true);
      try {
        const response = await api.addMaterial(materialData);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async deleteMaterial({ commit }, materialId) {
      commit("SET_LOADING", true);
      try {
        await api.deleteMaterial(materialId);
        // Обновляем список материалов после удаления
        await this.dispatch("materials/fetchMaterials");
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
  getters: {
    materials: (state) => state.materials,
    materialTypes: (state) => state.materialTypes,
    materialUnits: (state) => state.materialUnits,
  },
};
