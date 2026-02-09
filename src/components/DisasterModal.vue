<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <h3 class="modal-title">{{ disasterTitle }}</h3>
      <div class="modal-body">
        <p>{{ disasterMessage }}</p>
      </div>
      <div class="modal-footer">
        <button class="basic-button confirm-button" @click="handleConfirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  disasterType: {
    type: String,
    default: ''
  },
  disasterData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['confirm'])

const disasterTitle = computed(() => {
  switch (props.disasterType) {
    case 'fire':
      return '🔥 火灾警报'
    case 'hunterRage':
      return '🐺 猎物狂暴'
    default:
      return '⚠️ 天灾警报'
  }
})

const disasterMessage = computed(() => {
  switch (props.disasterType) {
    case 'fire':
      return `村落发生火灾！烧掉了 ${props.disasterData.hutsBurned || 0} 个小屋，${props.disasterData.peopleLost || 0} 人不幸遇难。`
    case 'hunterRage':
      return `猎物突然狂暴！${props.disasterData.peopleLost || 0} 名猎人在狩猎过程中遭遇不幸。`
    default:
      return '村落遭遇天灾，请做好应对准备！'
  }
})

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  color: #ff6b6b;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  text-align: center;
}

.modal-body {
  margin-bottom: 20px;
  color: #f5f5f5;
  line-height: 1.5;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.confirm-button {
  background-color: #4a4a4a;
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.confirm-button:hover {
  background-color: #5a5a5a;
  border-color: rgba(255, 255, 255, 0.3);
}

/* 亮色模式 */
:global(body.light-mode) .modal-content {
  background-color: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.2);
}

:global(body.light-mode) .modal-title {
  color: #d32f2f;
}

:global(body.light-mode) .modal-body {
  color: #333;
}

:global(body.light-mode) .confirm-button {
  background-color: #e0e0e0;
  color: #333;
  border-color: rgba(0, 0, 0, 0.3);
}

:global(body.light-mode) .confirm-button:hover {
  background-color: #f0f0f0;
}
</style>
