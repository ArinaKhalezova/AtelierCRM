<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Регистрация</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="fullname">ФИО</label>
          <input
            id="fullname"
            v-model="form.fullname"
            type="text"
            required
            placeholder="Введите ваше полное имя"
          >
        </div>
        <div class="form-group">
          <label for="phone">Телефон</label>
          <input
            id="phone"
            v-model="form.phone_number"
            type="tel"
            required
            placeholder="Введите номер телефона"
          >
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Введите ваш email"
          >
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Придумайте пароль"
          >
        </div>
        <div class="form-group">
          <label for="confirmPassword">Подтвердите пароль</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Повторите пароль"
          >
        </div>
        <button type="submit" class="register-btn">Зарегистрироваться</button>
        <p class="login-link">
          Уже есть аккаунт? <router-link to="/login">Войти</router-link>
        </p>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

export default {
  setup() {
    const form = ref({
      fullname: '',
      phone_number: '',
      email: '',
      password: ''
    });
    const confirmPassword = ref('');
    const error = ref('');
    const success = ref('');
    const router = useRouter();

    const handleRegister = async () => {
      // Проверка совпадения паролей
      if (form.value.password !== confirmPassword.value) {
        error.value = 'Пароли не совпадают';
        return;
      }

      try {
        // Добавляем роль по умолчанию (Работник)
        const userData = {
          ...form.value,
          role: 'Работник' // По умолчанию регистрируем как работника
        };

        const response = await api.auth.register(userData);
        
        success.value = 'Регистрация успешна! Вы будете перенаправлены на страницу входа...';
        error.value = '';
        
        // Через 2 секунды перенаправляем на страницу входа
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка при регистрации';
        success.value = '';
      }
    };

    return { form, confirmPassword, error, success, handleRegister };
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-card {
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

.register-btn {
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

.register-btn:hover {
  background-color: #1a252f;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 1rem;
}

.success-message {
  color: #2ecc71;
  text-align: center;
  margin-top: 1rem;
}
</style>