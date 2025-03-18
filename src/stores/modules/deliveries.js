import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    deliveries: [],
    error: null,
  }),
  mutations: {
    SET_DELIVERIES(state, deliveries) {
      state.deliveries = deliveries;
    },
    ADD_DELIVERY(state, delivery) {
      state.deliveries.push(delivery);
    },
    DELETE_DELIVERY(state, deliveryId) {
      state.deliveries = state.deliveries.filter(
        (d) => d.delivery_id !== deliveryId
      );
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchDeliveries({ commit }) {
      try {
        const response = await api.getDeliveries();
        commit("SET_DELIVERIES", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке поставок");
        console.error("Error fetching deliveries:", error);
      }
    },
    async addDeliveryAction({ commit }, delivery) {
      try {
        const response = await api.addDelivery(delivery);
        commit("ADD_DELIVERY", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении поставки");
        console.error("Error adding delivery:", error);
      }
    },
    async deleteDeliveryAction({ commit }, id) {
      try {
        await api.deleteDelivery(id);
        commit("DELETE_DELIVERY", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении поставки");
        console.error("Error deleting delivery:", error);
      }
    },
  },
  getters: {
    allDeliveries: (state) => state.deliveries,
    error: (state) => state.error,
  },
};
