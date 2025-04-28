import api from "@/services/api/orders";

export default {
  namespaced: true,
  state: () => ({
    orders: [],
    loading: false,
    error: null,
  }),
  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchOrders({ commit }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      try {
        console.log("Fetching assigned orders...");
        const response = await api.getAssignedOrders();
        console.log("Received orders:", response.data);
        commit("SET_ORDERS", response.data);
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
        });
        commit(
          "SET_ERROR",
          error.response?.data?.error || "Ошибка загрузки заказов"
        );
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
  getters: {
    activeOrdersCount: (state) => {
      const activeStatuses = ["Принят", "В работе"];
      return state.orders.filter((o) => activeStatuses.includes(o.status))
        .length;
    },
    notStartedOrdersCount: (state) =>
      state.orders.filter((o) => o.status === "Новый").length,
  },
};
