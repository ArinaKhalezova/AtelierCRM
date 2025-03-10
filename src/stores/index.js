import { createStore } from "vuex";

// Функция для загрузки состояния из localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("vuex-state");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Ошибка при загрузке состояния:", err);
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("vuex-state", serializedState);
  } catch (err) {
    console.error("Ошибка при сохранении состояния:", err);
  }
};

// Загружаем начальное состояние из localStorage
const initialState = loadState() || {
  orders: [
    {
      id: 1,
      clientName: "Иванов Иван Иванович",
      receptionDate: "2023-10-01",
      completionDate: "2023-10-10",
      cost: 1000,
      status: "взять в работу",
    },
    // Добавьте еще 4 заказа
  ],
  materials: [
    {
      id: 1,
      name: "Ткань хлопок",
      supplyNumber: "SUP123",
      unitType: "метры",
      pricePerUnit: 500,
    },
    {
      id: 2,
      name: "Нитки",
      supplyNumber: "SUP456",
      unitType: "упаковка",
      pricePerUnit: 200,
    },
  ],
  executors: [
    {
      id: 1,
      fullName: "Петров Петр Петрович",
      phone: "+7 (123) 456-78-90",
      email: "petrov@example.com",
      position: "Швея",
    },
    {
      id: 2,
      fullName: "Сидорова Анна Ивановна",
      phone: "+7 (987) 654-32-10",
      email: "sidorova@example.com",
      position: "Закройщик",
    },
    {
      id: 3,
      fullName: "Козлов Дмитрий Сергеевич",
      phone: "+7 (555) 123-45-67",
      email: "kozlov@example.com",
      position: "Менеджер",
    },
  ],
  suppliers: [
    {
      id: 1,
      name: 'ООО "ТекстильПро"',
      phone: "+7 (495) 123-45-67",
      address: "г. Москва, ул. Текстильная, д. 10",
      inn: "1234567890",
    },
    {
      id: 2,
      name: "ИП Сидоров А.А.",
      phone: "+7 (495) 987-65-43",
      address: "г. Москва, ул. Швейная, д. 5",
      inn: "0987654321",
    },
  ],
  supplies: [
    {
      id: 1,
      supplyNumber: "SUP001",
      supplierId: 1,
      materials: [
        { name: "Ткань хлопок", quantity: 100, pricePerUnit: 500 },
        { name: "Нитки", quantity: 50, pricePerUnit: 200 },
      ],
      invoice: null,
    },
    {
      id: 2,
      supplyNumber: "SUP002",
      supplierId: 2,
      materials: [{ name: "Пуговицы", quantity: 200, pricePerUnit: 10 }],
      invoice: null,
    },
    {
      id: 3,
      supplyNumber: "SUP003",
      supplierId: 1,
      materials: [{ name: "Молнии", quantity: 150, pricePerUnit: 30 }],
      invoice: null,
    },
  ],
};

const store = createStore({
  state: initialState,
  mutations: {
    ADD_ORDER(state, order) {
      order.id = state.orders.length + 1;
      state.orders.push(order);
      saveState(state); // Сохраняем состояние после изменения
    },
    ADD_MATERIAL(state, material) {
      material.id = state.materials.length + 1;
      state.materials.push(material);
      saveState(state); // Сохраняем состояние после изменения
    },
    DELETE_MATERIAL(state, materialId) {
      state.materials = state.materials.filter((m) => m.id !== materialId);
      saveState(state);
    },
    ADD_EXECUTOR(state, executor) {
      executor.id = state.executors.length + 1;
      state.executors.push(executor);
      saveState(state); // Сохраняем состояние после изменения
    },
    DELETE_EXECUTOR(state, executorId) {
      state.executors = state.executors.filter((e) => e.id !== executorId);
      saveState(state);
    },
    UPDATE_ORDER(state, updatedOrder) {
      const index = state.orders.findIndex((o) => o.id === updatedOrder.id);
      if (index !== -1) {
        state.orders.splice(index, 1, updatedOrder);
      }
      saveState(state);
    },
    DELETE_ORDER(state, orderId) {
      state.orders = state.orders.filter((o) => o.id !== orderId);
      saveState(state);
    },
    ADD_SUPPLIER(state, supplier) {
      if (!state.suppliers) state.suppliers = [];
      supplier.id = state.suppliers.length
        ? Math.max(...state.suppliers.map((s) => s.id)) + 1
        : 1;
      state.suppliers.push(supplier);
      saveState(state);
    },
    DELETE_SUPPLIER(state, supplierId) {
      state.suppliers = state.suppliers.filter((s) => s.id !== supplierId);
      saveState(state);
    },
    ADD_SUPPLY(state, supply) {
      state.supplies = state.supplies || [];
      state.materials = state.materials || [];

      supply.id = state.supplies.length + 1;
      state.supplies.push(supply);

      supply.materials.forEach((material) => {
        const existingMaterial = state.materials.find(
          (m) => m.name === material.name
        );
        if (existingMaterial) {
          existingMaterial.quantity += material.quantity;
        } else {
          state.materials.push({
            id: state.materials.length + 1,
            name: material.name,
            quantity: material.quantity,
            pricePerUnit: material.pricePerUnit,
          });
        }
      });

      saveState(state);
    },
    DELETE_SUPPLY(state, supplyId) {
      state.supplies = state.supplies.filter((s) => s.id !== supplyId);
      saveState(state);
    },
  },
  actions: {
    addOrderAction({ commit }, order) {
      commit("ADD_ORDER", order);
    },
    addMaterialAction({ commit }, material) {
      commit("ADD_MATERIAL", material);
    },
    deleteMaterialAction({ commit }, materialId) {
      commit("DELETE_MATERIAL", materialId);
    },
    addExecutorAction({ commit }, executor) {
      commit("ADD_EXECUTOR", executor);
    },
    deleteExecutorAction({ commit }, executorId) {
      commit("DELETE_EXECUTOR", executorId);
    },
    updateOrderAction({ commit }, order) {
      commit("UPDATE_ORDER", order);
    },
    deleteOrderAction({ commit }, orderId) {
      commit("DELETE_ORDER", orderId);
    },
    addSupplierAction({ commit }, supplier) {
      commit("ADD_SUPPLIER", supplier);
    },
    deleteSupplierAction({ commit }, supplierId) {
      commit("DELETE_SUPPLIER", supplierId);
    },
    addSupplyAction({ commit }, supply) {
      commit("ADD_SUPPLY", supply);
    },
    deleteSupplyAction({ commit }, supplyId) {
      commit("DELETE_SUPPLY", supplyId);
    },
  },
  getters: {
    getOrderById: (state) => (id) => {
      return state.orders.find((order) => order.id === parseInt(id));
    },
    allOrders: (state) => state.orders,
    allMaterials: (state) => state.materials,
    allExecutors: (state) => state.executors,
    allSuppliers: (state) => state.suppliers,
    allSupplies: (state) => state.supplies,
    getSupplierById: (state) => (id) => {
      return state.suppliers.find((s) => s.id === id);
    },
    getSupplyById: (state) => (id) => {
      return state.supplies.find((supply) => supply.id === parseInt(id));
    },
  },
});

// Подписываемся на изменения хранилища и сохраняем состояние в localStorage
store.subscribe((mutation, state) => {
  saveState(state);
});

export default store;
