import api from "@/services/api/clients";

export default {
  namespaced: true,
  state: () => ({
    clients: [],
    error: null,
  }),
  mutations: {
    SET_CLIENTS(state, clients) {
      state.clients = clients;
    },
    ADD_CLIENT(state, client) {
      state.clients.unshift(client);
    },
    UPDATE_CLIENT(state, updatedClient) {
      const index = state.clients.findIndex(
        (s) => s.client_id === updatedClient.client_id
      );
      if (index !== -1) {
        state.clients.splice(index, 1, updatedClient);
      }
    },
    DELETE_CLIENT(state, id) {
      state.clients = state.clients.filter((c) => c.client_id !== id);
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchClients({ commit }) {
      try {
        const response = await api.getClients();
        commit("SET_CLIENTS", response.data);
      } catch (err) {
        commit("SET_ERROR", "Ошибка загрузки клиентов");
      }
    },

    async addClientAction({ commit }, clientData) {
      try {
        const response = await api.addClient(clientData);

        if (response.data.success) {
          commit("ADD_CLIENT", response.data.data);
          commit("SET_ERROR", null);
          return {
            success: true,
            message: response.data.message || "Клиент успешно добавлен",
          };
        } else {
          commit("SET_ERROR", response.data.message || "Ошибка валидации");
          return {
            success: false,
            message: response.data.message,
            errors: response.data.errors || {},
          };
        }
      } catch (error) {
        let errorMessage = "Ошибка при добавлении клиента";
        let errors = {};

        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
          errors = error.response.data.errors || {};
        } else {
          errorMessage = "Ошибка сети. Проверьте соединение.";
        }

        commit("SET_ERROR", errorMessage);
        return {
          success: false,
          message: errorMessage,
          errors,
        };
      }
    },
    async updateClientAction({ commit }, { id, clientData }) {
      try {
        const response = await api.updateClient(id, clientData);

        if (response.data.success) {
          commit("UPDATE_CLIENT", response.data.data);
          commit("SET_ERROR", null);
          return {
            success: true,
            message: response.data.message || "Данные клиента обновлены",
          };
        } else {
          commit("SET_ERROR", response.data.message || "Ошибка валидации");
          return {
            success: false,
            message: response.data.message,
            errors: response.data.errors || {},
          };
        }
      } catch (error) {
        let errorMessage = "Ошибка при обновлении клиента";
        let errors = {};

        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
          errors = error.response.data.errors || {};
        } else {
          errorMessage = "Ошибка сети. Проверьте соединение.";
        }

        commit("SET_ERROR", errorMessage);
        return {
          success: false,
          message: errorMessage,
          errors,
        };
      }
    },
    async deleteClientAction({ commit }, id) {
      try {
        await api.deleteClient(id);
        commit("DELETE_CLIENT", id);
      } catch (err) {
        commit("SET_ERROR", "Ошибка удаления");
        throw err;
      }
    },
  },
  getters: {
    allClients: (state) => state.clients,
    error: (state) => state.error,
  },
};
