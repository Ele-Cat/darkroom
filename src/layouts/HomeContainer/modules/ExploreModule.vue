<template>
  <div class="tab-content" id="explore-content">
    <div class="scene-title">探索</div>
    <div class="scene-description">你进入了森林，准备狩猎获取食物和材料。</div>
    <div class="actions">
      <BasicButton id="huntAnimals" @button-click="huntAnimals">狩猎动物</BasicButton>
      <BasicButton id="gatherBerries" @button-click="gatherBerries">采集浆果</BasicButton>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 接收gameStore实例
const gameStore = inject('gameStore')
// 接收activeTab实例
const activeTab = inject('activeTab')

const huntAnimals = () => {
  gameStore.huntAnimals()
}

const gatherBerries = () => {
  gameStore.gatherBerries()
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

/* 场景样式 */
.scene-title {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
  color: @text-color;
  border-bottom: 1px solid @text-color;
  padding-bottom: 5px;
}

.scene-description {
  margin: 15px 0;
  line-height: 1.5;
  color: @text-color;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 120px;
}

/* 亮色模式样式 */
body.light-mode {
  .scene-title {
    color: @light-text-color;
    border-bottom: 1px solid #999;
  }
  
  .scene-description {
    color: #555;
  }
}
</style>