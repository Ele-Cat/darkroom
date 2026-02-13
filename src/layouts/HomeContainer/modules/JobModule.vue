<template>
  <div class="job-module" v-if="gameStore.jobModuleUnlocked && activeTab === 'village'">
    <div class="job-module-title">工作</div>
    <div class="jobs-list">
      <div 
        class="job-item" 
        v-for="job in jobTypes" 
        :key="job.id"
        @mouseenter="showTooltip(job.id, true)"
        @mouseleave="showTooltip(job.id, false)"
      >
        <div class="job-name">{{ job.name }}</div>
        <div class="job-count">{{ jobCount(job.id) }}</div>
        <div class="arrow-groups" v-if="job.id !== 'lumberjack'">
          <div class="arrow-group normal-arrows">
            <div @click="gameStore.adjustJobCount(job.id, 1)" class="upBtn" title="+1"></div>
            <div @click="gameStore.adjustJobCount(job.id, -1)" class="dnBtn" title="-1"></div>
          </div>
          <div class="arrow-group quick-arrows">
            <div @click="gameStore.adjustJobCount(job.id, 10)" class="upManyBtn" title="+10" ></div>
            <div @click="gameStore.adjustJobCount(job.id, -10)" class="dnManyBtn" title="-10" ></div>
          </div>
        </div>
        <div class="arrow-groups" v-else></div>
        <!-- Tooltip -->
        <div class="tooltip" v-if="activeTooltip === job.id">
          <div class="tooltip-content">
            <div class="material-item" v-for="(effect, index) in getJobEffects(job)" :key="index">
              <span class="material-name">{{ effect.name }}</span>
              <span :class="['material-count', effect.change > 0 ? 'positive' : 'negative']">
                {{ effect.change > 0 ? '+' : '' }}{{ effect.change }}/10s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, inject } from "vue";
import defaultSettings from "@/config/defaultSettings";

// 接收gameStore实例
const gameStore = inject('gameStore')
// 接收activeTab实例
const activeTab = inject('activeTab')

// 激活的tooltip
const activeTooltip = ref(null);

// 工种类型
const jobTypes = computed(() => {
  return defaultSettings.jobs.types.filter(job => {
    // 如果狩猎小屋未解锁，过滤掉猎人
    if (!gameStore.huntingCabinUnlocked && job.id === 'hunter') {
      return false;
    }
    // 如果熏肉小屋未解锁，过滤掉熏肉师
    if (!gameStore.smokehouseCabinUnlocked && job.id === 'butcher') {
      return false;
    }
    // 如果制革小屋未解锁，过滤掉皮革师
    if (!gameStore.tanneryCabinUnlocked && job.id === 'tanner') {
      return false;
    }
    return true;
  });
});

// 获取工种人数
const jobCount = (jobId) => {
  return gameStore.jobs[jobId] || 0;
};

// 显示/隐藏tooltip
const showTooltip = (jobId, show) => {
  if (show) {
    activeTooltip.value = jobId;
  } else {
    activeTooltip.value = null;
  }
};

// 获取工种对物料的影响
const getJobEffects = (job) => {
  const effects = [];
  const count = jobCount(job.id);
  
  // 计算效率乘数，考虑石斧的影响
  let efficiencyMultiplier = 1;
  
  // 处理木材
  if (job.wood) {
    effects.push({ name: '木材', change: job.wood * count * efficiencyMultiplier });
  }
  if (job.consume_wood) {
    effects.push({ name: '木材', change: -job.consume_wood * count });
  }
  
  // 处理生肉
  if (job.meat) {
    effects.push({ name: '生肉', change: job.meat * count });
  }
  if (job.consume_meat) {
    effects.push({ name: '生肉', change: -job.consume_meat * count });
  }
  
  // 处理毛皮
  if (job.fur) {
    effects.push({ name: '毛皮', change: job.fur * count });
  }
  if (job.consume_fur) {
    effects.push({ name: '毛皮', change: -job.consume_fur * count });
  }
  
  // 处理熏肉
  if (job.bacon) {
    effects.push({ name: '熏肉', change: job.bacon * count });
  }
  
  // 处理皮革
  if (job.leather) {
    effects.push({ name: '皮革', change: job.leather * count });
  }
  
  return effects;
};
</script>

<style scoped lang="less">
// 导入颜色变量
@import '@/styles/variable.less';

.job-module {
  background-color: @bg-color;
  border: 1px solid @border-color;
  border-radius: 3px;
  padding: 8px;
  width: 100%;
  max-width: 240px;
  box-shadow: 0 8px 10px @shadow-color;

  .job-module-title {
    text-align: center;
    font-weight: bold;
    margin-bottom: 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid @border-color;
    color: @text-color;
  }

  .jobs-list {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .job-item {
      display: flex;
      align-items: center;

      .job-name {
        color: @text-color;
        flex: 1;
        font-size: 12px;
      }

      .job-count {
        min-width: 40px;
        text-align: right;
        color: @text-color;
        margin-right: 10px;
        font-size: 12px;
      }

      .arrow-groups {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 28px;
      }

      .arrow-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .upBtn, .dnBtn, .upManyBtn, .dnManyBtn {
        position: relative;
        width: 12px;
        height: 10px;
        cursor: pointer;
        z-index: 1;
      }

      .upBtn, .upManyBtn {
        top: -2px;
      }

      .upBtn:after,
      .upBtn:before,
      .upManyBtn:after,
      .upManyBtn:before {
        position: absolute;
        border: medium solid transparent;
        content: " ";
        height: 0;
        width: 0;
        bottom: -1px;
      }

      .upBtn:before,
      .upManyBtn:before {
        border-color: transparent transparent @primary-color;
      }

      .upBtn:hover:before,
      .upManyBtn:hover:before {
        border-color: transparent transparent @primary-hover-color;
      }

      .upBtn:after,
      .upManyBtn:after {
        border-color: transparent transparent rgba(0, 0, 0, 1);
      }

      .upManyBtn:after {
        bottom: -2px;
      }

      .dnBtn, .dnManyBtn {
        bottom: -2px;
      }

      .dnBtn:after,
      .dnBtn:before,
      .dnManyBtn:after,
      .dnManyBtn:before {
        position: absolute;
        border: medium solid transparent;
        content: " ";
        height: 0;
        width: 0;
        top: -1px;
      }
      .dnBtn:before,
      .dnManyBtn:before {
        border-color: @primary-color transparent transparent;
      }

      .dnBtn:hover:before,
      .dnManyBtn:hover:before {
        border-color: @primary-hover-color transparent transparent;
      }

      .dnBtn:after,
      .dnManyBtn:after {
        border-color: rgba(0, 0, 0, 1) transparent transparent;
      }

      .dnManyBtn:after {
        top: -2px;
      }

      .upBtn:before,
      .dnBtn:before,
      .upManyBtn:before,
      .dnManyBtn:before {
        border-width: 4px;
        left: 50%;
        margin-left: -4px;
      }

      .upBtn:after,
      .dnBtn:after,
      .upManyBtn:after,
      .dnManyBtn:after {
        border-width: 2px;
        left: 50%;
        margin-left: -2px;
      }
    }
  }
}

// Tooltip样式
.job-item {
  position: relative;

  .tooltip {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    width: 120px;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.9);
    color: @text-color;
    border-radius: 3px;
    font-size: 12px;
    z-index: 10;
    pointer-events: none;
    box-sizing: border-box;

    &::after {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 10px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent rgba(0, 0, 0, 0.6) transparent;
    }
  }

  .tooltip-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .material-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .material-name {
    flex: 1;
    text-align: left;
  }

  .material-count {
    flex: 1;
    text-align: right;

    &.positive {
      color: #4CAF50;
    }

    &.negative {
      color: #f44336;
    }
  }
}

// 亮色模式
body.light-mode {
  .job-module {
    background-color: @light-bg-color;
    border: 1px solid @light-border-color;
    box-shadow: 0 8px 10px @light-shadow-color;

    .job-module-title {
      color: @light-text-color;
      border-bottom: 1px solid @light-border-hover-color;
    }

    .jobs-list {
      .job-item {
        .job-name {
          color: @light-text-color;
        }

        .job-count {
          color: @light-text-color;
        }

        .upBtn:before,
        .upManyBtn:before {
          border-color: transparent transparent @light-primary-color;
        }

        .upBtn:hover:before,
        .upManyBtn:hover:before {
          border-color: transparent transparent @light-primary-hover-color;
        }

        .upBtn:after,
        .upManyBtn:after {
          border-color: transparent transparent rgba(255, 255, 255, 1);
        }

        .dnBtn:before,
        .dnManyBtn:before {
          border-color: @light-primary-color transparent transparent;
        }

        .dnBtn:hover:before,
        .dnManyBtn:hover:before {
          border-color: @light-primary-hover-color transparent transparent;
        }

        .dnBtn:after,
        .dnManyBtn:after {
          border-color: rgba(255, 255, 255, 1) transparent transparent;
        }

        // 亮色模式下的tooltip样式
        .tooltip {
          background-color: rgba(255, 255, 255, 0.9);
          color: @light-text-color;
          border: 1px solid #999;

          &::after {
            border-color: transparent transparent rgba(255, 255, 255, 0.6) transparent;
          }
        }

        .material-name {
          color: @light-text-color;
        }

        .material-count {
          color: @light-text-color;

          &.positive {
            color: #4CAF50;
          }

          &.negative {
            color: #f44336;
          }
        }
      }
    }
  }
}
</style>