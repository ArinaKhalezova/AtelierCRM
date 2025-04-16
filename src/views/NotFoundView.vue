<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <div class="not-found-icon">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="red"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M15 9L9 15"
            stroke="red"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 9L15 15"
            stroke="red"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1 class="not-found-title">404</h1>
      <p class="not-found-text">Ой! Кажется, такой страницы не существует.</p>
      <router-link to="/" class="not-found-button">
        Вернуться на главную
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

//автоматический редирект через 5 секунд
// setTimeout(() => {
//   router.push('/');
// }, 5000);
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--light-gray);
  padding: 2rem;
  animation: fadeIn 0.3s ease-out;
}

.not-found-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  transition: transform 0.2s ease;
}

.not-found-card:hover {
  transform: translateY(-5px);
}

.not-found-icon {
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.not-found-title {
  font-size: 3rem;
  color: var(--dark-teal);
  margin-bottom: 1rem;
  font-weight: 700;
  line-height: 1;
}

.not-found-text {
  color: var(--warm-gray);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.not-found-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--teal);
  color: white;
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.not-found-button:hover {
  background-color: white;
  color: var(--teal);
  border-color: var(--teal);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .not-found-card {
    padding: 2rem 1.5rem;
  }

  .not-found-title {
    font-size: 2.5rem;
  }

  .not-found-container {
    padding: 1rem;
  }
}
</style>
