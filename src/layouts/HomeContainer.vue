<template>
  <ExploreModule v-if="activeTab === 'explore'" />
  
  <div class="tab-content" v-else>
    <div 
      v-if="activeTab === 'cabin' " 
      class="fire-status" 
      id="fireStatus"
    >
      <span v-if="gameStore.fireLit" class="fire-lit">火堆: 已点燃</span>
      <span v-else>火堆: 未点燃</span>
    </div>
    
    <div class="cabin-layout">
      <div class="actions">
        <!-- 小屋：展示收集木材、收集石头 -->
        <CollectionModule />

        <BuildModule v-if="activeTab === 'cabin' && gameStore.villageUnlocked" />
      </div>

      <CraftModule v-if="activeTab === 'cabin' && gameStore.villageUnlocked" />
      
      <!-- 工作模块 -->
      <JobModule />
      
      <!-- 资源模块 -->
      <ResourceModule />
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import CollectionModule from './modules/CollectionModule.vue'
import JobModule from './modules/JobModule.vue'
import BuildModule from './modules/BuildModule.vue'
import CraftModule from './modules/CraftModule.vue'
import ResourceModule from './modules/ResourceModule.vue'
import ExploreModule from './modules/ExploreModule.vue'

// 接收gameStore实例
const gameStore = inject('gameStore')
// 接收activeTab实例
const activeTab = inject('activeTab')
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.fire-status {
  text-align: center;
  font-size: 14px;
  margin: 5px 0;
  padding: 5px;
  background-color: rgba(255, 165, 0, 0.2);
  border-radius: 3px;
  margin-left: auto;
  margin-right: auto;
}

/* 小屋布局 */
.cabin-layout {
  display: flex;
  gap: 20px;
  margin-top: 8px;
  align-items: flex-start;
  
  .actions {
    width: 120px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.fire-lit {
  color: #ff9900;
  animation: flicker 2s infinite alternate;
}

@keyframes flicker {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 亮色模式样式 */
body.light-mode {
  .fire-status {
    background-color: rgba(255, 165, 0, 0.1);
  }
}
</style>