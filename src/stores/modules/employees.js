import api from "@/services/api";

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
        commit("SET_ERROR", "Ошибка при загрузке должностей");
        console.error("Error fetching job positions:", error);
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
    jobPositions: (state) => state.jobPositions,
    error: (state) => state.error,
  },
};
