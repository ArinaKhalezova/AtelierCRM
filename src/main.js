import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./stores/back";
import "@/assets/styles/global.css";

const app = createApp(App);
app.use(store);
app.use(router);
app.mount("#app");
