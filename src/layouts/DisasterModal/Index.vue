<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <h3 class="modal-title">{{ disasterTitle }}</h3>
      <div class="modal-body">
        <p>{{ disasterMessage }}</p>
      </div>
      <div class="modal-footer">
        <button class="basic-button confirm-button" @click="handleConfirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, inject } from 'vue'
import eventBus from '@/utils/eventBus'

// 从父组件注入依赖
const titleManager = inject('titleManager')

// 组件内部状态
const isVisible = ref(false)
const disasterType = ref('')
const disasterData = ref({})

const disasterTitle = computed(() => {
  switch (disasterType.value) {
    case 'fire':
      return '🔥 火灾警报'
    case 'hunterRage':
      return '🐺 猎物狂暴'
    default:
      return '⚠️ 天灾警报'
  }
})

const disasterMessage = computed(() => {
  switch (disasterType.value) {
    case 'fire':
      return `村落发生火灾！烧掉了 ${disasterData.value.hutsBurned || 0} 个小屋，${disasterData.value.peopleLost || 0} 人不幸遇难。`
    case 'hunterRage':
      return `猎物突然狂暴！${disasterData.value.peopleLost || 0} 名猎人在狩猎过程中遭遇不幸。`
    default:
      return '村落遭遇天灾，请做好应对准备！'
  }
})

// 处理灾难确认
const handleConfirm = () => {
  // 恢复原始标题
  titleManager.restoreOriginalTitle()
  
  // 触发灾难确认事件，让gameStore处理后续逻辑
  eventBus.emit('disasterConfirmed', {
    type: disasterType.value,
    data: disasterData.value
  })
  
  // 隐藏模态框
  isVisible.value = false
}

// 监听灾难事件，显示灾难模态框
const handleDisasterOccurred = (disaster) => {
  isVisible.value = true
  disasterType.value = disaster.type
  disasterData.value = disaster.data
  
  // 检查页面是否可见
  if (!titleManager.isPageVisible()) {
    titleManager.startTitleSwitch()
  }
}

// 监听页面可见性变化
const handleVisibilityChange = () => {
  if (isVisible.value) {
    if (titleManager.isPageVisible()) {
      // 页面变为可见，停止标题切换
      titleManager.restoreOriginalTitle()
    } else {
      // 页面变为不可见，开始标题切换
      titleManager.startTitleSwitch()
    }
  }
}

// 组件挂载时添加事件监听器
onMounted(() => {
  // 监听灾难事件
  eventBus.on('disasterOccurred', handleDisasterOccurred)
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
  // 移除灾难事件监听器
  eventBus.off('disasterOccurred', handleDisasterOccurred)
  
  // 移除页面可见性变化监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  color: #ff6b6b;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  text-align: center;
}

.modal-body {
  margin-bottom: 20px;
  color: #f5f5f5;
  line-height: 1.5;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.confirm-button {
  background-color: #4a4a4a;
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.confirm-button:hover {
  background-color: #5a5a5a;
  border-color: rgba(255, 255, 255, 0.3);
}

/* 亮色模式 */
:global(body.light-mode) .modal-content {
  background-color: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.2);
}

:global(body.light-mode) .modal-title {
  color: #d32f2f;
}

:global(body.light-mode) .modal-body {
  color: #333;
}

:global(body.light-mode) .confirm-button {
  background-color: #e0e0e0;
  color: #333;
  border-color: rgba(0, 0, 0, 0.3);
}

:global(body.light-mode) .confirm-button:hover {
  background-color: #f0f0f0;
}
</style>
