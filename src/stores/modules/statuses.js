import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    statuses: [],
    error: null,
  }),
  mutations: {
    SET_STATUSES(state, statuses) {
      state.statuses = statuses;
    },
    ADD_STATUS(state, status) {
      state.statuses.push(status);
    },
    DELETE_STATUS(state, id) {
      state.statuses = state.statuses.filter((p) => p.status_id !== id);
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchStatuses({ commit }) {
      try {
        const response = await api.getStatuses();
        commit("SET_STATUSES", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке статусов");
        console.error("Error fetching statuses:", error);
      }
    },
    async addStatusAction({ commit }, status) {
      try {
        const response = await api.addStatus(status);
        commit("ADD_STATUS", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении статуса");
        console.error("Error adding status:", error);
      }
    },
    async deleteStatusAction({ commit }, id) {
      try {
        await api.deleteStatus(id);
        commit("DELETE_STATUS", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении статуса");
        console.error("Error deleting status:", error);
      }
    },
  },
  getters: {
    statuses: (state) => state.statuses,
    error: (state) => state.error,
  },
};
