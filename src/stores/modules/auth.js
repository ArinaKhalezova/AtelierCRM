import api from "@/services/api/auth";

export default {
  namespaced: true,
  state: () => ({
    user: JSON.parse(localStorage.getItem("userData")) || null,
    token: localStorage.getItem("authToken") || null,
    error: null,
    isLoading: false,
  }),
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      localStorage.setItem("userData", JSON.stringify(user));
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem("authToken", token);
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("refreshToken");
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_LOADING(state, loading) {
      state.isLoading = loading;
    },
  },
  actions: {
    async initializeAuth({ commit, dispatch }) {
      const token = localStorage.getItem("authToken");
      if (token) {
        commit("SET_TOKEN", token);
        // Проверяем валидность токена
        await dispatch("checkAuth");
      }
    },

    async login({ commit }, credentials) {
      commit("SET_LOADING", true);
      try {
        const response = await api.login(credentials);

        commit("SET_TOKEN", response.data.token);

        const userData = {
          id: response.data.user.id,
          fullname: response.data.user.fullname,
          email: response.data.user.email,
          role: response.data.user.role,
        };

        commit("SET_USER", userData);

        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        return response.data;
      } catch (error) {
        const message = error.response?.data?.error || "Ошибка входа";
        commit("SET_ERROR", message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async checkAuth({ commit, state }) {
      if (!state.token) return false;

      try {
        const response = await api.checkAuth();
        if (response.data) {
          commit("SET_USER", response.data);
          return true;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (error.response?.status === 401) {
          commit("CLEAR_AUTH");
          return false;
        }
      }
      return false;
    },

    async logout({ commit }) {
      try {
        await api.logout();
      } finally {
        commit("CLEAR_AUTH");
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    error: (state) => state.error,
    isLoading: (state) => state.isLoading,
    isAdmin: (state) =>
      ["Администратор", "Старший администратор"].includes(state.user?.role),
    isSuperAdmin: (state) => state.user?.role === "Старший администратор",
  },
};
