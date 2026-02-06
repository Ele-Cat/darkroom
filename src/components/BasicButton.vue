<template>
  <button
    :id="buttonId"
    :class="[className, { 'close-modal': isCloseButton }]"
    @click="handleClick"
    :disabled="disabled"
    :style="customStyle"
  >
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  buttonId: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },
  isCloseButton: {
    type: Boolean,
    default: false
  },
  customStyle: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['button-click'])

const handleClick = () => {
  if (!props.disabled) {
    emit('button-click')
  }
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

button {
  display: block;
  width: 100%;
  max-width: 120px;
  height: 32px;
  padding: 0 10px;
  margin: 0;
  background-color: transparent;
  color: @text-color;
  border: 1px solid @text-color;
  border-radius: 3px;
  cursor: pointer;
  font-family: monospace;
  font-size: 12px;
  transition: all 0.3s ease;
  line-height: 32px;
  text-align: center;
  box-sizing: border-box;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &:hover:not(:disabled) {
    background-color: @bg-light-color;
    box-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
}

/* 关闭按钮样式 */
.close-modal {
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  max-width: none;
  line-height: 1;
  
  &:hover {
    color: #fff;
    background-color: transparent;
    box-shadow: none;
  }
}

/* 模态框按钮样式 */
.modal-actions-button {
  flex: 1;
  padding: 12px 16px;
  background-color: #333;
  border: 1px solid #555;
  color: #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  line-height: 1.2;
  text-align: center;
  max-width: none;
  height: auto;
  
  &:hover:not(:disabled) {
    background-color: #444;
    border-color: @primary-color;
    color: @primary-color;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

/* 亮色模式样式 */
body.light-mode {
  button {
    background-color: transparent;
    color: @light-text-color;
    border-color: #999;
    
    &:hover:not(:disabled) {
      background-color: @light-bg-light-color;
    }
  }
  
  .close-modal {
    color: #999;
    
    &:hover {
      color: @light-text-color;
      background-color: transparent;
    }
  }
  
  .modal-actions-button {
    background-color: #e0e0e0;
    border-color: #ccc;
    color: #555;
    
    &:hover:not(:disabled) {
      background-color: #d0d0d0;
      border-color: #999;
      color: @light-text-color;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>