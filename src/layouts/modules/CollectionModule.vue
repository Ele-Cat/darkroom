<template>
  <div class="resource-collection">
    <TooltipButton 
      v-if="activeTab === 'cabin'"
      button-id="lightFire"
      :button-text="gameStore.fireLit ? '添柴' : '点燃火堆'"
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
      button-id="collectStone"
      cooldown-bar-id="collectStoneCooldown"
      button-text="收集石头"
      :cooldown="gameStore.cooldowns.stone"
      :max-cooldown="defaultSettings.collection.stone.maxCooldown"
      @button-click="collectStone"
    />
    <CoolDownButton 
      v-if="gameStore.villageUnlocked"
      button-id="checkTraps"
      cooldown-bar-id="checkTrapsCooldown"
      button-text="查看陷阱"
      :cooldown="gameStore.cooldowns.trap"
      :max-cooldown="defaultSettings.building.trap.maxCheckCooldown"
      :disabled="gameStore.traps <= 0"
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

const collectStone = () => {
  gameStore.collectStone()
}

const checkTraps = () => {
  gameStore.checkTraps()
}
</script>

<style scoped lang="less">
.resource-collection {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>