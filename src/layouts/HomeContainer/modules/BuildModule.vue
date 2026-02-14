<template>
  <div class="build-module">
    <div class="build-section">
      <p class="build-type">建筑：</p>
      
      <!-- 陷阱按钮 -->
      <TooltipButton 
        button-id="deployTrap"
        button-text="布置陷阱"
        :tooltip-text="getTrapTooltip()"
        :disabled="gameStore.buildings.traps >= defaultSettings.building.trap.maxTraps"
        :count="gameStore.buildings.traps"
        @button-click="gameStore.deployTrap()"
      />
      
      <!-- 居住小屋按钮 -->
      <TooltipButton 
        button-id="buildStructure"
        button-text="居住小屋"
        :tooltip-text="getBuildCostTooltip()"
        :disabled="gameStore.buildings.village >= 30"
        :count="gameStore.buildings.village"
        @button-click="gameStore.buildStructure()"
      />
      
      <!-- 狩猎小屋按钮 -->
      <TooltipButton 
        v-if="gameStore.buildings.village >= defaultSettings.hunting.cabin.unlockLevel"
        button-id="unlockHuntingCabin"
        button-text="狩猎小屋"
        :tooltip-text="getHuntingCabinTooltip()"
        :disabled="gameStore.buildings.huntingCabin"
        @button-click="gameStore.unlockHuntingCabin()"
      />
      
      <!-- 熏肉小屋按钮 -->
      <TooltipButton 
        v-if="gameStore.buildings.huntingCabin && gameStore.buildings.village >= defaultSettings.smokehouse.cabin.unlockLevel"
        button-id="unlockSmokehouseCabin"
        button-text="熏肉小屋"
        :tooltip-text="getSmokehouseCabinTooltip()"
        :disabled="gameStore.buildings.smokehouseCabin"
        @button-click="gameStore.unlockSmokehouseCabin()"
      />
      
      <!-- 制革小屋按钮 -->
      <TooltipButton 
        v-if="gameStore.buildings.village >= defaultSettings.tannery.cabin.unlockLevel"
        button-id="unlockTanneryCabin"
        button-text="制革小屋"
        :tooltip-text="getTanneryCabinTooltip()"
        :disabled="gameStore.buildings.tanneryCabin"
        @button-click="gameStore.unlockTanneryCabin()"
      />
      
      <!-- 工坊按钮 -->
      <TooltipButton 
        v-if="gameStore.buildings.tanneryCabin && gameStore.buildings.village >= defaultSettings.workshop.cabin.unlockLevel"
        button-id="unlockWorkshop"
        button-text="工坊"
        :tooltip-text="getWorkshopTooltip()"
        :disabled="gameStore.buildings.workshop"
        @button-click="gameStore.unlockWorkshop()"
      />
      
      <!-- 贸易站按钮 -->
      <TooltipButton 
        v-if="gameStore.buildings.village >= defaultSettings.tradingPost.cabin.unlockLevel"
        button-id="unlockTradingPost"
        button-text="贸易站"
        :tooltip-text="getTradingPostTooltip()"
        :disabled="gameStore.buildings.tradingPost"
        @button-click="gameStore.unlockTradingPost()"
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

const getTrapTooltip = () => {
  if (gameStore.buildings.traps >= defaultSettings.building.trap.maxTraps) {
    return `陷阱已达到最大数量${defaultSettings.building.trap.maxTraps}个`
  } else {
    const initialWoodCost = defaultSettings.building.trap.initialWoodCost
    const woodCostIncrease = defaultSettings.building.trap.woodCostIncrease
    
    const woodCost = initialWoodCost + gameStore.buildings.traps * woodCostIncrease
    
    return `木材 ${woodCost}`
  }
}

const getBuildCostTooltip = () => {
  const baseWoodCost = defaultSettings.building.cabin.baseWoodCost
  const woodCostIncreasePerLevel = defaultSettings.building.cabin.woodCostIncreasePerLevel
  const woodCost = baseWoodCost + Math.floor(gameStore.buildings.village * woodCostIncreasePerLevel)
  
  return `木材 ${woodCost}`
}

const getHuntingCabinTooltip = () => {
  return `木材 ${defaultSettings.hunting.cabin.woodCost}, 毛皮 ${defaultSettings.hunting.cabin.furCost}, 生肉 ${defaultSettings.hunting.cabin.meatCost}`
}

const getSmokehouseCabinTooltip = () => {
  return `木材 ${defaultSettings.smokehouse.cabin.woodCost}, 生肉 ${defaultSettings.smokehouse.cabin.meatCost}`
}

const getTanneryCabinTooltip = () => {
  return `木材 ${defaultSettings.tannery.cabin.woodCost}, 毛皮 ${defaultSettings.tannery.cabin.furCost}`
}

const getWorkshopTooltip = () => {
  return `木材 ${defaultSettings.workshop.cabin.woodCost}, 生肉 ${defaultSettings.workshop.cabin.meatCost}, 毛皮 ${defaultSettings.workshop.cabin.furCost}`
}

const getTradingPostTooltip = () => {
  return `木材 ${defaultSettings.tradingPost.cabin.woodCost}, 熏肉 ${defaultSettings.tradingPost.cabin.baconCost}, 皮革 ${defaultSettings.tradingPost.cabin.leatherCost}`
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.build-module {
  width: 100%;
  max-width: 240px;

  .build-section {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .build-type {
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      color: @text-color;
    }
  }
}

/* 亮色模式样式 */
body.light-mode {
  .build-module {
    .build-section {
      .build-type {
        color: @light-text-color;
      }
    }
  }
}
</style>