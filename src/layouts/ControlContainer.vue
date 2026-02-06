<template>
  <!-- 一键重置游戏按钮 -->
  <button id="resetGameToggle" class="control-button reset-game-toggle" @click="resetGame" title="一键重置游戏">
    🔄
  </button>
  
  <!-- 导入导出控制按钮 -->
  <button id="importExportToggle" class="control-button import-export-toggle" @click="openImportExport" title="导入导出">
    📤
  </button>
  
  <!-- 暗黑模式切换按钮 -->
  <button id="darkModeToggle" class="control-button dark-mode-toggle" @click="toggleDarkMode" :title="darkMode ? '切换为亮色模式' : '切换为暗黑模式'">
    {{ darkMode ? '🌙' : '☀️' }}
  </button>
</template>

<script setup>
defineProps({
  darkMode: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['reset-game', 'open-import-export', 'toggle-dark-mode'])

const resetGame = () => {
  emit('reset-game')
}

const openImportExport = () => {
  emit('open-import-export')
}

const toggleDarkMode = () => {
  emit('toggle-dark-mode')
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

// 控制按钮共用样式
.control-button {
  position: fixed;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #333;
  border: 1px solid #555;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #444;
    transform: scale(1.05);
  }
}

/* 一键重置游戏按钮 */
.reset-game-toggle {
  bottom: 15px;
  right: 107px;
  
  &:hover {
    color: #ff6666;
    border-color: #ff6666;
    box-shadow: 0 0 6px rgba(255, 102, 102, 0.5);
  }
}

/* 导入导出控制按钮 */
.import-export-toggle {
  bottom: 15px;
  right: 61px;
}

/* 暗黑模式切换按钮 */
.dark-mode-toggle {
  bottom: 15px;
  right: 15px;
}

.import-export-toggle, .dark-mode-toggle {
  &:hover {
    color: @primary-color;
    border-color: @primary-color;
    box-shadow: 0 0 6px rgba(212, 175, 55, 0.5);
  }
}

/* 亮色模式样式 */
body.light-mode {
  .control-button {
    background-color: #e0e0e0;
    color: #999;
    border-color: #ccc;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);

    &:hover {
      background-color: #f0f0f0;
    }
  }
  
  .reset-game-toggle {
    &:hover {
      color: #ff6666;
      border-color: #ff6666;
      box-shadow: 0 0 6px rgba(255, 102, 102, 0.3);
    }
  }
  
  .import-export-toggle, .dark-mode-toggle {
    &:hover {
      color: @light-primary-color;
      border-color: @light-primary-hover-color;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>