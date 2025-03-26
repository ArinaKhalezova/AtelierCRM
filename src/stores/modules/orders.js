import api from "@/services/api/orders";

export default {
  namespaced: true,
  state: () => ({
    orders: [],
    loading: false,
    error: null,
    ordersCount: null,
  }),
  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    ADD_ORDER(state, order) {
      state.orders.unshift(order);
    },
    DELETE_ORDER(state, id) {
      state.orders = state.orders.filter((o) => o.order_id !== id);
    },
    UPDATE_ORDER_STATUS(state, { orderId, status }) {
      const order = state.orders.find((o) => o.order_id === orderId);
      if (order) order.status = status;
    },
    SET_ORDERS_COUNT(state, counts) {
      state.ordersCount = counts;
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
        const response = await api.getOrders();
        commit("SET_ORDERS", response.data);
        return true;
      } catch (error) {
        const errorMsg =
          error.response?.data?.details ||
          error.response?.data?.error ||
          error.message;
        commit("SET_ERROR", errorMsg);
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async createOrder({ commit }, orderData) {
      try {
        const response = await api.createOrder(orderData);
        commit("ADD_ORDER", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      }
    },

    async deleteOrder({ commit }, orderId) {
      try {
        await api.deleteOrder(orderId);
        commit("DELETE_ORDER", orderId);
        return true; // Успешное удаление
      } catch (error) {
        let errorMessage = error.message;
        if (error.response?.status === 404) {
          errorMessage = "Заказ не найден";
        } else if (error.response?.status === 400) {
          errorMessage =
            error.response.data.error || "Нельзя удалить этот заказ";
        }
        commit("SET_ERROR", errorMessage);
        return false; // Ошибка удаления
      }
    },

    async updateOrderStatus({ commit }, { orderId, status }) {
      try {
        const response = await api.updateOrderStatus(orderId, status);
        commit("UPDATE_ORDER_STATUS", {
          orderId,
          status: response.data.status,
        });
        return true;
      } catch (error) {
        commit("SET_ERROR", error.message);
        return false;
      }
    },

    async fetchOrdersCountByStatus({ commit }) {
      try {
        const response = await api.getOrdersCountByStatus();
        commit("SET_ORDERS_COUNT", response.data);
      } catch (error) {
        commit("SET_ERROR", error.message);
      }
    },
  },
  getters: {
    allOrders: (state) => state.orders,
    activeOrdersCount: (state) => {
      const activeStatuses = ["Принят", "В работе"];
      return state.orders.filter((o) => activeStatuses.includes(o.status))
        .length;
    },
    notStartedOrdersCount: (state) =>
      state.orders.filter((o) => o.status === "Новый").length,
    ordersByStatus: (state) => (status) =>
      state.orders.filter((o) => o.status === status),
    isLoading: (state) => state.loading,
    error: (state) => state.error,
  },
};
