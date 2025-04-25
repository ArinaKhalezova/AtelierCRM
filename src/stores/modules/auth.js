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
      localStorage.setItem("authToken", token);
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    initializeAuth({ commit }) {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        commit("SET_TOKEN", token);
        commit("SET_USER", JSON.parse(userData));
      }
    },
    async login({ commit }, credentials) {
      try {
        const response = await api.login(credentials);
        commit("SET_TOKEN", response.data.token);

        // Сохраняем данные пользователя
        const userData = {
          id: response.data.user.id,
          fullname: response.data.user.fullname,
          email: response.data.user.email,
          role: response.data.user.role,
        };

        commit("SET_USER", userData);
        localStorage.setItem("userData", JSON.stringify(userData));
        commit("SET_ERROR", null);
        return response.data;
      } catch (error) {
        const message = error.response?.data?.error || "Ошибка входа";
        commit("SET_ERROR", message);
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
      try {
        await api.logout();
      } finally {
        commit("CLEAR_AUTH");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      }
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
    isSuperAdmin: (state) => state.user?.role === "Старший администратор",
    isAdmin: (state) =>
      ["Администратор", "Старший администратор"].includes(state.user?.role),
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    error: (state) => state.error,
  },
};
