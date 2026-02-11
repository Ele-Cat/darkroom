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
      
      <!-- 石斧按钮 -->
      <TooltipButton 
        v-if="gameStore.workshopUnlocked"
        button-id="unlockStoneAxe"
        button-text="石斧"
        :tooltip-text="getStoneAxeTooltip()"
        :disabled="gameStore.stoneAxeUnlocked"
        @button-click="unlockStoneAxe"
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

const unlockStoneAxe = () => {
  gameStore.unlockStoneAxe()
}

const unlockCart = () => {
  gameStore.unlockCart()
}

const getStoneAxeTooltip = () => {
  return `木材 ${defaultSettings.crafting.tools.find(tool => tool.id === 'stoneAxe').woodCost}, 石头 ${defaultSettings.crafting.tools.find(tool => tool.id === 'stoneAxe').stoneCost}`
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