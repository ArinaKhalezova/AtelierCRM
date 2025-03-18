import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    paymentMethods: [],
    error: null,
  }),
  mutations: {
    SET_PAYMENT_METHODS(state, paymentMethods) {
      state.paymentMethods = paymentMethods;
    },
    ADD_PAYMENT_METHOD(state, paymentMethod) {
      state.paymentMethods.push(paymentMethod);
    },
    DELETE_PAYMENT_METHOD(state, id) {
      state.paymentMethods = state.paymentMethods.filter(
        (p) => p.payment_method_id !== id
      );
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchPaymentMethods({ commit }) {
      try {
        const response = await api.getPaymentMethods();
        commit("SET_PAYMENT_METHODS", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке способов оплаты");
        console.error("Error fetching payment methods:", error);
      }
    },
    async addPaymentMethodAction({ commit }, payment_method) {
      try {
        const response = await api.addPaymentMethod(payment_method);
        commit("ADD_PAYMENT_METHOD", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении способа оплаты");
        console.error("Error adding payment method:", error);
      }
    },
    async deletePaymentMethodAction({ commit }, id) {
      try {
        await api.deletePaymentMethod(id);
        commit("DELETE_PAYMENT_METHOD", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении способа оплаты");
        console.error("Error deleting payment method:", error);
      }
    },
  },
  getters: {
    paymentMethods: (state) => state.paymentMethods,
    error: (state) => state.error,
  },
};
