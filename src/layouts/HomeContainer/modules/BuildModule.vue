<template>
  <div class="build-module">
    <div class="build-section">
      <p class="build-type">建筑：</p>
      
      <!-- 陷阱按钮 -->
      <TooltipButton 
        button-id="deployTrap"
        button-text="布置陷阱"
        :tooltip-text="getTrapTooltip()"
        :disabled="gameStore.traps >= defaultSettings.building.trap.maxTraps"
        @button-click="deployTrap"
      />
      
      <!-- 居住小屋按钮 -->
      <TooltipButton 
        button-id="buildStructure"
        button-text="居住小屋"
        :tooltip-text="getBuildCostTooltip()"
        :disabled="gameStore.villageLevel >= 50"
        @button-click="buildStructure"
      />
      
      <!-- 狩猎小屋按钮 -->
      <TooltipButton 
        v-if="gameStore.villageLevel >= defaultSettings.hunting.cabin.unlockLevel"
        button-id="unlockHuntingCabin"
        button-text="狩猎小屋"
        :tooltip-text="getHuntingCabinTooltip()"
        :disabled="gameStore.huntingCabinUnlocked"
        @button-click="unlockHuntingCabin"
      />
      
      <!-- 熏肉小屋按钮 -->
      <TooltipButton 
        v-if="gameStore.huntingCabinUnlocked && gameStore.villageLevel >= defaultSettings.smokehouse.cabin.unlockLevel"
        button-id="unlockSmokehouseCabin"
        button-text="熏肉小屋"
        :tooltip-text="getSmokehouseCabinTooltip()"
        :disabled="gameStore.smokehouseCabinUnlocked"
        @button-click="unlockSmokehouseCabin"
      />
      
      <!-- 制革小屋按钮 -->
      <TooltipButton 
        v-if="gameStore.villageLevel >= defaultSettings.tannery.cabin.unlockLevel"
        button-id="unlockTanneryCabin"
        button-text="制革小屋"
        :tooltip-text="getTanneryCabinTooltip()"
        :disabled="gameStore.tanneryCabinUnlocked"
        @button-click="unlockTanneryCabin"
      />
      
      <!-- 贸易站按钮 -->
      <TooltipButton 
        v-if="gameStore.villageLevel >= defaultSettings.tradingPost.cabin.unlockLevel"
        button-id="unlockTradingPost"
        button-text="贸易站"
        :tooltip-text="getTradingPostTooltip()"
        :disabled="gameStore.tradingPostUnlocked"
        @button-click="unlockTradingPost"
      />
      
      <!-- 工坊按钮 -->
      <TooltipButton 
        v-if="gameStore.tanneryCabinUnlocked && gameStore.villageLevel >= defaultSettings.workshop.cabin.unlockLevel"
        button-id="unlockWorkshop"
        button-text="工坊"
        :tooltip-text="getWorkshopTooltip()"
        :disabled="gameStore.workshopUnlocked"
        @button-click="unlockWorkshop"
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

const buildStructure = () => {
  gameStore.buildStructure()
}

const deployTrap = () => {
  gameStore.deployTrap()
}

const unlockHuntingCabin = () => {
  gameStore.unlockHuntingCabin()
}

const unlockTanneryCabin = () => {
  gameStore.unlockTanneryCabin()
}

const unlockWorkshop = () => {
  gameStore.unlockWorkshop()
}

const unlockSmokehouseCabin = () => {
  gameStore.unlockSmokehouseCabin()
}

const unlockTradingPost = () => {
  gameStore.unlockTradingPost()
}

const getBuildCostTooltip = () => {
  const baseWoodCost = defaultSettings.building.cabin.baseWoodCost
  const baseStoneCost = defaultSettings.building.cabin.baseStoneCost
  const woodCostIncreasePerLevel = defaultSettings.building.cabin.woodCostIncreasePerLevel
  const stoneCostIncreasePerLevel = defaultSettings.building.cabin.stoneCostIncreasePerLevel
  
  const woodCost = baseWoodCost + Math.floor(gameStore.villageLevel * woodCostIncreasePerLevel)
  const stoneCost = baseStoneCost + Math.floor(gameStore.villageLevel * stoneCostIncreasePerLevel)
  
  return `木材 ${woodCost}, 石头 ${stoneCost}`
}

const getTrapTooltip = () => {
  if (gameStore.traps >= defaultSettings.building.trap.maxTraps) {
    return `陷阱已达到最大数量${defaultSettings.building.trap.maxTraps}个`
  } else {
    const initialWoodCost = defaultSettings.building.trap.initialWoodCost
    const initialStoneCost = defaultSettings.building.trap.initialStoneCost
    const woodCostIncrease = defaultSettings.building.trap.woodCostIncrease
    const stoneCostIncrease = defaultSettings.building.trap.stoneCostIncrease
    
    const woodCost = initialWoodCost + gameStore.traps * woodCostIncrease
    const stoneCost = initialStoneCost + gameStore.traps * stoneCostIncrease
    
    return `木材 ${woodCost}, 石头 ${stoneCost}`
  }
}

const getHuntingCabinTooltip = () => {
  return `木材 ${defaultSettings.hunting.cabin.woodCost}, 石头 ${defaultSettings.hunting.cabin.stoneCost}, 毛皮 ${defaultSettings.hunting.cabin.furCost}, 生肉 ${defaultSettings.hunting.cabin.meatCost}`
}

const getTanneryCabinTooltip = () => {
  return `木材 ${defaultSettings.tannery.cabin.woodCost}, 石头 ${defaultSettings.tannery.cabin.stoneCost}, 毛皮 ${defaultSettings.tannery.cabin.furCost}`
}

const getWorkshopTooltip = () => {
  return `木材 ${defaultSettings.workshop.cabin.woodCost}, 石头 ${defaultSettings.workshop.cabin.stoneCost}, 熏肉 ${defaultSettings.workshop.cabin.baconCost}`
}

const getSmokehouseCabinTooltip = () => {
  return `木材 ${defaultSettings.smokehouse.cabin.woodCost}, 石头 ${defaultSettings.smokehouse.cabin.stoneCost}, 生肉 ${defaultSettings.smokehouse.cabin.meatCost}`
}

const getTradingPostTooltip = () => {
  return `木材 ${defaultSettings.tradingPost.cabin.woodCost}, 石头 ${defaultSettings.tradingPost.cabin.stoneCost}, 生肉 ${defaultSettings.tradingPost.cabin.meatCost}, 毛皮 ${defaultSettings.tradingPost.cabin.furCost}`
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