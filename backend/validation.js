const validate = {
  // Валидация ФИО
  fullname: (fullname) => {
    if (!fullname) return "ФИО обязательно для заполнения";
    if (fullname.length < 2) return "ФИО слишком короткое (минимум 2 символа)";
    if (fullname.length > 100)
      return "ФИО слишком длинное (максимум 100 символов)";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(fullname)) {
      return "ФИО должно содержать только буквы, пробелы и дефисы";
    }
    return null;
  },

  // Валидация номера телефона
  phone: (phone) => {
    if (!phone) return "Номер телефона обязателен для заполнения";
    // Удаляем все нецифровые символы, кроме +
    const cleaned = phone.replace(/[^\d+]/g, "");
    if (!/^(\+7|7|8)\d{10}$/.test(cleaned)) {
      return "Номер телефона должен быть в формате +7XXXXXXXXXX, 7XXXXXXXXXX или 8XXXXXXXXXX (11 цифр)";
    }
    return null;
  },

  // Валидация email
  email: (email, required = false) => {
    if (!email) return required ? "Email обязателен для заполнения" : null;
    if (email.length > 100)
      return "Email слишком длинный (максимум 100 символов)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Некорректный email. Пример правильного формата: example@domain.com";
    }
    return null;
  },

  // Валидация названия организации
  orgName: (name) => {
    if (!name) return "Название организации обязательно";
    if (name.length < 2) return "Название слишком короткое (минимум 2 символа)";
    if (name.length > 100)
      return "Название слишком длинное (максимум 100 символов)";
    return null;
  },

  // Валидация пароля
  password: (password) => {
    if (!password) return "Пароль обязателен для заполнения";
    if (password.length < 6)
      return "Пароль слишком короткий (минимум 6 символов)";
    if (password.length > 50)
      return "Пароль слишком длинный (максимум 50 символов)";
    return null;
  },

  // Валидация даты
  date: (date) => {
    if (!date) return "Дата обязательна для заполнения";
    if (isNaN(Date.parse(date))) return "Некорректный формат даты";
    return null;
  },

  // Валидация материалов поставки
  materials: (materials) => {
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return "Должен быть указан хотя бы один материал";
    }

    const errors = [];

    materials.forEach((material, index) => {
      const materialErrors = {};

      if (!material.material_id && !material.material_name) {
        materialErrors.material =
          "Необходимо указать материал или его название";
      }

      if (!material.quantity || isNaN(material.quantity)) {
        materialErrors.quantity = "Количество материала должно быть числом";
      } else if (material.quantity <= 0) {
        materialErrors.quantity =
          "Количество материала должно быть положительным";
      }

      if (!material.cost_per_unit || isNaN(material.cost_per_unit)) {
        materialErrors.cost_per_unit = "Стоимость единицы должна быть числом";
      } else if (material.cost_per_unit <= 0) {
        materialErrors.cost_per_unit =
          "Стоимость единицы должна быть положительной";
      }

      if (Object.keys(materialErrors).length > 0) {
        errors.push({
          index,
          errors: materialErrors,
        });
      }
    });

    return errors.length > 0 ? errors : null;
  },
};

module.exports = validate;
