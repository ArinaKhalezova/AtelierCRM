import api from "@/services/api";

export default {
  namespaced: true,
  state: () => ({
    invoices: [],
    error: null,
  }),
  mutations: {
    SET_INVOICES(state, invoices) {
      state.invoices = invoices;
    },
    ADD_INVOICE(state, invoice) {
      state.invoices.push(invoice);
    },
    DELETE_INVOICE(state, invoiceId) {
      state.invoices = state.invoices.filter((i) => i.invoice_id !== invoiceId);
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchInvoices({ commit }) {
      try {
        const response = await api.getInvoices();
        commit("SET_INVOICES", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при загрузке накладных");
        console.error("Error fetching invoices:", error);
      }
    },
    async addInvoiceAction({ commit }, invoice) {
      try {
        const response = await api.addInvoice(invoice);
        commit("ADD_INVOICE", response.data);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при добавлении накладной");
        console.error("Error adding invoice:", error);
      }
    },
    async deleteInvoiceAction({ commit }, id) {
      try {
        await api.deleteInvoice(id);
        commit("DELETE_INVOICE", id);
        commit("SET_ERROR", null);
      } catch (error) {
        commit("SET_ERROR", "Ошибка при удалении накладной");
        console.error("Error deleting invoice:", error);
      }
    },
  },
  getters: {
    allInvoices: (state) => state.invoices,
    error: (state) => state.error,
  },
};
