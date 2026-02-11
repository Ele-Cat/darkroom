<template>
  <button
    :id="buttonId"
    :class="[
      'control-button',
      buttonClass,
      { 'active': isActive }
    ]"
    @click="handleClick"
    :title="title"
    :disabled="disabled"
  >
    {{ icon }}
  </button>
</template>

<script setup>

const props = defineProps({
  // 按钮ID
  buttonId: {
    type: String,
    required: true
  },
  // 按钮类名（用于特定样式）
  buttonClass: {
    type: String,
    default: ''
  },
  // 按钮图标
  icon: {
    type: String,
    required: true
  },
  // 按钮标题
  title: {
    type: String,
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否激活状态
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<style scoped lang="less">
@import "@/styles/variable.less";

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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;

    &:hover {
      background-color: #333;
      transform: none;
    }
  }

  &.active {
    background-color: #4CAF50;
    color: #fff;
    border-color: #4CAF50;

    &:hover {
      background-color: #45a049;
      box-shadow: 0 0 6px rgba(76, 175, 80, 0.7);
    }
  }

  /* 一键重置游戏按钮 */
  &.reset-game-toggle {
    &:hover {
      color: #ff6666;
      border-color: #ff6666;
      box-shadow: 0 0 6px rgba(255, 102, 102, 0.5);
    }
  }

  /* 导入导出控制按钮 */
  &.import-export-toggle {
    &:hover {
      color: @primary-color;
      border-color: @primary-color;
      box-shadow: 0 0 6px rgba(212, 175, 55, 0.5);
    }
  }

  /* 暗黑模式切换按钮 */
  &.dark-mode-toggle {
    &:hover {
      color: @primary-color;
      border-color: @primary-color;
      box-shadow: 0 0 6px rgba(212, 175, 55, 0.5);
    }
  }
  
  /* 手动触发天灾按钮 */
  &.trigger-disaster-toggle {
    &:hover {
      color: #ff9900;
      border-color: #ff9900;
      box-shadow: 0 0 6px rgba(255, 153, 0, 0.5);
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

    &:disabled {
      &:hover {
        background-color: #e0e0e0;
      }
    }

    &.active {
      background-color: #4CAF50;
      color: #fff;
      border-color: #4CAF50;

      &:hover {
        background-color: #45a049;
        box-shadow: 0 0 6px rgba(76, 175, 80, 0.5);
      }
    }

    /* 一键重置游戏按钮 */
    &.reset-game-toggle {
      &:hover {
        color: #ff6666;
        border-color: #ff6666;
        box-shadow: 0 0 6px rgba(255, 102, 102, 0.3);
      }
    }

    /* 导入导出控制按钮 */
    &.import-export-toggle {
      &:hover {
        color: @light-primary-color;
        border-color: @light-primary-hover-color;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
      }
    }

    /* 暗黑模式切换按钮 */
    &.dark-mode-toggle {
      &:hover {
        color: @light-primary-color;
        border-color: @light-primary-hover-color;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
      }
    }
    
    /* 手动触发天灾按钮 */
    &.trigger-disaster-toggle {
      &:hover {
        color: #ff9900;
        border-color: #ff9900;
        box-shadow: 0 0 6px rgba(255, 153, 0, 0.5);
      }
    }
  }
}
</style>