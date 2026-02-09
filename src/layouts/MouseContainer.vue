<template>
  <div 
    class="mouse-follower"
    :style="{
      left: displayMouseX + 'px',
      top: displayMouseY + 'px'
    }"
  ></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 鼠标跟随光圈
const mouseX = ref(0)
const mouseY = ref(0)
const displayMouseX = ref(0)
const displayMouseY = ref(0)
let mouseUpdateTimeout = null

// 更新鼠标位置（带延时）
const updateMousePosition = (e) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
  
  // 清除之前的延时
  if (mouseUpdateTimeout) {
    clearTimeout(mouseUpdateTimeout)
  }
  
  // 设置新的延时（10ms）
  mouseUpdateTimeout = setTimeout(() => {
    displayMouseX.value = mouseX.value
    displayMouseY.value = mouseY.value
  }, 10)
}

// 初始化
onMounted(() => {
  // 添加鼠标移动事件监听
  window.addEventListener('mousemove', updateMousePosition)
})

// 清理
onUnmounted(() => {
  // 清理鼠标移动事件监听
  window.removeEventListener('mousemove', updateMousePosition)
  
  // 清理延时定时器
  if (mouseUpdateTimeout) {
    clearTimeout(mouseUpdateTimeout)
  }
})
</script>

<style scoped>
/* 鼠标跟随光圈 */
.mouse-follower {
  position: fixed;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.02);
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: left 0.1s ease-out, top 0.1s ease-out;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.05);
}

body.light-mode .mouse-follower {
  border-color: rgba(0, 0, 0, 0.08);
  background-color: rgba(0, 0, 0, 0.02);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
}
</style>
