import api from "@/services/api/orderDetails";
import ordersApi from "@/services/api/orders";

export default {
  namespaced: true,
  state: () => ({
    currentOrder: null,
    orderServices: [],
    orderMaterials: [],
    measurements: null,
    loading: false,
    error: null,
  }),
  mutations: {
    SET_CURRENT_ORDER(state, order) {
      state.currentOrder = order;
    },
    SET_ORDER_SERVICES(state, services) {
      state.orderServices = services;
    },
    SET_ORDER_MATERIALS(state, materials) {
      state.orderMaterials = materials;
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
    UPDATE_ORDER_SERVICE_STATUS(state, { serviceId, status }) {
      const service = state.orderServices.find(
        (s) => s.order_service_id === serviceId
      );
      if (service) service.status = status;
    },
    SET_MEASUREMENTS(state, measurements) {
      state.measurements = measurements;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    // Основной action для загрузки всех данных заказа
    async fetchFullOrderDetails({ commit, dispatch }, orderId) {
      commit("SET_LOADING", true);
      try {
        // Загружаем основную информацию о заказе
        const orderResponse = await ordersApi.getOrderDetails(orderId);
        commit("SET_CURRENT_ORDER", orderResponse.data);

        // Параллельно загружаем связанные данные
        await Promise.all([
          dispatch("fetchOrderServices", orderId),
          dispatch("fetchOrderMaterials", orderId),
          dispatch("fetchMeasurements", orderId),
        ]);
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchOrderServices({ commit }, orderId) {
      const response = await api.getOrderServices(orderId);
      commit("SET_ORDER_SERVICES", response.data);
    },

    async fetchOrderMaterials({ commit }, orderId) {
      try {
        const response = await api.getOrderMaterials(orderId);
        commit("SET_ORDER_MATERIALS", response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          commit("SET_ORDER_MATERIALS", []);
        } else {
          commit("SET_ERROR", `Ошибка загрузки материалов: ${error.message}`);
          throw error;
        }
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

    async updateOrderServiceStatus({ commit }, { serviceId, status }) {
      try {
        const response = await api.updateOrderServiceStatus(serviceId, status);
        commit("UPDATE_ORDER_SERVICE_STATUS", {
          serviceId,
          status: response.data.status,
        });
        return true;
      } catch (error) {
        commit("SET_ERROR", error.message);
        return false;
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

    async fetchMeasurements({ commit }, orderId) {
      try {
        const response = await api.getOrderMeasurements(orderId);
        commit("SET_MEASUREMENTS", response.data);
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error;
        }
        commit("SET_MEASUREMENTS", null);
      }
    },

    async saveMeasurements({ commit, dispatch }, { orderId, measurements }) {
      try {
        const response = await api.saveOrderMeasurements(orderId, measurements);
        // После сохранения обновляем мерки
        await dispatch("fetchMeasurements", orderId);
        return response;
      } catch (error) {
        commit("SET_ERROR", "Ошибка сохранения мерок: " + error.message);
        throw error;
      }
    },
  },
  getters: {
    currentOrder: (state) => state.currentOrder,
    orderServices: (state) => state.orderServices,
    orderMaterials: (state) => state.orderMaterials,
    measurements: (state) => state.measurements,
    isLoading: (state) => state.loading,
    error: (state) => state.error,
  },
};
