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
    UPDATE_ORDER(state, updatedOrder) {
      const index = state.orders.findIndex(
        (o) => o.order_id === updatedOrder.order_id
      );
      if (index !== -1) {
        state.orders.splice(index, 1, updatedOrder);
      }
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

    async editOrder({ commit, dispatch }, { orderId, orderData }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.updateOrder(orderId, orderData);
        commit("UPDATE_ORDER", response.data);
        await dispatch("fetchOrders");
        return true;
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.message;
        commit("SET_ERROR", errorMsg);
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteOrder({ commit, dispatch }, orderId) {
      commit("SET_LOADING", true);
      try {
        const response = await api.deleteOrder(orderId);

        if (response.data.success) {
          commit("DELETE_ORDER", orderId);
          await dispatch("fetchOrders");
          return true;
        }

        throw new Error(response.data.error || "Неизвестная ошибка");
      } catch (error) {
        let errorMessage = error.message;

        // Специальная обработка ошибки о статусе заказа
        if (
          error.response?.status === 400 &&
          error.response?.data?.error?.includes(
            "Нельзя удалить заказ в статусе"
          )
        ) {
          errorMessage = error.response.data.error;
        } else if (error.response?.status === 404) {
          errorMessage = "Заказ не найден";
        }

        commit("SET_ERROR", errorMessage);
        throw error; // Пробрасываем ошибку дальше в компонент
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateOrderStatus({ commit }, { orderId, status }) {
      try {
        const response = await api.updateOrderStatus(orderId, status);
        commit("UPDATE_ORDER_STATUS", { orderId, status: status });
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
