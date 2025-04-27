<template>
  <div class="app-container">
    <div v-if="isAuthenticated" class="app">
      <aside class="main-nav">
        <router-link to="/" class="nav-logo">
          <img
            src="./assets/img/logo.jpg"
            alt="atelier"
            style="width: 100%; max-width: 130px"
          />
        </router-link>
        <nav class="nav-links">
          <router-link to="/">Главная</router-link>
          <router-link v-if="isAdmin" to="/orders">Заказы</router-link>
          <router-link v-else to="/my-orders">Мои заказы</router-link>
          <template v-if="isAdmin">
            <router-link to="/services">Услуги</router-link>
            <router-link to="/deliveries">Поставки</router-link>
            <router-link to="/clients">Клиенты</router-link>
            <router-link to="/employees">Сотрудники</router-link>
            <router-link v-if="isSuperAdmin" to="/data"
              >Справочник</router-link
            ></template
          >
        </nav>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </aside>

      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
    <div v-else class="auth-pages">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

// Computed свойства
const isAdmin = computed(() => store.getters["auth/isAdmin"]);
const isSuperAdmin = computed(() => store.getters["auth/isSuperAdmin"]);
const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);

// Методы
const handleLogout = () => {
  store.dispatch("auth/logout");
  router.push("/login");
};

onMounted(async () => {
  await store.dispatch("auth/initializeAuth");

  // Проверка актуальности токена
  if (store.getters["auth/isAuthenticated"]) {
    try {
      await store.dispatch("auth/checkAuth");
    } catch (error) {
      store.dispatch("auth/logout");
    }
  }
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
}

.auth-pages {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-nav {
  width: 20%;
  min-width: 200px;
  max-width: 250px;
  background-color: var(--surface);
  padding: 1.5rem 1rem;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  border-right: var(--border);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.nav-logo {
  display: flex;
  justify-content: center;
  padding: 0 0.5rem;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-links a {
  color: var(--text);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.nav-links a:hover {
  background-color: var(--teal);
  color: white;
}

.nav-links a.router-link-exact-active {
  background-color: var(--dark-teal);
  color: white;
  font-weight: 500;
}

.main-content {
  margin-left: 20%;
  width: 100%;
  padding: 2rem;
  min-height: 100vh;
}

.logout-btn {
  margin-top: auto;
  padding: 0.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c0392b;
}
</style>
