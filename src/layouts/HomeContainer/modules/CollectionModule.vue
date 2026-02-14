<template>
  <div class="resource-collection">
    <TooltipButton 
      v-if="activeTab === 'cabin'"
      button-id="lightFire"
      :button-text="gameStore.buildings.fire > 0 ? '添柴' : '点燃火堆'"
      :button-class="getFireButtonClass()"
      tooltip-text="木材 1"
      @button-click="lightFire"
    />
    <CoolDownButton 
      button-id="collectWood"
      cooldown-bar-id="collectWoodCooldown"
      button-text="收集木材"
      :cooldown="gameStore.cooldowns.wood"
      :max-cooldown="defaultSettings.collection.wood.maxCooldown"
      @button-click="collectWood"
    />
    <CoolDownButton 
      v-if="gameStore.buildings.village >= 0"
      button-id="checkTraps"
      cooldown-bar-id="checkTrapsCooldown"
      button-text="查看陷阱"
      :cooldown="gameStore.cooldowns.trap"
      :max-cooldown="defaultSettings.building.trap.maxCheckCooldown"
      :disabled="gameStore.buildings.traps <= 0"
      @button-click="checkTraps"
    />
  </div>
</template>

<script setup>
import { inject } from 'vue'
import TooltipButton from '@/components/TooltipButton.vue'
import CoolDownButton from '@/components/CoolDownButton.vue'
import defaultSettings from '@/config/defaultSettings'

// 接收gameStore实例
const gameStore = inject('gameStore')
// 接收activeTab实例
const activeTab = inject('activeTab')

const lightFire = () => {
  gameStore.lightFire()
}

const collectWood = () => {
  gameStore.collectWood()
}

const checkTraps = () => {
  gameStore.checkTraps()
}

const getFireButtonClass = () => {
  return `fire-button fire-button-${gameStore.buildings.fire}`
}
</script>

<style scoped lang="less">
.resource-collection {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* 火堆按钮样式 */
:deep(button.fire-button) {
  position: relative;
  overflow: hidden;
  animation: backgroundPulse 2s ease-in-out infinite alternate;
}

:deep(button.fire-button-0)::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  transform: translateX(-50%);
  width: 10px;
  height: 5px;
  background: radial-gradient(ellipse at center, #4a4a4a 0%, #2a2a2a 100%);
  border-radius: 50%;
  opacity: 0.5;
}

:deep(button.fire-button-1), :deep(button.fire-button-1:not(:disabled):hover) {
  border-color: #8B4513;
  color: #CD853F;
  background-color: rgba(139, 69, 19, 0.15);
  box-shadow: inset 0 0 15px rgba(139, 69, 19, 0.5);
}

:deep(button.fire-button-1)::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  transform: translateX(-50%);
  width: 8px;
  height: 9px;
  background: radial-gradient(ellipse at bottom, #ff6b35 0%, #ff4500 50%, #8B0000 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  opacity: 0.6;
  animation: burn 5s ease-in-out infinite alternate;
}

:deep(button.fire-button-2), :deep(button.fire-button-2:not(:disabled):hover) {
  border-color: #CD853F;
  color: #FF8C00;
  background-color: rgba(205, 133, 63, 0.2);
  box-shadow: inset 0 0 15px rgba(205, 133, 63, 0.5);
}

:deep(button.fire-button-2)::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  transform: translateX(-50%);
  width: 10px;
  height: 12px;
  background: radial-gradient(ellipse at bottom, #ff8c42 0%, #ff6b35 50%, #cc3300 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  opacity: 0.75;
  animation: burn 4s ease-in-out infinite alternate;
}

:deep(button.fire-button-3), :deep(button.fire-button-3:not(:disabled):hover) {
  border-color: #FF8C00;
  color: #FFA500;
  background-color: rgba(255, 140, 0, 0.25);
  box-shadow: inset 0 0 15px rgba(255, 140, 0, 0.5);
}

:deep(button.fire-button-3)::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  transform: translateX(-50%);
  width: 13px;
  height: 15px;
  background: radial-gradient(ellipse at bottom, #ffa500 0%, #ff8c00 50%, #ff4500 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  opacity: 0.9;
  animation: burn 3s ease-in-out infinite alternate;
}

:deep(button.fire-button-4), :deep(button.fire-button-4:not(:disabled):hover) {
  border-color: #FF4500;
  color: #FF6347;
  background-color: rgba(255, 69, 0, 0.3);
  box-shadow: inset 0 0 15px rgba(255, 69, 0, 0.5);
}

:deep(button.fire-button-4)::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  transform: translateX(-50%);
  width: 16px;
  height: 18px;
  background: radial-gradient(ellipse at bottom, #ffcc00 0%, #ffa500 50%, #ff4500 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  opacity: 1;
  animation: burn 2s ease-in-out infinite alternate;
}

@keyframes burn {
  0% {
    transform: translateX(-50%) scaleY(1) scaleX(1);
    opacity: 0.8;
  }
  25% {
    transform: translateX(-50%) scaleY(1.1) scaleX(0.9);
    opacity: 0.9;
  }
  50% {
    transform: translateX(-50%) scaleY(1) scaleX(1.05);
    opacity: 0.85;
  }
  75% {
    transform: translateX(-50%) scaleY(1.05) scaleX(0.95);
    opacity: 0.95;
  }
  100% {
    transform: translateX(-50%) scaleY(1) scaleX(1);
    opacity: 0.8;
  }
}

@keyframes backgroundPulse {
  0% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.9;
  }
}

/* 亮色模式下火堆按钮样式 */
body.light-mode {
  :deep(button.fire-button-0) {
    border-color: #999;
    color: #aaa;
    background-color: rgba(150, 150, 150, 0.1);
  }
  
  :deep(button.fire-button-1) {
    border-color: #A0522D;
    color: #D2691E;
    background-color: rgba(160, 82, 45, 0.15);
  }
  
  :deep(button.fire-button-2) {
    border-color: #D2691E;
    color: #FF8C00;
    background-color: rgba(210, 105, 30, 0.2);
  }
  
  :deep(button.fire-button-3) {
    border-color: #FF8C00;
    color: #FFA500;
    background-color: rgba(255, 140, 0, 0.25);
  }
  
  :deep(button.fire-button-4) {
    border-color: #FF4500;
    color: #FF6347;
    background-color: rgba(255, 69, 0, 0.3);
  }
}
</style>