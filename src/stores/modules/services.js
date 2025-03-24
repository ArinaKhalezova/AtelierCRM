import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    services: [],
    serviceCategories: [],
    error: null,
  }),
  mutations: {
    SET_SERVICES(state, services) {
      state.services = services; 
    },
    ADD_SERVICE(state, service) {
      state.services.push(service);
    },
    DELETE_SERVICE(state, serviceId) {
      state.services = state.services.filter((s) => s.service_id !== serviceId);
    },
    SET_SERVICE_CATEGORIES(state, categories) {
      state.serviceCategories = categories;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchServices({ commit }) {
      try {
        const response = await api.getServices(); // ваша API функция
        commit("SET_SERVICES", response.data); // убедитесь что response.data - массив
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      }
    },

    async fetchServiceCategories({ commit }) {
      try {
        const response = await api.getServiceCategories();
        commit("SET_SERVICE_CATEGORIES", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке категорий");
        console.error("Error fetching categories:", error);
      }
    },

    async addService({ commit }, serviceData) {
      try {
        // Добавляем проверку на пустые данные
        if (!serviceData.name || !serviceData.category) {
          throw new Error("Не заполнены обязательные поля");
        }

        const response = await api.addService(serviceData);
        commit("ADD_SERVICE", response.data);
        return true;
      } catch (error) {
        console.error("Add service error:", error);
        throw error;
      }
    },

    async deleteService({ commit }, serviceId) {
      try {
        await api.deleteService(serviceId);
        commit("DELETE_SERVICE", serviceId);
        commit("SET_ERROR", null);
        return true;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.response?.data?.error || "Ошибка при удалении"
        );
        return false;
      }
    },
  },
};
