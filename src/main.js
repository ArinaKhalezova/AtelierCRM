import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./stores";
import "@/assets/styles/global.css"; 

createApp(App).use(router).use(store).mount("#app");
