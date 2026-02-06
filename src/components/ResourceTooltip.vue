<template>
  <div class="resource-tooltip-container" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <div class="resource-header">
      <span>{{ resourceName }}:</span>
      <span :id="resourceId">{{ Math.round(resourceAmount) }}</span>
    </div>
    <div class="tooltip" v-if="showTooltip && allEffects.length > 0">
      <div class="tooltip-content">
        <div class="effects" v-if="allEffects.length > 0">
          <div class="effect" v-for="(effect, index) in allEffects" :key="index">
            <span class="effect-type">{{ effect.type }}</span>
            <span class="effect-change">{{ effect.change }}</span>
          </div>
        </div>
        <div class="net-change">
          <span>总计:</span>
          <span :class="netChange > 0 ? 'positive' : 'negative'">
            {{ netChange > 0 ? '+' : '' }}{{ netChange }}/10s
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import defaultSettings from '@/config/defaultSettings'

const props = defineProps({
  resourceName: {
    type: String,
    required: true
  },
  resourceAmount: {
    type: Number,
    required: true
  },
  resourceId: {
    type: String,
    required: true
  },
  buffType: {
    type: String,
    default: ''
  },
  buffChange: {
    type: String,
    default: ''
  },
  netChange: {
    type: Number,
    default: 0
  },
  jobs: {
    type: Object,
    default: () => ({
      lumberjack: 0,
      miner: 0,
      hunter: 0,
      butcher: 0,
      tanner: 0
    })
  },
  cartUnlocked: {
    type: Boolean,
    default: false
  },
  stoneAxeUnlocked: {
    type: Boolean,
    default: false
  }
})

const showTooltip = ref(false)

// 计算所有对物料的影响
const allEffects = computed(() => {
  const effects = []
  const resourceKey = props.resourceName === '木材' ? 'wood' : 
                    props.resourceName === '石头' ? 'stone' :
                    props.resourceName === '生肉' ? 'meat' :
                    props.resourceName === '毛皮' ? 'fur' :
                    props.resourceName === '熏肉' ? 'bacon' :
                    props.resourceName === '皮革' ? 'leather' : ''
  
  if (resourceKey) {
    // 货车对物料的影响
    const cartBuff = defaultSettings.buffs.cart[resourceKey]
    if (cartBuff > 0 && props.cartUnlocked) {
      effects.push({
        type: '货车',
        change: `+${cartBuff}/10s`
      })
    }
    
    // 伐木工对木材的影响
    if (resourceKey === 'wood' && props.jobs && props.jobs.lumberjack > 0) {
      const lumberjackBuff = defaultSettings.jobs.types.find(job => job.id === 'lumberjack')
      if (lumberjackBuff) {
        let efficiencyMultiplier = 1
        if (props.stoneAxeUnlocked) {
          efficiencyMultiplier = 2
        }
        const change = props.jobs.lumberjack * lumberjackBuff.wood * efficiencyMultiplier
        effects.push({
          type: '伐木工',
          change: `+${change}/10s`
        })
      }
    }
    
    // 采石工对石头的影响
    if (resourceKey === 'stone' && props.jobs && props.jobs.miner > 0) {
      const minerBuff = defaultSettings.jobs.types.find(job => job.id === 'miner')
      if (minerBuff) {
        let efficiencyMultiplier = 1
        if (props.stoneAxeUnlocked) {
          efficiencyMultiplier = 2
        }
        const change = props.jobs.miner * minerBuff.stone * efficiencyMultiplier
        effects.push({
          type: '采石工',
          change: `+${change}/10s`
        })
      }
    }
    
    // 猎人对生肉和毛皮的影响
    if ((resourceKey === 'meat' || resourceKey === 'fur') && props.jobs && props.jobs.hunter > 0) {
      const hunterBuff = defaultSettings.jobs.types.find(job => job.id === 'hunter')
      if (hunterBuff) {
        const change = props.jobs.hunter * hunterBuff[resourceKey]
        effects.push({
          type: '猎人',
          change: `+${change}/10s`
        })
      }
    }
    
    // 熏肉师对熏肉的影响（同时消耗生肉和木材）
    if (resourceKey === 'bacon' && props.jobs && props.jobs.butcher > 0) {
      const butcherBuff = defaultSettings.jobs.types.find(job => job.id === 'butcher')
      if (butcherBuff) {
        const change = props.jobs.butcher * butcherBuff.bacon
        effects.push({
          type: '熏肉师',
          change: `+${change}/10s`
        })
      }
    }
    
    // 熏肉师消耗木材
    if (resourceKey === 'wood' && props.jobs && props.jobs.butcher > 0) {
      const butcherBuff = defaultSettings.jobs.types.find(job => job.id === 'butcher')
      if (butcherBuff) {
        const change = props.jobs.butcher * butcherBuff.consume_wood
        effects.push({
          type: '熏肉师',
          change: `-${change}/10s`
        })
      }
    }
    
    // 熏肉师消耗生肉
    if (resourceKey === 'meat' && props.jobs && props.jobs.butcher > 0) {
      const butcherBuff = defaultSettings.jobs.types.find(job => job.id === 'butcher')
      if (butcherBuff) {
        const change = props.jobs.butcher * butcherBuff.consume_meat
        effects.push({
          type: '熏肉师',
          change: `-${change}/10s`
        })
      }
    }
    
    // 皮革师对皮革的影响
    if (resourceKey === 'leather' && props.jobs && props.jobs.tanner > 0) {
      const tannerBuff = defaultSettings.jobs.types.find(job => job.id === 'tanner')
      if (tannerBuff) {
        const change = props.jobs.tanner * tannerBuff.leather
        effects.push({
          type: '皮革师',
          change: `+${change}/10s`
        })
      }
    }
    
    // 皮革师消耗毛皮
    if (resourceKey === 'fur' && props.jobs && props.jobs.tanner > 0) {
      const tannerBuff = defaultSettings.jobs.types.find(job => job.id === 'tanner')
      if (tannerBuff) {
        const change = props.jobs.tanner * tannerBuff.consume_fur
        effects.push({
          type: '皮革师',
          change: `-${change}/10s`
        })
      }
    }
  }
  
  return effects
})
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.resource-tooltip-container {
  position: relative;
  width: 100%;
}

.resource-header {
  display: flex;
  justify-content: space-between;
}

.tooltip {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 100%;
  max-width: 150px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.8);
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
    right: 10px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
  }
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.effects {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.effect {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.net-change {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid rgba(212, 175, 55, 0.3);
}

.positive {
  color: #4caf50;
}

.negative {
  color: #f44336;
}

/* 亮色模式 */
body.light-mode {
  .tooltip {
    background-color: rgba(255, 255, 255, 0.8);
    color: @light-text-color;
    border: 1px solid #999;

    &::after {
      border-color: transparent transparent rgba(255, 255, 255, 0.8) transparent;
    }
  }

  .net-change {
    border-top: 1px solid rgba(153, 153, 153, 0.3);
  }
}
</style>