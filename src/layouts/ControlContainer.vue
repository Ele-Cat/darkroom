<template>
  <div class="control-buttons">
    <!-- 一键重置游戏按钮 -->
    <button
      id="resetGameToggle"
      class="control-button reset-game-toggle"
      @click="resetGame"
      title="一键重置游戏"
    >
      🔄
    </button>

    <!-- 导入导出控制按钮 -->
    <button
      v-if="isDev"
      id="importExportToggle"
      class="control-button import-export-toggle"
      @click="openImportExport"
      title="导入导出"
    >
      📤
    </button>

    <!-- 暗黑模式切换按钮 -->
    <button
      id="darkModeToggle"
      class="control-button dark-mode-toggle"
      @click="toggleDarkMode"
      :title="darkMode ? '切换为亮色模式' : '切换为暗黑模式'"
    >
      {{ darkMode ? "🌙" : "☀️" }}
    </button>
    
    <!-- 手动触发天灾按钮（仅开发环境显示） -->
    <button
      v-if="isDev"
      id="triggerDisasterToggle"
      class="control-button trigger-disaster-toggle"
      @click="triggerDisaster"
      title="手动触发天灾"
    >
      ⚡
    </button>
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
import { inject, ref } from "vue";
import ImportExportModal from "@/components/ImportExportModal.vue";
const gameStore = inject('gameStore')

const props = defineProps({
  darkMode: {
    type: Boolean,
    required: true,
  },
  isDev: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["reset-game", "toggle-dark-mode"]);

const showImportExportModal = ref(false);

const resetGame = () => {
  emit("reset-game");
};

const openImportExport = () => {
  showImportExportModal.value = true;
};

const toggleDarkMode = () => {
  emit("toggle-dark-mode");
};

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
  gameStore.triggerFireDisaster();
  return
  // 随机选择触发火灾或猎物狂暴
  const disasterType = Math.random() > 0.5 ? 'fire' : 'hunterRage';
  if (disasterType === 'fire') {
    gameStore.triggerFireDisaster();
  } else if (gameStore.jobs.hunter > 0) {
    gameStore.triggerHunterRageDisaster();
  } else {
    // 如果没有猎人，默认触发火灾
    gameStore.triggerFireDisaster();
  }
};
</script>

<style scoped lang="less">
@import "@/styles/variable.less";

.control-buttons {
  position: fixed;
  bottom: 15px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  .control-button {
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

    /* 一键重置游戏按钮 */
    &.reset-game-toggle {
      &:hover {
        color: #ff6666;
        border-color: #ff6666;
        box-shadow: 0 0 6px rgba(255, 102, 102, 0.5);
      }
    }

    &.import-export-toggle,
    &.dark-mode-toggle {
      &:hover {
        color: @primary-color;
        border-color: @primary-color;
        box-shadow: 0 0 6px rgba(212, 175, 55, 0.5);
      }
    }
    
    &.trigger-disaster-toggle {
      &:hover {
        color: #ff9900;
        border-color: #ff9900;
        box-shadow: 0 0 6px rgba(255, 153, 0, 0.5);
      }
    }
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

  .import-export-toggle,
  .dark-mode-toggle {
    &:hover {
      color: @light-primary-color;
      border-color: @light-primary-hover-color;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
    }
  }
  
  .trigger-disaster-toggle {
    &:hover {
      color: #ff9900;
      border-color: #ff9900;
      box-shadow: 0 0 6px rgba(255, 153, 0, 0.5);
    }
  }
}
</style>