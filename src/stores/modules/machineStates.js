import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    machineStates: [],
    error: null,
  }),
  mutations: {
    SET_STATES(state, machineStates) {
      state.machineStates = machineStates;
    },
    ADD_STATE(state, machineState) {
      state.machineStates.push(machineState);
    },
    DELETE_STATE(state, id) {
      state.machineStates = state.machineStates.filter(
        (p) => p.machine_state_id !== id
      );
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchStates({ commit }) {
      try {
        const response = await api.getStates();
        commit("SET_STATES", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке статусов");
        console.error("Error fetching statuses:", error);
      }
    },
    async addStateAction({ commit }, state) {
      try {
        const response = await api.addState(state);
        commit("ADD_STATE", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении статуса");
        console.error("Error adding status:", error);
      }
    },
    async deleteStateAction({ commit }, id) {
      try {
        await api.deleteState(id);
        commit("DELETE_STATE", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении статуса");
        console.error("Error deleting status:", error);
      }
    },
  },
  getters: {
    machineStates: (state) => state.machineStates,
    error: (state) => state.error,
  },
};
