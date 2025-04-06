import api from "@/services/api/auth";

export default {
  namespaced: true,
  state: () => ({
    user: null,
    token: localStorage.getItem("authToken") || null,
    error: null,
  }),
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem("authToken", token); // Сохраняем в localStorage
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("authToken"); // Очищаем localStorage
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await api.login(credentials);
        commit("SET_TOKEN", response.data.token);
        commit("SET_USER", response.data.user); // Если бэкенд возвращает user
        commit("SET_ERROR", null);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", "Ошибка входа");
        throw error;
      }
    },
    async register({ commit }, userData) {
      try {
        const response = await api.register(userData);
        commit("SET_TOKEN", response.data.token);
        commit("SET_USER", response.data.user);
        commit("SET_ERROR", null);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", "Ошибка регистрации");
        throw error;
      }
    },
    async logout({ commit }) {
      commit("CLEAR_AUTH");
      await api.logout(); // Если есть API для логаута
    },
    async checkAuth({ commit, state }) {
      try {
        // Проверяем наличие токена
        if (!state.token) {
          return false;
        }

        // Проверяем валидность токена на сервере
        const response = await api.checkAuth();

        if (response.data) {
          commit("SET_USER", response.data);
          return true;
        }

        // Если ответ пустой, очищаем аутентификацию
        commit("CLEAR_AUTH");
        return false;
      } catch (error) {
        console.error("Auth check failed:", error);
        commit("CLEAR_AUTH");
        return false;
      }
    },
  },
  getters: {
    isAdmin: (state) => state.user?.role === "Администратор",
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    error: (state) => state.error,
  },
};
