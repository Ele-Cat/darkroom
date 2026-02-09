import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.less'
import App from './App.vue'
import BasicButton from './components/BasicButton.vue'

// 设置应用标题
document.title = import.meta.env.VITE_APP_TITLE || 'Dark Room'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
// 注册全局组件
app.component('BasicButton', BasicButton)

// 暴露gameStore到全局，方便ControlContainer组件访问
import { useGameStore } from './stores/gameStore'
window.gameStore = useGameStore()

app.mount('#app')