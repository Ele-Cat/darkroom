<template>
  <div class="tab-container">
    <div 
      class="tab" 
      :class="{ active: activeTab === 'cabin' }"
      :data-tab="'cabin'"
      @click="switchTab('cabin')"
    >
      {{ gameStore.fireLit ? '林中小屋' : '废弃小屋' }}
    </div>
    <div 
      v-if="canShowVillageTab && gameStore.fireLit"
      class="tab" 
      :class="{ active: activeTab === 'village', locked: !gameStore.villageUnlocked, unlockable: !gameStore.villageUnlocked && gameStore.wood >= 10 && gameStore.stone >= 10 }"
      :data-tab="'village'"
      :data-locked="!gameStore.villageUnlocked"
      :title="!gameStore.villageUnlocked ? (gameStore.wood >= 10 && gameStore.stone >= 10 ? '解锁' : `解锁还差 ${Math.max(10 - gameStore.wood, 0)} 木材和 ${Math.max(10 - gameStore.stone, 0)} 石头`) : ''"
      @click="switchTab('village')"
    >
      {{ gameStore.getVillageName() }}
    </div>
    <div 
      class="tab" 
      :class="{ active: activeTab === 'explore' }"
      :data-tab="'explore'"
      :style="{ display: canShowExploreTab ? 'block' : 'none' }"
      @click="switchTab('explore')"
    >
      探索
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 接收gameStore实例
const gameStore = inject('gameStore')

const props = defineProps({
  activeTab: {
    type: String,
    required: true
  },
  canShowExploreTab: {
    type: Boolean,
    required: true
  },
  canShowVillageTab: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['switch-tab'])

const switchTab = (tab) => {
  emit('switch-tab', tab)
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.tab-container {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid @text-color;
  padding-bottom: 0;
}

.tab {
  padding: 8px 16px;
  background-color: #333;
  border: 1px solid @text-color;
  border-bottom: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  border-radius: 5px 5px 0 0;
  
  &:hover {
    background-color: #444;
    box-shadow: 0 0 5px rgba(212, 175, 55, 0.3);
  }
  
  &.active {
    background-color: @text-color;
    color: #1a1a1a;
    font-weight: bold;
    padding: 8px 18px;
  }
  
  &.locked {
    cursor: not-allowed;
    opacity: 0.7;
    
    &:hover {
      background-color: #333;
      box-shadow: none;
    }
  }
  
  &.unlockable {
    cursor: pointer;
    opacity: 1;
    
    &:hover {
      background-color: rgba(212, 175, 55, 0.2);
      box-shadow: 0 0 8px rgba(212, 175, 55, 0.8);
    }
  }
}

/* 亮色模式样式 */
body.light-mode {
  .tab-container {
    border-bottom: 1px solid #999;
    padding-bottom: 0;
  }
  
  .tab {
    background-color: #e0e0e0;
    color: @light-text-color;
    border-color: #999;
    
    &:hover {
      background-color: #f0f0f0;
      box-shadow: 0 0 5px rgba(153, 153, 153, 0.3);
    }
    
    &.active {
      background-color: #999;
      color: #f0f0f0;
    }
    
    &.locked {
      cursor: not-allowed;
      opacity: 0.7;
      
      &:hover {
        background-color: #e0e0e0;
        box-shadow: none;
      }
    }
    
    &.unlockable {
      cursor: pointer;
      opacity: 1;
      
      &:hover {
        background-color: rgba(153, 153, 153, 0.2);
        box-shadow: 0 0 8px rgba(153, 153, 153, 0.6);
      }
    }
  }
}
</style>