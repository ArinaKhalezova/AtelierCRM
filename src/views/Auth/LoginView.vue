<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Вход в систему</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Введите ваш email"
            :class="{ 'input-error': errorField === 'email' }"
          />
          <p v-if="errorField === 'email'" class="error-message">{{ error }}</p>
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Введите пароль"
            :class="{ 'input-error': errorField === 'password' }"
          />
          <p v-if="errorField === 'password'" class="error-message">
            {{ error }}
          </p>
        </div>
        <button type="submit" class="login-btn">Войти</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  setup() {
    const email = ref("");
    const password = ref("");
    const error = ref("");
    const errorField = ref("");
    const router = useRouter();
    const store = useStore();

    const handleLogin = async () => {
      try {
        error.value = "";
        errorField.value = "";

        await store.dispatch("auth/login", {
          email: email.value,
          password: password.value,
        });

        router.push("/");
      } catch (err) {
        const authError = store.getters["auth/error"] || "Ошибка при входе";
        error.value = authError;

        // Определяем какое поле вызвало ошибку
        if (authError.includes("email")) {
          errorField.value = "email";
        } else if (authError.includes("пароль")) {
          errorField.value = "password";
        }
      }
    };

    return { email, password, error, errorField, handleLogin };
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.input-error {
  border-color: #e74c3c !important;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.login-btn:hover {
  background-color: #1a252f;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 1rem;
}
</style>
