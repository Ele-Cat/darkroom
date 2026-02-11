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
let animationFrameId = null

// 缓动系数（0-1之间，值越大跟随越快）
const easingFactor = 0.15

// 更新鼠标位置
const updateMousePosition = (e) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// 平滑动画
const animate = () => {
  // 使用缓动函数计算新的位置
  displayMouseX.value += (mouseX.value - displayMouseX.value) * easingFactor
  displayMouseY.value += (mouseY.value - displayMouseY.value) * easingFactor
  
  // 继续下一帧
  animationFrameId = requestAnimationFrame(animate)
}

// 初始化
onMounted(() => {
  // 添加鼠标移动事件监听
  window.addEventListener('mousemove', updateMousePosition)
  
  // 启动动画循环
  animationFrameId = requestAnimationFrame(animate)
})

// 清理
onUnmounted(() => {
  // 清理鼠标移动事件监听
  window.removeEventListener('mousemove', updateMousePosition)
  
  // 清理动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
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
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.05);
}

body.light-mode .mouse-follower {
  border-color: rgba(0, 0, 0, 0.08);
  background-color: rgba(0, 0, 0, 0.02);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
}
</style>
