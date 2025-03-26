const bcrypt = require("bcrypt");
const saltRounds = 10;

async function hashPassword() {
  const hash = await bcrypt.hash("parol", saltRounds);
  console.log("Хеш пароля:", hash);
}
hashPassword();
