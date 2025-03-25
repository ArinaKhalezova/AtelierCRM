<template>
  <div class="app">
    <aside class="main-nav">
      <router-link to="/" class="nav-logo">
        <img src="./assets/img/logo.jpg" alt="atelier" style="width: 100%; max-width: 130px" />
      </router-link>
      <nav class="nav-links">
        <router-link to="/">Главная</router-link>
        <router-link to="/orders">Заказы</router-link>
        <router-link to="/services">Услуги</router-link>
        <router-link to="/deliveries">Поставки</router-link>
        <router-link to="/clients">Клиенты</router-link>
        <router-link to="/employees">Сотрудники</router-link>
        <router-link to="/data">Справочник</router-link>
      </nav>
    </aside>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  background-color: var(--bg);
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
</style>