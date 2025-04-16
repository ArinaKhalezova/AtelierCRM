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

        if (response.data.success) {
          commit("ADD_SUPPLIER", response.data.data);
          commit("SET_ERROR", null);
          return {
            success: true,
            message: response.data.message || "Поставщик успешно добавлен",
          };
        } else {
          commit("SET_ERROR", response.data.message || "Ошибка валидации");
          return {
            success: false,
            message: response.data.message,
            errors: response.data.errors || {},
          };
        }
      } catch (error) {
        let errorMessage = "Ошибка при добавлении поставщика";
        let errors = {};

        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
          errors = error.response.data.errors || {};
        } else {
          errorMessage = "Ошибка сети. Проверьте соединение.";
        }

        commit("SET_ERROR", errorMessage);
        return {
          success: false,
          message: errorMessage,
          errors,
        };
      }
    },
    async updateSupplierAction({ commit }, { id, supplierData }) {
      try {
        const response = await api.updateSupplier(id, supplierData);

        if (response.data.success) {
          commit("UPDATE_SUPPLIER", response.data.data);
          commit("SET_ERROR", null);
          return {
            success: true,
            message: response.data.message || "Данные поставщика обновлены",
          };
        } else {
          commit("SET_ERROR", response.data.message || "Ошибка валидации");
          return {
            success: false,
            message: response.data.message,
            errors: response.data.errors || {},
          };
        }
      } catch (error) {
        let errorMessage = "Ошибка при обновлении поставщика";
        let errors = {};

        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
          errors = error.response.data.errors || {};
        } else {
          errorMessage = "Ошибка сети. Проверьте соединение.";
        }

        commit("SET_ERROR", errorMessage);
        return {
          success: false,
          message: errorMessage,
          errors,
        };
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
