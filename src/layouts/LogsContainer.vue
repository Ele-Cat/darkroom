<template>
  <div class="logs">
    <div class="log-content" id="logContent" ref="logContentRef">
      <transition-group name="log" tag="div">
        <div 
          v-for="log in logs" 
          :key="log.id"
          class="log-item"
          :class="{
            'log-main': log.type === 1,
            'log-warning': log.type === 2
          }"
        >
          {{ log.message }}
        </div>
      </transition-group>
    </div>
    <div class="log-mask"></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  logs: {
    type: Array,
    required: true
  }
})

const logContentRef = ref(null)

// 监听logs变化，当有新log时滚动到顶部
watch(() => props.logs.length, (newLength, oldLength) => {
  if (newLength > oldLength && logContentRef.value) {
    logContentRef.value.scrollTop = 0
  }
})
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.logs {
  flex-shrink: 0;
  width: 240px;
  height: 80vh;
  background-color: #333;
  border-radius: 5px;
  padding: 15px 10px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.log-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 0;
    transition: width 0.3s ease;
  }
  
  // &:hover::-webkit-scrollbar,
  // &:focus::-webkit-scrollbar {
  //   width: 5px;
  // }
  
  &::-webkit-scrollbar-track {
    background: #444;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: @text-color;
    border-radius: 3px;
  }
}

.log-item {
  margin: 2px 0;
  padding: 2px 5px;
  border-radius: 3px;
  line-height: 1.1;
}

/* 日志类型样式 */
.log-main {
  color: #4CAF50; /* 绿色 - 主线日志 */
  font-weight: 500;
}

.log-warning {
  color: #f44336; /* 红色 - 警示提醒 */
  font-weight: 500;
}

/* 日志过渡效果 */
.log-enter-active,
.log-leave-active {
  transition: all 0.5s ease-in-out;
}

.log-enter-from {
  opacity: 0.2;
  transform: translateY(-3px) scale(0.95);
}

.log-leave-to {
  opacity: 0.2;
  transform: translateY(3px) scale(0.95);
}

.log-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(to top, #1a1a1a 20%, rgba(51, 51, 51, 0.3) 80%, transparent 100%);
  pointer-events: none;
  z-index: 1;
  border-radius: 0 0 5px 5px;
}

.log-content {
  position: relative;
  z-index: 0;
}

/* 亮色模式样式 */
body.light-mode {
  .logs {
    background-color: #e0e0e0;
    color: @light-text-color;
    border-color: #999;
  }
  
  .log-content {
    &::-webkit-scrollbar {
      width: 0;
    }
    
    &:hover::-webkit-scrollbar,
    &:focus::-webkit-scrollbar {
      width: 5px;
    }
    
    &::-webkit-scrollbar-track {
      background: #e0e0e0;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #999;
      border-radius: 3px;
    }
  }
  
  .log-mask {
    background: linear-gradient(to top, #e0e0e0 20%, rgba(224, 224, 224, 0.3) 80%, transparent 100%);
  }

  /* 亮色模式下的日志类型样式 */
  .log-main {
    color: #2E7D32; /* 深绿色 - 主线日志 */
  }

  .log-warning {
    color: #C62828; /* 深红色 - 警示提醒 */
  }
}
</style>