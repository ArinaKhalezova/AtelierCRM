import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    materialTypes: [],
    error: null,
  }),
  mutations: {
    SET_MATERIAL_TYPES(state, materialTypes) {
      state.materialTypes = materialTypes;
    },
    ADD_MATERIAL_TYPE(state, materialType) {
      state.materialTypes.push(materialType);
    },
    DELETE_MATERIAL_TYPE(state, id) {
      state.materialTypes = state.materialTypes.filter(
        (p) => p.material_type_id !== id
      );
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchMaterialTypes({ commit }) {
      try {
        const response = await api.getMaterialTypes();
        commit("SET_MATERIAL_TYPES", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке должностей");
        console.error("Error fetching job positions:", error);
      }
    },
    async addMaterialTypeAction({ commit }, material_type) {
      try {
        const response = await api.addMaterialType(material_type);
        commit("ADD_MATERIAL_TYPE", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении типа материала");
        console.error("Error adding material type:", error);
      }
    },
    async deleteMaterialTypeAction({ commit }, id) {
      try {
        await api.deleteMaterialType(id);
        commit("DELETE_MATERIAL_TYPE", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении типа материала");
        console.error("Error deleting material type:", error);
      }
    },
  },
  getters: {
    materialTypes: (state) => state.materialTypes,
    error: (state) => state.error,
  },
};
