<template>
  <ExploreModule v-if="activeTab === 'explore'" />
  
  <div class="tab-content" v-else>
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
</style>