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
      state.clients.push(client);
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

    async addClientAction({ commit }, client) {
      try {
        const response = await api.addClient(client);
        commit("ADD_CLIENT", response.data);
      } catch (err) {
        commit("SET_ERROR", "Ошибка добавления");
        throw err;
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
