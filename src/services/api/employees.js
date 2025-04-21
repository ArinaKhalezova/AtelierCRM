import apiClient from "../config";

export default {
  getEmployees() {
    return apiClient.get("/employees");
  },
  addEmployee(employee) {
    return apiClient.post("/employees", employee);
  },
  updateEmployee(id, employeeData) {
    return apiClient.put(`/employees/${id}`, employeeData);
  },
  changePassword(employeeId, newPassword) {
    return apiClient.put(`/employees/${employeeId}/password`, { newPassword });
  },
  deleteEmployee(id) {
    return apiClient.delete(`/employees/${id}`);
  },
  getJobPositions() {
    return apiClient.get("/employees/job-positions");
  },
  getEmployeeByUserId(userId) {
    return apiClient.get(`/employees/by-user/${userId}`);
  },
};
