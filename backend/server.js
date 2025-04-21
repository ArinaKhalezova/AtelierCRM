const initializeSuperAdmin = require("./init");
const app = require("./app");
const port = process.env.PORT || 3000;
require("dotenv").config();

async function startServer() {
  try {
    await initializeSuperAdmin();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
