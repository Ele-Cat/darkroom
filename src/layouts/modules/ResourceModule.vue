<template>
  <div class="game-state">
    <div class="resource-container">
      <div class="resource-group village-info-group" v-if="activeTab === 'village' && gameStore.villageUnlocked">
        <div class="inventory-title">{{ gameStore.getVillageName() }}</div>
        <div class="resource">
          <div class="resource-header">
            <span>小屋:</span>
            <span id="villageLevel">{{ gameStore.villageLevel }}</span>
          </div>
        </div>
        <div class="resource">
          <div class="resource-header">
            <span>人口:</span>
            <span id="population">{{ gameStore.population }}/{{ maxPopulation }}</span>
          </div>
        </div>
        <div class="resource">
          <div class="resource-header">
            <span>陷阱:</span>
            <span>{{ gameStore.traps }}/{{ defaultSettings.building.trap.maxTraps }}</span>
          </div>
        </div>
      </div>
      <div class="resource-group inventory-group">
        <div class="inventory-title">库存</div>
        <div class="resource">
          <ResourceTooltip 
            resource-name="木材"
            :resource-amount="Math.floor(gameStore.wood)"
            resource-id="woodCount"
            :buff-type="''"
            :buff-change="''"
            :net-change="gameStore.materialBuffs.wood"
            :jobs="gameStore.jobs"
            :cart-unlocked="gameStore.cartUnlocked"
            :stone-axe-unlocked="gameStore.stoneAxeUnlocked"
          />
        </div>
        <div class="resource">
          <ResourceTooltip 
            resource-name="石头"
            :resource-amount="Math.floor(gameStore.stone)"
            resource-id="stoneCount"
            :buff-type="''"
            :buff-change="''"
            :net-change="gameStore.materialBuffs.stone"
            :jobs="gameStore.jobs"
            :cart-unlocked="gameStore.cartUnlocked"
            :stone-axe-unlocked="gameStore.stoneAxeUnlocked"
          />
        </div>
        <div class="resource" v-if="gameStore.huntingCabinUnlocked || gameStore.traps > 0 || gameStore.meat > 0 || gameStore.fur > 0">
          <ResourceTooltip 
            resource-name="生肉"
            :resource-amount="Math.floor(gameStore.meat)"
            resource-id="meatCount"
            :buff-type="''"
            :buff-change="''"
            :net-change="gameStore.materialBuffs.meat"
            :jobs="gameStore.jobs"
            :cart-unlocked="gameStore.cartUnlocked"
          />
        </div>
        <div class="resource" v-if="gameStore.huntingCabinUnlocked || gameStore.traps > 0 || gameStore.meat > 0 || gameStore.fur > 0">
          <ResourceTooltip 
            resource-name="毛皮"
            :resource-amount="Math.floor(gameStore.fur)"
            resource-id="furCount"
            :buff-type="''"
            :buff-change="''"
            :net-change="gameStore.materialBuffs.fur"
            :jobs="gameStore.jobs"
            :cart-unlocked="gameStore.cartUnlocked"
          />
        </div>
        <div class="resource" v-if="gameStore.huntingCabinUnlocked">
          <ResourceTooltip 
            resource-name="熏肉"
            :resource-amount="Math.floor(gameStore.bacon)"
            resource-id="baconCount"
            :buff-type="''"
            :buff-change="''"
            :net-change="gameStore.materialBuffs.bacon"
            :jobs="gameStore.jobs"
            :cart-unlocked="gameStore.cartUnlocked"
          />
        </div>
        <div class="resource" v-if="gameStore.tanneryCabinUnlocked">
          <ResourceTooltip 
            resource-name="皮革"
            :resource-amount="Math.floor(gameStore.leather)"
            resource-id="leatherCount"
            :buff-type="''"
            :buff-change="''"
            :net-change="gameStore.materialBuffs.leather"
            :jobs="gameStore.jobs"
            :cart-unlocked="gameStore.cartUnlocked"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import ResourceTooltip from '@/components/ResourceTooltip.vue'
import defaultSettings from '@/config/defaultSettings'

// 接收gameStore实例
const gameStore = inject('gameStore')
// 接收activeTab实例
const activeTab = inject('activeTab')

const maxPopulation = computed(() => {
  return gameStore.villageLevel * defaultSettings.building.cabin.maxPopulationPerCabin
})
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.game-state {
  flex: 1;
  border-radius: 5px;
  max-width: 100%;
  box-sizing: border-box;
}

.resource-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.village-info-group,
.inventory-group {
  align-self: flex-end;
  width: 100%;
  max-width: 200px;
}

.resource {
  min-width: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.resource-header {
  display: flex;
  justify-content: space-between;
}

.buff-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 400;
  color: rgba(212, 175, 55, 0.8);
}

.buff-type {
  margin-right: 10px;
}

.buff-change {
  font-style: italic;
}

.inventory-group {
  width: 100%;
  max-width: 200px;
}

.inventory-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid @border-color;
}

.resource-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background-color: @bg-color;
  border: 1px solid @border-color;
  padding: 8px;
  border-radius: 3px;
}

/* 亮色模式样式 */
body.light-mode {
  .game-state {
    color: @light-text-color;
    border-color: #999;
  }
  
  .resource-group {
    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(153, 153, 153, 0.2);
  }
  
  .inventory-title {
    border-bottom: 1px solid rgba(153, 153, 153, 0.3);
  }
}
</style>