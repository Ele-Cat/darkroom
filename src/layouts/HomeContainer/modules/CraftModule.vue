<template>
  <div class="craft-module">
    <div class="craft-section">
      <p class="build-type">制造：</p>
      <!-- 货车按钮 -->
      <TooltipButton 
        button-id="unlockCart"
        button-text="货车"
        :tooltip-text="getCartTooltip()"
        :disabled="gameStore.cartUnlocked"
        @button-click="unlockCart"
      />
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import TooltipButton from '@/components/TooltipButton.vue'
import defaultSettings from '@/config/defaultSettings'

// 接收gameStore实例
const gameStore = inject('gameStore')

const unlockCart = () => {
  gameStore.unlockCart()
}

const getCartTooltip = () => {
  return `木材 ${defaultSettings.building.cart.woodCost}`
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.craft-module {
  width: 120px;
}

.craft-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.build-type {
  height: 32px;
  line-height: 32px;
  margin: 0;
  font-weight: bold;
  color: @text-color;
}
</style>