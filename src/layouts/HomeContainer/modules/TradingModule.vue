<template>
  <div class="trading-module">
    <div class="trade-section">
      <p class="build-type">交易：</p>
      <div class="trade-items">
        <div class="trade-placeholder">
          敬请期待
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TradingModule',
}
</script>

<style scoped lang="less">
@import '@/styles/variable.less';

.trading-module {
  width: 120px;
}

.trade-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.build-type {
  height: 32px;
  line-height: 32px;
  margin: 0;
  font-weight: bold;
  color: @text-color;
}
</style>