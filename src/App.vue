<template>
  <div class="container">
    <LogsContainer />
    
    <div class="main-content">
      <TabContainer />

      <HomeContainer />
    </div>
    
    <MouseContainer />
  </div>
  
  <ControlContainer />
  
  <DisasterModal />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, provide } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import eventBus from '@/utils/eventBus'
import titleManager from '@/utils/titleManager'
import LogsContainer from '@/layouts/LogsContainer/Index.vue'
import TabContainer from '@/layouts/TabContainer/Index.vue'
import HomeContainer from '@/layouts/HomeContainer/Index.vue'
import MouseContainer from '@/layouts/MouseContainer/Index.vue'
import ControlContainer from '@/layouts/ControlContainer/Index.vue'
import DisasterModal from '@/layouts/DisasterModal/Index.vue'

const gameStore = useGameStore()
provide('gameStore', gameStore)
const activeTab = ref('cabin')
provide('activeTab', activeTab)
provide('titleManager', titleManager)
let gameLoopInterval = null

// 更新浏览器标题
const updateBrowserTitle = (tab) => {
  titleManager.updateBrowserTitle(tab, gameStore)
}

// 游戏循环
let lastTimestamp = Date.now()
const gameLoop = () => {
  const currentTimestamp = Date.now()
  
  // 计算实际经过的时间（毫秒）
  const elapsedTime = currentTimestamp - lastTimestamp
  
  // 每100毫秒执行一次游戏逻辑
  if (elapsedTime >= 100) {
    gameStore.updateCooldowns(elapsedTime)
    lastTimestamp = currentTimestamp
  }
  
  // 继续下一次循环
  gameLoopInterval = setTimeout(gameLoop, 10)
}

// 初始化
onMounted(() => {
  // 加载游戏状态
  gameStore.loadGameState()
  
  // 初始化标题管理器
  titleManager.init()
  
  // 初始化浏览器标题
  updateBrowserTitle(activeTab.value)
  
  // 启动游戏循环
  gameLoopInterval = setTimeout(gameLoop, 10)
  
  // 初始化任务进场话术
  !gameStore.fireLit && gameStore.initGameLog()
  
  // 监听新村民到来事件，切换到村落tab
  eventBus.on('newVillagersArrived', () => {
    if (activeTab.value !== 'village' && gameStore.villageUnlocked) {
      activeTab.value = 'village'
      updateBrowserTitle('village')
    }
  })
  
  // 监听灾难确认事件，处理后续逻辑
  eventBus.on('disasterConfirmed', (disaster) => {
    gameStore.handleDisasterConfirm(disaster)
  })
})

// 清理
onUnmounted(() => {
  if (gameLoopInterval) {
    clearTimeout(gameLoopInterval)
  }
  
  // 清理标题管理器
  titleManager.cleanup()
})

// 监听暗黑模式变化

// 监听activeTab变化，更新浏览器标题
watch(activeTab, (newTab) => {
  updateBrowserTitle(newTab)
})

// 监听影响标题的状态变化
watch(
  [() => gameStore.fireLit, () => gameStore.villageLevel],
  () => {
    updateBrowserTitle(activeTab.value)
  }
)
</script>
