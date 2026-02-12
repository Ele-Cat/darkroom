<template>
  <!-- 测试音频按钮（仅开发环境显示） -->
  <ControlButton
    v-if="isDev"
    buttonId="audioTestToggle"
    buttonClass="trigger-disaster-toggle"
    icon="🔊"
    title="测试音频"
    @click="handlePlayAudio"
  />

  <!-- 音频启用按钮 -->
  <ControlButton
    v-if="isDev"
    buttonId="audioEnableToggle"
    buttonClass="trigger-disaster-toggle"
    :isActive="audioEnabled"
    :icon="audioEnabled ? '🔊' : '🔇'"
    :title="audioEnabled ? '音频已启用' : '启用音频'"
    @click="handleEnableAudio"
  />
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import audioPlayer from '@/utils/audioPlayer'
import AudioLibrary from '@/utils/audioLibrary'
import ControlButton from "@/components/ControlButton.vue";

// 初始化音频播放器
audioPlayer.init(AudioLibrary)

const audioEnabled = ref(audioPlayer.getAudioEnabled());

const handleEnableAudio = () => {
  audioPlayer.enableAudio();
  audioEnabled.value = true;
};

// 监听音频启用状态变化
watch(() => audioPlayer.getAudioEnabled(), (newValue) => {
  audioEnabled.value = newValue;
});

const handlePlayAudio = () => {
  audioPlayer.enableAudio();
  // audioPlayer.playAudio('MUSIC_LONELY_HUT', true)
  // setInterval(() => {
  //   audioPlayer.playAudio('MUSIC_SPACE')
  // }, 1000 * 6)
};

// 检查是否为开发环境
const isDev = import.meta.env.VITE_APP_ENV === 'development'

onUnmounted(() => {
  // 清理音频播放器
  audioPlayer.destroy()
});
</script>