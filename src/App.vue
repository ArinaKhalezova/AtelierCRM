<template>
  <div class="app">
    <nav class="main-nav">
      <router-link to="/" class="nav-logo">
        <img src="./assets/img/logo.svg" alt="atelier" style="width: 130px" />
      </router-link>
      <div class="nav-links">
        <router-link to="/orders">Заказы</router-link>
        <router-link to="/materials">Материалы</router-link>
        <router-link to="/supplies">Поставки</router-link>
        <router-link to="/suppliers">Поставщики</router-link>
        <router-link to="/executors">Исполнители</router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  background-color: var(--primary-color);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-logo h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: var(--hover-color);
}

.nav-links a.router-link-exact-active {
  background-color: var(--secondary-color);
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>
