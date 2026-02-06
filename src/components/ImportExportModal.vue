<template>
  <div id="importExportModal" class="modal" :class="{ show: isVisible }">
    <div class="modal-content">
      <div class="modal-header">
        <h3>游戏导入导出</h3>
        <BasicButton id="closeModal" class="close-modal" is-close-button @button-click="closeModal">×</BasicButton>
      </div>
      <div class="modal-body">
        <p>此功能可以导出游戏或导入已保存的游戏，<a href="https://base64.us/" target="_blank">在线工具</a>。</p>
        <div class="modal-actions">
          <div class="button-with-tooltip">
            <BasicButton id="exportGameModal" class="modal-actions-button" @button-click="exportGame" @mouseenter="showExportTooltip = true" @mouseleave="showExportTooltip = false">导出游戏</BasicButton>
            <div class="tooltip" v-if="showExportTooltip">
              <div class="tooltip-content">
                <div class="tooltip-title">导出游戏</div>
                <div class="tooltip-text">将当前游戏状态导出为Base64编码字符串，可保存到本地或分享给其他玩家</div>
              </div>
            </div>
          </div>
          <div class="button-with-tooltip">
            <BasicButton id="importGameModal" class="modal-actions-button" @button-click="importGame" @mouseenter="showImportTooltip = true" @mouseleave="showImportTooltip = false">导入游戏</BasicButton>
            <div class="tooltip" v-if="showImportTooltip">
              <div class="tooltip-content">
                <div class="tooltip-title">导入游戏</div>
                <div class="tooltip-text">粘贴之前导出的Base64编码字符串来恢复游戏进度，注意：导入会覆盖当前进度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isVisible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'export-game', 'import-game'])

const showExportTooltip = ref(false)
const showImportTooltip = ref(false)

const closeModal = () => {
  emit('close')
}

const exportGame = () => {
  emit('export-game')
  emit('close')
}

const importGame = () => {
  emit('import-game')
  emit('close')
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.modal {
  display: none;
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  
  &.show {
    display: block;
    animation: fadeIn 0.3s ease;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: #2a2a2a;
  margin: 15% auto;
  padding: 25px;
  border: 1px solid #666;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #444;
  
  h3 {
    margin: 0;
    color: @text-color;
    font-size: 18px;
    font-weight: normal;
  }
}

.modal-body {
  color: #ccc;
  line-height: 1.5;
}

.modal-actions {
  margin-top: 25px;
  display: flex;
  gap: 12px;
}

.button-with-tooltip {
  position: relative;
  display: block;
  flex: 1;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  width: 200px;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.9);
  color: @text-color;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
  }
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-title {
  font-weight: bold;
  color: @text-color;
  margin-bottom: 2px;
}

.tooltip-text {
  color: #ccc;
  line-height: 1.4;
}

/* 亮色模式样式 */
body.light-mode {
  .modal-content {
    background-color: #f5f5f5;
    border-color: #ddd;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    border-bottom-color: #ddd;
    
    h3 {
      color: @light-text-color;
    }
  }
  
  .modal-body {
    color: #555;
  }

  .tooltip {
    background-color: rgba(255, 255, 255, 0.95);
    color: @light-text-color;
    border: 1px solid #999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    &::after {
      border-color: rgba(255, 255, 255, 0.95) transparent transparent transparent;
    }
  }

  .tooltip-title {
    color: @light-text-color;
  }

  .tooltip-text {
    color: #666;
  }
}
</style>