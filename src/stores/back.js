import { createStore } from "vuex";
import api from "@/services/api";

import clients from "./modules/clients";
import jobPositions from "./modules/jobPositions";
import statuses from "./modules/statuses";
import machineStates from "./modules/machineStates";
import paymentMethods from "./modules/paymentMethods";
import materialTypes from "./modules/materialTypes";

export default createStore({
  modules: {
    jobPositions,
    statuses,
    materialTypes,
    paymentMethods,
    machineStates,
  },
});

// import { createStore } from "vuex";
// import api from "@/services/api";

// const store = createStore({
//   state: {
//     clients: [],
//     jobPositions: [],
//     statuses: [],
//     materialTypes: [],
//     machine_states: [],
//     paymentMethods: [],

//     error: null,
//   },
//   mutations: {
//     SET_CLIENTS(state, clients) {
//       state.clients = clients;
//     },
//     RESET_CLIENTS(state) {
//       state.clients = [];
//     },

//     // должности
//     SET_JOB_POSITIONS(state, positions) {
//       state.jobPositions = positions;
//     },
//     ADD_JOB_POSITION(state, position) {
//       state.jobPositions.push(position);
//     },
//     DELETE_JOB_POSITION(state, id) {
//       state.jobPositions = state.jobPositions.filter(
//         (p) => p.job_position_id !== id
//       );
//     },

//     // статусы заказа
//     SET_STATUSES(state, statuses) {
//       state.statuses = statuses;
//     },
//     ADD_STATUS(state, status) {
//       state.statuses.push(status);
//     },
//     DELETE_STATUS(state, id) {
//       state.statuses = state.statuses.filter((p) => p.status_id !== id);
//     },

//     // типы материала
//     SET_MATERIAL_TYPES(state, materialTypes) {
//       state.materialTypes = materialTypes;
//     },
//     ADD_MATERIAL_TYPE(state, materialType) {
//       state.materialTypes.push(materialType);
//     },
//     DELETE_MATERIAL_TYPE(state, id) {
//       state.materialTypes = state.materialTypes.filter(
//         (p) => p.material_type_id !== id
//       );
//     },

//     // статусы станков
//     SET_STATES(state, machine_states) {
//       state.machine_states = machine_states;
//     },
//     ADD_STATE(state, machine_state) {
//       state.machine_states.push(machine_state);
//     },
//     DELETE_STATE(state, id) {
//       state.machine_states = state.machine_states.filter(
//         (p) => p.machine_state_id !== id
//       );
//     },

//     // методы оплаты
//     SET_PAYMENT_METHODS(state, paymentMethods) {
//       state.paymentMethods = paymentMethods;
//     },
//     ADD_PAYMENT_METHOD(state, paymentMethod) {
//       state.paymentMethods.push(paymentMethod);
//     },
//     DELETE_PAYMENT_METHOD(state, id) {
//       state.paymentMethods = state.paymentMethods.filter(
//         (p) => p.payment_method_id !== id
//       );
//     },

//     SET_ERROR(state, error) {
//       state.error = error;
//     },
//   },
//   actions: {
//     // должности
//     async fetchJobPositions({ commit }) {
//       try {
//         const response = await api.getJobPositions();
//         commit("SET_JOB_POSITIONS", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при загрузке должностей");
//         console.error("Error fetching job positions:", error);
//       }
//     },
//     async addJobPositionAction({ commit }, position) {
//       try {
//         const response = await api.addJobPosition(position);
//         commit("ADD_JOB_POSITION", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при добавлении должности");
//         console.error("Error adding job position:", error);
//       }
//     },
//     async deleteJobPositionAction({ commit }, id) {
//       try {
//         await api.deleteJobPosition(id);
//         commit("DELETE_JOB_POSITION", id);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при удалении должности");
//         console.error("Error deleting job position:", error);
//       }
//     },

//     // статусы заказа
//     async fetchStatuses({ commit }) {
//       try {
//         const response = await api.getStatuses();
//         commit("SET_STATUSES", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при загрузке статусов");
//         console.error("Error fetching statuses:", error);
//       }
//     },
//     async addStatusAction({ commit }, status) {
//       try {
//         const response = await api.addStatus(status);
//         commit("ADD_STATUS", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при добавлении статуса");
//         console.error("Error adding status:", error);
//       }
//     },
//     async deleteStatusAction({ commit }, id) {
//       try {
//         await api.deleteStatus(id);
//         commit("DELETE_STATUS", id);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при удалении статуса");
//         console.error("Error deleting status:", error);
//       }
//     },

//     // типы материала
//     async fetchMaterialTypes({ commit }) {
//       try {
//         const response = await api.getMaterialTypes();
//         commit("SET_MATERIAL_TYPES", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при загрузке должностей");
//         console.error("Error fetching job positions:", error);
//       }
//     },
//     async addMaterialTypeAction({ commit }, material_type) {
//       try {
//         const response = await api.addMaterialType(material_type);
//         commit("ADD_MATERIAL_TYPE", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при добавлении типа материала");
//         console.error("Error adding material type:", error);
//       }
//     },
//     async deleteMaterialTypeAction({ commit }, id) {
//       try {
//         await api.deleteMaterialType(id);
//         commit("DELETE_MATERIAL_TYPE", id);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при удалении типа материала");
//         console.error("Error deleting material type:", error);
//       }
//     },

//     // статусы станков
//     async fetchStates({ commit }) {
//       try {
//         const response = await api.getStates();
//         commit("SET_STATES", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при загрузке статусов");
//         console.error("Error fetching statuses:", error);
//       }
//     },
//     async addStateAction({ commit }, state) {
//       try {
//         const response = await api.addState(state);
//         commit("ADD_STATE", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при добавлении статуса");
//         console.error("Error adding status:", error);
//       }
//     },
//     async deleteStateAction({ commit }, id) {
//       try {
//         await api.deleteState(id);
//         commit("DELETE_STATE", id);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при удалении статуса");
//         console.error("Error deleting status:", error);
//       }
//     },

//     // методы оплаты
//     async fetchPaymentMethods({ commit }) {
//       try {
//         const response = await api.getPaymentMethods();
//         commit("SET_PAYMENT_METHODS", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при загрузке способов оплаты");
//         console.error("Error fetching payment methods:", error);
//       }
//     },
//     async addPaymentMethodAction({ commit }, payment_method) {
//       try {
//         const response = await api.addPaymentMethod(payment_method);
//         commit("ADD_PAYMENT_METHOD", response.data);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при добавлении способа оплаты");
//         console.error("Error adding payment method:", error);
//       }
//     },
//     async deletePaymentMethodAction({ commit }, id) {
//       try {
//         await api.deletePaymentMethod(id);
//         commit("DELETE_PAYMENT_METHOD", id);
//         commit("SET_ERROR", null);
//       } catch (error) {
//         commit("SET_ERROR", "Ошибка при удалении способа оплаты");
//         console.error("Error deleting payment method:", error);
//       }
//     },
//   },
//   getters: {
//     jobPositions: (state) => state.jobPositions,
//     statuses: (state) => state.statuses,
//     materialTypes: (state) => state.materialTypes,
//     machine_states: (state) => state.machine_states,
//     paymentMethods: (state) => state.paymentMethods,

//     error: (state) => state.error,
//   },
// });

// export default store;
