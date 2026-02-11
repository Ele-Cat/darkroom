<template>
  <div class="control-buttons">
    <!-- 音频模块 -->
    <AudioModule />
    
    <!-- 手动触发天灾按钮（仅开发环境显示） -->
    <ControlButton
      v-if="isDev"
      buttonId="triggerDisasterToggle"
      buttonClass="trigger-disaster-toggle"
      icon="⚡"
      title="手动触发天灾"
      @click="triggerDisaster"
    />
    
    <!-- 一键重置游戏按钮 -->
    <ControlButton
      buttonId="resetGameToggle"
      buttonClass="reset-game-toggle"
      icon="🔄"
      title="一键重置游戏"
      @click="resetGame"
    />

    <!-- 导入导出控制按钮 -->
    <ControlButton
      buttonId="importExportToggle"
      buttonClass="import-export-toggle"
      icon="📤"
      title="导入导出"
      @click="openImportExport"
    />

    <!-- 暗黑模式切换按钮 -->
    <ControlButton
      buttonId="darkModeToggle"
      buttonClass="dark-mode-toggle"
      :icon="gameStore.darkMode ? '🌙' : '☀️'"
      :title="gameStore.darkMode ? '切换为亮色模式' : '切换为暗黑模式'"
      @click="toggleDarkMode"
    />
  </div>

  <!-- 导入导出模态框 -->
  <ImportExportModal
    v-if="isDev"
    :is-visible="showImportExportModal"
    @close="showImportExportModal = false"
    @export-game="handleExportGame"
    @import-game="handleImportGame"
  />
</template>

<script setup>
import { inject, ref, watch } from "vue";
import ImportExportModal from "@/components/ImportExportModal.vue";
import AudioModule from "./modules/AudioModule.vue";
import ControlButton from "@/components/ControlButton.vue";

const gameStore = inject('gameStore')

// 检查是否为开发环境
const isDev = import.meta.env.VITE_APP_ENV === 'development'

const showImportExportModal = ref(false);

// 重置游戏
const resetGame = () => {
  gameStore.resetGame()
};

// 打开导入导出模态框
const openImportExport = () => {
  showImportExportModal.value = true;
};

// 切换暗黑模式
const toggleDarkMode = () => {
  gameStore.toggleDarkMode()
  updateDarkModeClass()
};

// 更新暗黑模式类
const updateDarkModeClass = () => {
  if (gameStore.darkMode) {
    document.body.classList.remove('light-mode')
  } else {
    document.body.classList.add('light-mode')
  }
};

watch(() => gameStore.darkMode, (newDarkMode) => {
  if (newDarkMode) {
    document.body.classList.remove('light-mode')
  } else {
    document.body.classList.add('light-mode')
  }
})

// 处理导出游戏
const handleExportGame = () => {
  gameStore.exportGame();
};

// 处理导入游戏
const handleImportGame = () => {
  gameStore.importGame()
};

// 手动触发天灾
const triggerDisaster = () => {
  // 随机选择触发火灾或猎物狂暴
  const disasterType = Math.random() > 0.5 ? 'fire' : 'hunterRage';
  if (disasterType === 'hunterRage' && gameStore.jobs.hunter > 0) {
    gameStore.triggerHunterRageDisaster();
  } else {
    gameStore.triggerFireDisaster();
  }
};
</script>

<style scoped lang="less">
.control-buttons {
  position: fixed;
  bottom: 15px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
