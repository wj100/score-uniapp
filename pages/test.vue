<template>
  <view class="container">
    <view class="header">
      <text class="title">云函数测试页面</text>
    </view>
    
    <view class="section">
      <button class="test-btn" @click="testInitPlayers">1. 初始化队员</button>
      <button class="test-btn" @click="testGetPlayers">2. 获取队员列表</button>
      <button class="test-btn" @click="testCloudFunction">3. 直接测试云函数</button>
    </view>
    
    <view class="result-section">
      <text class="section-title">测试结果:</text>
      <view class="result-box">
        <text class="result-text">{{ result }}</text>
      </view>
    </view>
    
    <view class="players-section" v-if="players.length > 0">
      <text class="section-title">队员列表:</text>
      <view class="players-list">
        <view v-for="(player, index) in players" :key="index" class="player-item">
          <text>{{ player }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPlayers, initPlayers } from '@/utils/storage.js'

export default {
  data() {
    return {
      result: '点击按钮开始测试...',
      players: []
    }
  },
  
  methods: {
    async testInitPlayers() {
      try {
        this.result = '正在初始化队员...'
        const result = await initPlayers()
        this.result = `初始化结果: ${result ? '成功' : '失败'}`
        console.log('初始化结果:', result)
      } catch (error) {
        this.result = `初始化失败: ${error.message}`
        console.error('初始化失败:', error)
      }
    },
    
    async testGetPlayers() {
      try {
        this.result = '正在获取队员列表...'
        this.players = await getPlayers()
        this.result = `获取到 ${this.players.length} 个队员`
        console.log('获取到的队员:', this.players)
      } catch (error) {
        this.result = `获取失败: ${error.message}`
        console.error('获取队员失败:', error)
      }
    },
    
    async testCloudFunction() {
      try {
        this.result = '正在测试云函数连接...'
        
        const result = await uniCloud.callFunction({
          name: 'badminton-api',
          data: {
            action: 'getPlayers'
          }
        })
        
        console.log('云函数原始返回:', result)
        this.result = `云函数返回: ${JSON.stringify(result.result, null, 2)}`
        
      } catch (error) {
        this.result = `云函数调用失败: ${error.message}`
        console.error('云函数调用失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding: 32rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 48rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.section {
  margin-bottom: 48rpx;
}

.test-btn {
  width: 100%;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 16rpx;
  padding: 32rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
}

.result-section {
  margin-bottom: 48rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.result-box {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  min-height: 200rpx;
}

.result-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  word-break: break-all;
}

.players-section {
  margin-bottom: 48rpx;
}

.players-list {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
}

.player-item {
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.player-item:last-child {
  border-bottom: none;
}

.player-item text {
  font-size: 28rpx;
  color: #333;
}
</style>
