import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    orders: [],
    currentOrder: null,
    orderServices: [],
    orderMaterials: [],
    loading: false,
    error: null,
  }),
  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    SET_CURRENT_ORDER(state, order) {
      state.currentOrder = order;
    },
    SET_ORDER_SERVICES(state, services) {
      state.orderServices = services;
    },
    SET_ORDER_MATERIALS(state, materials) {
      state.orderMaterials = materials;
    },
    ADD_ORDER(state, order) {
      state.orders.unshift(order);
    },
    DELETE_ORDER(state, id) {
      state.orders = state.orders.filter((o) => o.order_id !== id);
    },
    ADD_ORDER_SERVICE(state, service) {
      state.orderServices.push(service);
    },
    ADD_ORDER_MATERIAL(state, material) {
      state.orderMaterials.push(material);
    },
    REMOVE_ORDER_SERVICE(state, serviceId) {
      state.orderServices = state.orderServices.filter(
        (s) => s.order_service_id !== serviceId
      );
    },
    REMOVE_ORDER_MATERIAL(state, materialId) {
      state.orderMaterials = state.orderMaterials.filter(
        (m) => m.order_material_id !== materialId
      );
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
        console.error("Order fetch error:", {
          error: errorMsg,
          stack: error.stack,
        });
        return false;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchOrderDetails({ commit }, orderId) {
      commit("SET_LOADING", true);
      try {
        const [order, services, materials] = await Promise.all([
          api.getOrderDetails(orderId),
          api.getOrderServices(orderId),
          api.getOrderMaterials(orderId),
        ]);

        commit("SET_CURRENT_ORDER", order.data);
        commit("SET_ORDER_SERVICES", services.data);
        commit("SET_ORDER_MATERIALS", materials.data);
      } catch (error) {
        commit("SET_ERROR", error.message);
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
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      }
    },

    async addServiceToOrder({ commit }, { orderId, service }) {
      try {
        const response = await api.addOrderService(orderId, service);
        commit("ADD_ORDER_SERVICE", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      }
    },

    async removeServiceFromOrder({ commit }, { orderId, serviceId }) {
      try {
        await api.deleteOrderService(orderId, serviceId);
        commit("REMOVE_ORDER_SERVICE", serviceId);
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      }
    },

    async addMaterialToOrder({ commit }, { orderId, material }) {
      try {
        const response = await api.addOrderMaterial(orderId, material);
        commit("ADD_ORDER_MATERIAL", response.data);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      }
    },

    async removeMaterialFromOrder({ commit }, { orderId, materialId }) {
      try {
        await api.deleteOrderMaterial(orderId, materialId);
        commit("REMOVE_ORDER_MATERIAL", materialId);
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      }
    },
  },
  getters: {
    allOrders: (state) => state.orders,
    currentOrder: (state) => state.currentOrder,
    orderServices: (state) => state.orderServices,
    orderMaterials: (state) => state.orderMaterials,
    isLoading: (state) => state.loading,
    error: (state) => state.error,
  },
};
