import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    employees: [],
    error: null,
  }),
  mutations: {
    SET_EMPLOYEES(state, employees) {
      state.employees = employees;
    },
    ADD_EMPLOYEE(state, employee) {
      state.employees.push(employee);
    },
    DELETE_EMPLOYEE(state, employeeId) {
      state.employees = state.employees.filter(
        (e) => e.employee_id !== employeeId
      );
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
    async addEmployeeAction({ commit }, employee) {
      try {
        const response = await api.addEmployee(employee);
        commit("ADD_EMPLOYEE", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении сотрудника");
        console.error("Error adding employee:", error);
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
    error: (state) => state.error,
  },
};
