import api from "@/services/api/suppliers";

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
    UPDATE_SUPPLIER(state, updatedSupplier) {
      const index = state.suppliers.findIndex(
        (s) => s.supplier_id === updatedSupplier.supplier_id
      );
      if (index !== -1) {
        state.suppliers.splice(index, 1, updatedSupplier);
      }
    },
    DELETE_SUPPLIER(state, id) {
      state.suppliers = state.suppliers.filter((s) => s.supplier_id !== id);
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
    async addSupplierAction({ commit }, supplierData) {
      try {
        const response = await api.addSupplier(supplierData);
        commit("ADD_SUPPLIER", response.data);
        commit("SET_ERROR", null);
        return response.data;
      } catch (err) {
        commit(
          "SET_ERROR",
          err.response?.data?.error || "Ошибка при добавлении поставщика"
        );
        throw err;
      }
    },
    async updateSupplierAction({ commit }, { id, supplierData }) {
      try {
        const response = await api.updateSupplier(id, supplierData);
        commit("UPDATE_SUPPLIER", response.data);
        commit("SET_ERROR", null);
        return response.data;
      } catch (err) {
        commit(
          "SET_ERROR",
          err.response?.data?.error || "Ошибка при обновлении поставщика"
        );
        throw err;
      }
    },
    async deleteSupplierAction({ commit }, id) {
      try {
        await api.deleteSupplier(id);
        commit("DELETE_SUPPLIER", id);
        commit("SET_ERROR", null);
      } catch (err) {
        commit(
          "SET_ERROR",
          err.response?.data?.error ||
            "Ошибка при удалении поставщика. Возможно, есть связанные поставки."
        );
        throw err;
      }
    },
  },
  getters: {
    suppliers: (state) => state.suppliers,
    error: (state) => state.error,
  },
};
