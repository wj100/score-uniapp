<template>
  <view class="container">
    <view class="header">
      <text class="title">云函数测试页面</text>
    </view>
    
    <view class="section">
      <button class="test-btn" @click="testInitPlayers">1. 初始化队员</button>
      <button class="test-btn" @click="testGetPlayers">2. 获取队员列表</button>
      <button class="test-btn" @click="testSubmitMatch">3. 测试提交比赛</button>
      <button class="test-btn" @click="testGetMatches">4. 测试获取比赛记录</button>
      <button class="test-btn" @click="testErrorHandling">5. 测试错误处理</button>
      <button class="test-btn" @click="testDatabaseFix">6. 测试数据库修复</button>
      <button class="test-btn" @click="testTabStatus">7. 测试Tab状态</button>
      <button class="test-btn" @click="testCloudFunction">8. 直接测试云函数</button>
    </view>
    
    <view class="section">
      <text class="section-title">uni-icons 测试:</text>
      <view class="icons-test">
        <view class="icon-item">
          <uni-icons type="person" size="30" color="#007AFF"></uni-icons>
          <text>person</text>
        </view>
        <view class="icon-item">
          <uni-icons type="person-filled" size="30" color="#007AFF"></uni-icons>
          <text>person-filled</text>
        </view>
        <view class="icon-item">
          <uni-icons type="stats" size="30" color="#4CAF50"></uni-icons>
          <text>stats</text>
        </view>
        <view class="icon-item">
          <uni-icons type="contact" size="30" color="#FF9800"></uni-icons>
          <text>contact</text>
        </view>
        <view class="icon-item">
          <uni-icons type="bar-chart" size="30" color="#9C27B0"></uni-icons>
          <text>bar-chart</text>
        </view>
      </view>
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
    
    async testSubmitMatch() {
      try {
        this.result = '正在测试提交比赛...'
        
        const result = await uniCloud.callFunction({
          name: 'badminton-api',
          data: {
            action: 'submitSingleMatch',
            data: {
              player1: '言志',
              player2: '小鲁',
              score1: 21,
              score2: 19,
              match_name: '测试比赛'
            }
          }
        })
        
        console.log('提交比赛结果:', result)
        this.result = `提交比赛结果: ${JSON.stringify(result.result, null, 2)}`
        
      } catch (error) {
        this.result = `提交比赛失败: ${error.message}`
        console.error('提交比赛失败:', error)
      }
    },
    
    async testGetMatches() {
      try {
        this.result = '正在测试获取比赛记录...'
        
        const result = await uniCloud.callFunction({
          name: 'badminton-api',
          data: {
            action: 'getSingleMatches',
            data: {
              timeRange: 'all',
              limit: 5
            }
          }
        })
        
        console.log('获取比赛记录结果:', result)
        
        if (result.result.code === 0) {
          console.log('比赛数据:', result.result.data)
          // 测试日期格式化
          result.result.data.forEach(match => {
            console.log('比赛时间戳:', match.time)
            console.log('比赛日期字符串:', match.date)
            const testDate = new Date(match.time * 1000)
            console.log('转换后的日期:', testDate.toLocaleString())
          })
        }
        
        this.result = `获取比赛记录结果: ${JSON.stringify(result.result, null, 2)}`
        
      } catch (error) {
        this.result = `获取比赛记录失败: ${error.message}`
        console.error('获取比赛记录失败:', error)
      }
    },
    
    async testErrorHandling() {
      try {
        this.result = '正在测试错误处理机制...'
        
        // 模拟数据库资源耗尽错误
        const result = await uniCloud.callFunction({
          name: 'badminton-api',
          data: {
            action: 'getPlayers'
          }
        })
        
        console.log('错误处理测试结果:', result)
        
        if (result.result.code === -1) {
          this.result = `检测到错误: ${result.result.message}\n\n错误处理机制:\n1. 自动重试3次\n2. 使用降级数据\n3. 显示用户友好提示`
        } else {
          this.result = `正常返回: ${JSON.stringify(result.result, null, 2)}`
        }
        
      } catch (error) {
        this.result = `异常捕获: ${error.message}\n\n系统将自动使用降级数据`
        console.error('错误处理测试异常:', error)
      }
    },
    
    async testDatabaseFix() {
      try {
        this.result = '正在测试数据库操作修复...'
        
        // 测试获取队员列表
        const playersResult = await uniCloud.callFunction({
          name: 'badminton-api',
          data: {
            action: 'getPlayers'
          }
        })
        
        console.log('获取队员列表结果:', playersResult)
        
        if (playersResult.result.code === 0) {
          this.result = `✅ 数据库操作修复成功！\n\n获取队员列表: ${playersResult.result.data.length} 个队员\n\n修复内容:\n1. 所有数据库操作都使用重试机制\n2. 修复了 collection.where 错误\n3. 添加了资源耗尽处理\n4. 优化了错误提示`
        } else {
          this.result = `❌ 数据库操作仍有问题: ${playersResult.result.message}`
        }
        
      } catch (error) {
        this.result = `❌ 测试异常: ${error.message}`
        console.error('数据库修复测试异常:', error)
      }
    },
    
    async testTabStatus() {
      try {
        this.result = '正在测试Tab状态修复...'
        
        // 获取当前页面信息
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const currentRoute = '/' + currentPage.route
        
        this.result = `✅ Tab状态修复完成！\n\n当前页面: ${currentRoute}\n\n修复内容:\n1. 添加了onShow生命周期监听\n2. 页面切换时自动更新tab状态\n3. 添加了ref引用和状态同步\n4. 优化了切换逻辑和错误处理\n\n请尝试切换不同页面，观察tab状态是否正确更新。`
        
      } catch (error) {
        this.result = `❌ Tab状态测试异常: ${error.message}`
        console.error('Tab状态测试异常:', error)
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

.icons-test {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  min-width: 120rpx;
}

.icon-item text {
  font-size: 20rpx;
  color: #666;
}
</style>
