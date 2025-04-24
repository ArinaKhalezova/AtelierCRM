import api from "@/services/api/fittings";

export default {
  namespaced: true,
  state: () => ({
    fittings: [],
    loading: false,
    error: null,
  }),
  mutations: {
    SET_FITTINGS(state, fittings) {
      state.fittings = fittings;
    },
    ADD_FITTING(state, fitting) {
      state.fittings.push(fitting);
    },
    UPDATE_FITTING(state, updatedFitting) {
      const index = state.fittings.findIndex(
        (f) => f.fitting_id === updatedFitting.fitting_id
      );
      if (index !== -1) {
        state.fittings.splice(index, 1, updatedFitting);
      }
    },
    REMOVE_FITTING(state, fittingId) {
      state.fittings = state.fittings.filter((f) => f.fitting_id !== fittingId);
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchOrderFittings({ commit }, orderId) {
      commit("SET_LOADING", true);
      try {
        const response = await api.getOrderFittings(orderId);
        commit("SET_FITTINGS", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response?.data?.error ||
            error.message ||
            "Ошибка загрузки примерок"
        );
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async addFitting({ commit }, fittingData) {
      commit("SET_LOADING", true);
      try {
        const response = await api.addFitting(fittingData);
        commit("ADD_FITTING", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async updateFitting({ commit }, { fittingId, fittingData }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.updateFitting({
          fittingId: fittingId,
          fittingData: fittingData,
        });
        commit("UPDATE_FITTING", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async deleteFitting({ commit }, fittingId) {
      commit("SET_LOADING", true);
      try {
        await api.deleteFitting(fittingId);
        commit("REMOVE_FITTING", fittingId);
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
  getters: {
    fittings: (state) => state.fittings,
    isLoading: (state) => state.loading,
    error: (state) => state.error,
  },
};
