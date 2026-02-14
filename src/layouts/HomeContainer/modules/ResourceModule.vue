<template>
  <div class="game-state">
    <div class="resource-container">
      <div class="resource-group village-info-group" v-if="activeTab === 'village' && gameStore.buildings.village >= 0">
        <div class="inventory-title">{{ gameStore.getVillageName() }}</div>
        <div class="resource">
          <div class="resource-header">
            <span>小屋:</span>
            <span id="villageLevel">{{ gameStore.buildings.village }}</span>
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
            <span>{{ gameStore.buildings.traps }}/{{ defaultSettings.building.trap.maxTraps }}</span>
          </div>
        </div>
      </div>
      <div class="resource-group inventory-group">
        <div class="inventory-title">库存</div>
        <div class="resource">
          <ResourceTooltip 
            resource-name="木材"
            :resource-amount="Math.floor(gameStore.stores.wood)"
            resource-id="woodCount"
            :buff-type="''"
            :buff-change="''"
            :net-change="gameStore.materialBuffs.wood"
          />
        </div>
        <div class="resource" v-if="gameStore.buildings.huntingCabin || gameStore.buildings.traps > 0 || gameStore.stores.meat > 0 || gameStore.stores.fur > 0">
          <ResourceTooltip 
            resource-name="生肉"
            :resource-amount="Math.floor(gameStore.stores.meat)"
            resource-id="meatCount"
            :net-change="gameStore.materialBuffs.meat"
          />
        </div>
        <div class="resource" v-if="gameStore.buildings.huntingCabin || gameStore.buildings.traps > 0 || gameStore.stores.meat > 0 || gameStore.stores.fur > 0">
          <ResourceTooltip 
            resource-name="毛皮"
            :resource-amount="Math.floor(gameStore.stores.fur)"
            resource-id="furCount"
            :net-change="gameStore.materialBuffs.fur"
          />
        </div>
        <div class="resource" v-if="gameStore.buildings.smokehouseCabin || gameStore.stores.bacon > 0">
          <ResourceTooltip 
            resource-name="熏肉"
            :resource-amount="Math.floor(gameStore.stores.bacon)"
            resource-id="baconCount"
            :net-change="gameStore.materialBuffs.bacon"
          />
        </div>
        <div class="resource" v-if="gameStore.buildings.tanneryCabin">
          <ResourceTooltip 
            resource-name="皮革"
            :resource-amount="Math.floor(gameStore.stores.leather)"
            resource-id="leatherCount"
            :net-change="gameStore.materialBuffs.leather"
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
  return gameStore.buildings.village * defaultSettings.building.cabin.maxPopulationPerCabin
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

.resource-group {
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  gap: 5px;
  background-color: @bg-color;
  border: 1px solid @border-color;
  padding: 8px;
  border-radius: 3px;
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

.inventory-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid @border-color;
}

/* 亮色模式样式 */
body.light-mode {
  .game-state {
    color: @light-text-color;
    border-color: #999;
  }
  
  .resource-group {
    background-color: @light-bg-color;
    border: 1px solid @light-border-color;
  }
  
  .inventory-title {
    color: @light-text-color;
    border-bottom: 1px solid @light-border-hover-color;
  }
}
</style>