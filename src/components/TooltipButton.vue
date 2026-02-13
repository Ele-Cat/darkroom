<template>
  <div class="tooltip-button-container">
    <BasicButton
      :buttonId="buttonId"
      :disabled="disabled"
      :className="buttonClass"
      :count="count"
      @button-click="handleClick"
      @mouseenter="!disabled && (showTooltip = true)"
      @mouseleave="showTooltip = false"
    >
      {{ buttonText }}
    </BasicButton>
    <div class="tooltip" v-if="!disabled && tooltipText && showTooltip">
      <div class="tooltip-content">
        <div class="material-item" v-for="(material, index) in getMaterials()" :key="index">
          <span class="material-name">{{ material.name }}</span>
          <span class="material-count">{{ material.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  buttonId: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    required: true
  },
  buttonClass: {
    type: String,
    default: ''
  },
  tooltipText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  count: {
    type: [Number, String],
    default: undefined
  }
})

const emit = defineEmits(['button-click'])

const showTooltip = ref(false)

const handleClick = () => {
  emit('button-click')
}

const getMaterials = () => {
  if (!props.tooltipText) return []
  const materials = []
  // 分割多个物料，支持逗号分隔
  const materialStrings = props.tooltipText.split(', ')
  materialStrings.forEach(materialString => {
    // 分割物料名称和数量
    const parts = materialString.split(' ')
    if (parts.length >= 2) {
      materials.push({
        name: parts[0],
        count: parts.slice(1).join(' ')
      })
    }
  })
  return materials
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

/* 按钮容器，用于容纳按钮和提示 */
.tooltip-button-container {
  position: relative;
  display: block;
  width: 100%;
  max-width: 120px;
  height: 32px;
  margin: 0;

  :deep(button) {
    position: relative;
    z-index: 2;
    width: 100%;
    margin: 0;
    display: block;
    height: 32px;
  }

  .tooltip {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    width: 100%;
    max-width: 120px;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.9);
    color: @text-color;
    border-radius: 3px;
    font-size: 12px;
    z-index: 10;
    pointer-events: none;
    box-sizing: border-box;

    &::after {
      content: '';
      position: absolute;
      bottom: 100%;
      right: 10px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent rgba(0, 0, 0, 0.6) transparent;
    }
  }

  .tooltip-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .material-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .material-name {
    flex: 1;
    text-align: left;
  }

  .material-count {
    flex: 1;
    text-align: right;
  }
}

/* 亮色模式样式 */
body.light-mode {
  .tooltip-button-container {
    .tooltip {
      background-color: rgba(255, 255, 255, 0.6);
      color: @light-text-color;
      border: 1px solid #999;
      width: 100%;
      max-width: 120px;
      box-sizing: border-box;
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;

      &::after {
        content: '';
        position: absolute;
        bottom: 100%;
        right: 10px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent rgba(255, 255, 255, 0.6) transparent;
      }
    }

    .material-name {
      color: @light-text-color;
    }

    .material-count {
      color: @light-text-color;
    }
  }
}
</style>