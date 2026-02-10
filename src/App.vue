<template>
  <div class="container">
    <LogsContainer :logs="gameStore.logs" />
    
    <div class="main-content">
      <TabContainer 
        :active-tab="activeTab"
        :can-show-explore-tab="gameStore.canShowExploreTab"
        :can-show-village-tab="true"
        @switch-tab="switchTab"
      />

      <HomeContainer />
    </div>
    
    <MouseContainer />
  </div>
  

  
  <ControlContainer 
    :dark-mode="gameStore.darkMode"
    :is-dev="isDev"
    @reset-game="gameStore.resetGame"
    @toggle-dark-mode="toggleDarkMode"
  />
  
  <DisasterModal 
    :is-visible="showDisasterModal"
    :disaster-type="currentDisasterType"
    :disaster-data="currentDisasterData"
    @confirm="handleDisasterConfirm"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, provide } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import eventBus from '@/utils/eventBus'
import LogsContainer from '@/layouts/LogsContainer.vue'
import TabContainer from '@/layouts/TabContainer.vue'
import HomeContainer from '@/layouts/HomeContainer.vue'
import MouseContainer from '@/layouts/MouseContainer.vue'
import DisasterModal from '@/components/DisasterModal.vue'
import ControlContainer from '@/layouts/ControlContainer.vue'

// 检查是否为开发环境
const isDev = import.meta.env.VITE_APP_ENV === 'development'

const gameStore = useGameStore()
// 提供gameStore给所有子组件
provide('gameStore', gameStore)
const activeTab = ref('cabin')
provide('activeTab', activeTab)
const showDisasterModal = ref(false)
const currentDisasterType = ref('')
const currentDisasterData = ref({})
let gameLoopInterval = null

// 更新浏览器标题
const updateBrowserTitle = (tab) => {
  const baseTitle = 'A dark room'
  switch (tab) {
    case 'cabin':
      document.title = `${gameStore.fireLit ? '林中小屋' : '废弃小屋'} - ${baseTitle}`
      break
    case 'village':
      document.title = `${gameStore.getVillageName()} - ${baseTitle}`
      break
    case 'explore':
      document.title = `探索 - ${baseTitle}`
      break
    default:
      document.title = baseTitle
  }
}

// 切换tab
const switchTab = (tab) => {
  if (tab === 'village' && !gameStore.villageUnlocked) {
    if (gameStore.canUnlockVillage) {
      gameStore.unlockVillage()
      activeTab.value = tab
      updateBrowserTitle(tab)
    } else {
      gameStore.addLog(`资源不足，需要10木材和10石头才能解锁村落`, 2)
    }
  } else {
    activeTab.value = tab
    updateBrowserTitle(tab)
  }
}

// 切换暗黑模式
const toggleDarkMode = () => {
  gameStore.toggleDarkMode()
  updateDarkModeClass()
}

// 处理灾难模态框确认
const handleDisasterConfirm = () => {
  showDisasterModal.value = false
  
  // 触发灾难确认事件，让gameStore处理后续逻辑
  eventBus.emit('disasterConfirmed', {
    type: currentDisasterType.value,
    data: currentDisasterData.value
  })
}

// 监听灾难事件，显示灾难模态框
eventBus.on('disasterOccurred', (disaster) => {
  showDisasterModal.value = true
  currentDisasterType.value = disaster.type
  currentDisasterData.value = disaster.data
})

// 监听灾难确认事件，处理后续逻辑
eventBus.on('disasterConfirmed', (disaster) => {
  gameStore.handleDisasterConfirm(disaster)
})

// 更新暗黑模式类
const updateDarkModeClass = () => {
  if (gameStore.darkMode) {
    document.body.classList.remove('light-mode')
  } else {
    document.body.classList.add('light-mode')
  }
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
  
  // 更新暗黑模式
  updateDarkModeClass()
  
  // 初始化浏览器标题
  updateBrowserTitle(activeTab.value)
  
  // 启动游戏循环
  gameLoopInterval = setTimeout(gameLoop, 10)
  
  // 初始化任务进场话术
  if (!gameStore.fireLit) {
    gameStore.addLog('🎯 任务：点燃火堆')
    gameStore.addLog('寒冷的夜晚即将来临，你需要收集木材并点燃火堆来取暖。')
    gameStore.addLog('提示：点击\'收集木材\'按钮获取木材，然后点击\'点燃火堆\'按钮生火。')
  }
  
  // 监听新村民到来事件，切换到村落tab
  eventBus.on('newVillagersArrived', () => {
    if (activeTab.value !== 'village' && gameStore.villageUnlocked) {
      switchTab('village')
    }
  })
})

// 清理
onUnmounted(() => {
  if (gameLoopInterval) {
    clearTimeout(gameLoopInterval)
  }
})

// 监听暗黑模式变化
watch(() => gameStore.darkMode, () => {
  updateDarkModeClass()
})

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
