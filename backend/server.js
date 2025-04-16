const initializeSuperAdmin = require("./init");
const app = require("./app");
const port = 3000;
require("dotenv").config();

app.listen(port, async () => {
  await initializeSuperAdmin(); // Добавьте эту строку
  console.log(`Server is running on port ${port}`);
});
