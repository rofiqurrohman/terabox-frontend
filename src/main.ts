import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vue-sonner/style.css'
import '@/styles/tailwind.css'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
