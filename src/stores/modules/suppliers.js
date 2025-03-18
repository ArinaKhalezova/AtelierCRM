import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    suppliers: [],
    error: null,
  }),
  mutations: {
    SET_SUPPLIERS(state, suppliers) {
      state.suppliers = suppliers;
    },
    ADD_SUPPLIER(state, supplier) {
      state.suppliers.push(supplier);
    },
    DELETE_SUPPLIER(state, id) {
      state.suppliers = state.suppliers.filter((p) => p.supplier_id !== id);
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchSuppliers({ commit }) {
      try {
        const response = await api.getSuppliers();
        commit("SET_SUPPLIERS", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке поставщиков");
        console.error("Error fetching suppliers:", error);
      }
    },
    async addSupplierAction({ commit }, supplier) {
      try {
        const response = await api.addSupplier(supplier);
        commit("ADD_SUPPLIER", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении поставщика");
        console.error("Error adding supplier:", error);
      }
    },
    async deleteSupplierAction({ commit }, id) {
      try {
        await api.deleteSupplier(id);
        commit("DELETE_SUPPLIER", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении поставщика");
        console.error("Error deleting supplier:", error);
      }
    },
  },
  getters: {
    suppliers: (state) => state.suppliers,
    error: (state) => state.error,
  },
};
