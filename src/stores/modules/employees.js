import api from "@/services/api/employees";

export default {
  namespaced: true,
  state: () => ({
    employees: [],
    jobPositions: [],
    error: null,
  }),
  mutations: {
    SET_EMPLOYEES(state, employees) {
      state.employees = employees;
    },
    ADD_EMPLOYEE(state, employee) {
      state.employees.push(employee);
    },
    UPDATE_EMPLOYEE(state, updatedEmployee) {
      const index = state.employees.findIndex(
        (e) => e.employee_id === updatedEmployee.employee_id
      );
      if (index !== -1) {
        state.employees.splice(index, 1, updatedEmployee);
      }
    },
    DELETE_EMPLOYEE(state, employeeId) {
      state.employees = state.employees.filter(
        (e) => e.employee_id !== employeeId
      );
    },
    SET_JOB_POSITIONS(state, jobPositions) {
      state.jobPositions = jobPositions;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchEmployees({ commit }) {
      try {
        const response = await api.getEmployees();
        commit("SET_EMPLOYEES", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке сотрудников");
        console.error("Error fetching employees:", error);
      }
    },
    async fetchJobPositions({ commit }) {
      try {
        const response = await api.getJobPositions();
        commit("SET_JOB_POSITIONS", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        const message =
          error.response?.data?.error ||
          "Ошибка при загрузке списка должностей";
        commit("SET_ERROR", message);
        console.error("Error fetching job positions:", error);

        // Возвращаем дефолтный список для продолжения работы
        const defaultPositions = ["Швея", "Закройщик", "Модельер", "Технолог"];
        commit("SET_JOB_POSITIONS", defaultPositions);
      }
    },
    async addEmployeeAction({ commit }, employeeData) {
      try {
        const response = await api.addEmployee(employeeData);

        if (response.data.success) {
          commit("ADD_EMPLOYEE", response.data.data);
          commit("SET_ERROR", null);
          return {
            success: true,
            message: response.data.message || "Сотрудник успешно добавлен",
          };
        } else {
          // Ошибки валидации от сервера
          commit("SET_ERROR", response.data.message || "Ошибка валидации");
          return {
            success: false,
            message: response.data.message,
            errors: response.data.errors || {},
          };
        }
      } catch (error) {
        let errorMessage = "Ошибка при добавлении сотрудника";
        let errors = {};

        if (error.response) {
          // Ошибка от сервера
          errorMessage = error.response.data.message || errorMessage;
          errors = error.response.data.errors || {};
        } else {
          // Ошибка сети
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
    async updateEmployeeAction({ commit }, { id, employeeData }) {
      try {
        const response = await api.updateEmployee(id, employeeData);

        if (response.data.success) {
          commit("UPDATE_EMPLOYEE", response.data.data);
          commit("SET_ERROR", null);
          return {
            success: true,
            message:
              response.data.message || "Данные сотрудника успешно обновлены",
          };
        } else {
          // Ошибки валидации от сервера
          commit("SET_ERROR", response.data.message || "Ошибка валидации");
          return {
            success: false,
            message: response.data.message,
            errors: response.data.errors || {},
          };
        }
      } catch (error) {
        let errorMessage = "Ошибка при обновлении сотрудника";
        let errors = {};

        if (error.response) {
          // Ошибка от сервера
          errorMessage = error.response.data.message || errorMessage;
          errors = error.response.data.errors || {};
        } else {
          // Ошибка сети
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
    async changePassword({ commit }, { employeeId, newPassword }) {
      try {
        const response = await api.changePassword(employeeId, newPassword);
        commit("SET_ERROR", null);
        return {
          success: true,
          message: response.data.message,
        };
      } catch (error) {
        let message = "Ошибка при изменении пароля";
        let details = {};

        if (error.response) {
          message = error.response.data.error || message;
          details = error.response.data.details || {};
        }

        commit("SET_ERROR", { message, details });
        return {
          success: false,
          message,
          details,
        };
      }
    },
    async deleteEmployeeAction({ commit }, id) {
      try {
        await api.deleteEmployee(id);
        commit("DELETE_EMPLOYEE", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении сотрудника");
        console.error("Error deleting employee:", error);
      }
    },
  },
  getters: {
    allEmployees: (state) => state.employees,
    jobPositions: (state) => state.jobPositions,
    error: (state) => state.error,
  },
};
