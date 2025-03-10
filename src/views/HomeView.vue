<template>
  <div class="home-view">
    <div class="welcome-banner">
      <h2>Добро пожаловать в CRM ателье!</h2>
      <p>Управляйте заказами, материалами и исполнителями в одном месте</p>
    </div>

    <div class="quick-stats">
      <div class="stat-card">
        <h3>Активные заказы</h3>
        <p class="stat-value">{{ activeOrdersCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Заказы не взяты в работу</h3>
        <p class="stat-value">{{ notStartedOrdersCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Доступные материалы</h3>
        <p class="stat-value">{{ materialsCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Исполнители</h3>
        <p class="stat-value">{{ executorsCount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'allOrders',
      'allMaterials',
      'allExecutors'
    ]),
    
    activeOrdersCount() {
      return this.allOrders?.filter(order => order.status === 'в процессе').length || 0;
    },
    
    notStartedOrdersCount() {
      return this.allOrders?.filter(order => order.status === 'взять в работу').length || 0;
    },
    
    materialsCount() {
      return this.allMaterials?.length || 0;
    },
    
    executorsCount() {
      return this.allExecutors?.length || 0;
    }
  }
};
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  background-image: url(../assets/img/background.jpg);
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-banner img {
  width: 2000px;
  height: 1500px;
  overflow: hidden;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-card {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  color: var(--secondary-color);
  margin: 1rem 0 0;
}
</style>