<template>
  <div class="button-container">
    <BasicButton
      :buttonId="buttonId"
      :disabled="props.cooldown > 0 || props.disabled"
      @button-click="handleClick"
    >
      {{ buttonText }}
    </BasicButton>
    <div 
      v-if="props.cooldown > 0"
      class="cooldown-bar" 
      :id="cooldownBarId"
      :style="{ transform: `scaleX(${displayProgress})` }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  buttonId: {
    type: String,
    required: true
  },
  cooldownBarId: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    required: true
  },
  cooldown: {
    type: Number,
    required: true
  },
  maxCooldown: {
    type: Number,
    default: 2
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['button-click'])

const displayProgress = computed(() => {
  return props.cooldown / props.maxCooldown
})

const handleClick = () => {
  emit('button-click')
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

/* 按钮容器，用于容纳按钮和冷却进度条 */
.button-container {
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
}

/* 冷却进度条 */
.cooldown-bar {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(255, 102, 102, 0.3);
  border-radius: 3px;
  z-index: 1;
  transform-origin: right center;
  transition: transform 0.1s linear;
}

/* 亮色模式样式 */
body.light-mode {
  .button-container {
    :deep(.cooldown-bar) {
      background-color: rgba(255, 102, 102, 0.2);
    }
  }
}
</style>