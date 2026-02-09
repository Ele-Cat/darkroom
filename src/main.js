import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.less'
import App from './App.vue'
import BasicButton from './components/BasicButton.vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
// 注册全局组件
app.component('BasicButton', BasicButton)
app.mount('#app')