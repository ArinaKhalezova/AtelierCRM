<template>
  <div class="app">
    <div class="main-nav">
      <router-link to="/" class="nav-logo">
        <img src="./assets/img/logo.svg" alt="atelier" style="width: 130px" />
      </router-link>
      <div class="nav-links">
        <router-link to="/">Главная</router-link>
        <router-link to="/orders">Заказы</router-link>
        <router-link to="/materials">Материалы</router-link>
        <router-link to="/supplies">Поставки</router-link>
        <router-link to="/suppliers">Поставщики</router-link>
        <router-link to="/executors">Исполнители</router-link>
        <router-link to="/settings">Настройки</router-link>
        <router-link to="/data">Данные</router-link>
      </div>
    </div>

    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 4fr;
  align-items: start;
}

.main-nav {
  background-color: var(--primary-color);
  padding: 1rem 2rem;
  display: grid;
  grid-template-rows: 1fr 4fr;
  justify-content: start;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-logo h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  flex-direction: column;
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
  padding: 2rem;
}
</style>
