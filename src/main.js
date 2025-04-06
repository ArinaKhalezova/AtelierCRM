import { createApp } from "vue";
import App from "./App.vue";
import store from "./stores/back";
import router, { setupRouter } from "./router";
import "@/assets/styles/global.css";
import "@/assets/main.css";

const app = createApp(App);
app.use(store);
const initializedRouter = setupRouter(app, store);
app.use(initializedRouter);
app.mount("#app");
