import { createApp } from 'vue'
import './assets/index.css'
import App from './App.vue'
import router from './router'
import GuidePlugin from './guide'

createApp(App).use(router).use(GuidePlugin).mount('#app')
