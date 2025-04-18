import api from "@/services/api/deliveries";

export default {
  namespaced: true,
  state: () => ({
    deliveries: [],
    error: null,
    isLoading: false,
  }),
  mutations: {
    SET_DELIVERIES(state, deliveries) {
      state.deliveries = deliveries;
    },
    ADD_DELIVERY(state, delivery) {
      state.deliveries.unshift(delivery);
    },
    UPDATE_DELIVERY(state, updatedDelivery) {
      const index = state.deliveries.findIndex(
        (d) => d.delivery_id === updatedDelivery.delivery_id
      );
      if (index !== -1) {
        state.deliveries.splice(index, 1, updatedDelivery);
      }
    },
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    REMOVE_DELIVERY(state, deliveryId) {
      state.deliveries = state.deliveries.filter(
        (d) => d.delivery_id !== deliveryId
      );
    },
  },
  actions: {
    async fetchDeliveries({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.getDeliveries();
        commit("SET_DELIVERIES", response.data);
      } catch (error) {
        commit("SET_ERROR", error.message);
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async addDeliveryAction({ commit, dispatch }, deliveryData) {
      commit("SET_LOADING", true);
      try {
        // Подготовка данных для API
        const apiData = {
          supplier_id: deliveryData.supplier_id,
          delivery_date: deliveryData.delivery_date,
          delivery_number: deliveryData.delivery_number,
          document_path: deliveryData.document_path,
          materials: await Promise.all(
            deliveryData.materials.map(async (m) => {
              // Если это новый материал (без material_id)
              if (!m.material_id) {
                // Сначала создаем материал
                const newMaterial = await dispatch(
                  "materials/addMaterial",
                  {
                    material_name: m.material_name,
                    type: m.type,
                    unit: m.unit,
                    quantity: 0, // Начальное количество 0, так как оно будет добавлено при создании поставки
                    cost_per_unit: m.cost_per_unit,
                  },
                  { root: true }
                );

                return {
                  material_id: newMaterial.material_id,
                  quantity: m.quantity,
                  cost_per_unit: m.cost_per_unit,
                };
              }

              // Если материал уже существует
              return {
                material_id: m.material_id,
                quantity: m.quantity,
                cost_per_unit: m.cost_per_unit,
              };
            })
          ),
        };

        const response = await api.addDelivery(apiData);
        commit("ADD_DELIVERY", response.data);
        await dispatch("materials/fetchMaterials", null, { root: true });
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async uploadDocument({ commit, dispatch }, { deliveryId, file }) {
      commit("SET_LOADING", true);
      try {
        const formData = new FormData();
        formData.append("document", file);
        formData.append("delivery_id", deliveryId);

        // Используем api вместо apiClient
        const response = await api.uploadDocument(deliveryId, file);

        // Обновляем список поставок после загрузки
        await dispatch("fetchDeliveries");
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async downloadDocument({ commit }, deliveryId) {
      commit("SET_LOADING", true);
      try {
        const response = await api.downloadDocument(deliveryId);
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateDeliveryAction({ commit }, { id, deliveryData }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.updateDelivery(id, {
          supplier_id: deliveryData.supplier_id,
          delivery_date: deliveryData.delivery_date,
          delivery_number: deliveryData.delivery_number,
          materials: deliveryData.materials,
        });

        commit("UPDATE_DELIVERY", response.data);
        await this.dispatch("materials/fetchMaterials");
        return response.data;
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteDeliveryAction({ commit, dispatch }, deliveryId) {
      commit("SET_LOADING", true);
      try {
        // Отправляем запрос на удаление
        await api.deleteDelivery(deliveryId);

        // Обновляем локальное состояние
        commit("REMOVE_DELIVERY", deliveryId);

        // Обновляем список материалов
        await dispatch("materials/fetchMaterials", null, { root: true });
      } catch (error) {
        commit("SET_ERROR", error.message);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
  getters: {
    deliveries: (state) => state.deliveries,
  },
};
