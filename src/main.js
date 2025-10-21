import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Import your router
import './assets/main.css'   // Import your global styles

const app = createApp(App)

app.use(router) // Tell Vue to use the router

app.mount('#app')