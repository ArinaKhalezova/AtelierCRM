import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    jobPositions: [],
    error: null,
  }),
  mutations: {
    SET_JOB_POSITIONS(state, positions) {
      state.jobPositions = positions;
    },
    ADD_JOB_POSITION(state, position) {
      state.jobPositions.push(position);
    },
    DELETE_JOB_POSITION(state, id) {
      state.jobPositions = state.jobPositions.filter(
        (p) => p.job_position_id !== id
      );
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchJobPositions({ commit }) {
      try {
        const response = await api.getJobPositions();
        commit("SET_JOB_POSITIONS", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке должностей");
        console.error("Error fetching job positions:", error);
      }
    },
    async addJobPositionAction({ commit }, position) {
      try {
        const response = await api.addJobPosition(position);
        commit("ADD_JOB_POSITION", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении должности");
        console.error("Error adding job position:", error);
      }
    },
    async deleteJobPositionAction({ commit }, id) {
      try {
        await api.deleteJobPosition(id);
        commit("DELETE_JOB_POSITION", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении должности");
        console.error("Error deleting job position:", error);
      }
    },
  },
  getters: {
    jobPositions: (state) => state.jobPositions,
    error: (state) => state.error,
  },
};
