<template>
  <view class="container">
    <!-- 队员选择 -->
    <view class="section">
      <text class="section-title">选择对战队员</text>
      <view class="player-selection">
        <view class="player-item">
          <picker :value="player1Index" :range="players" @change="onPlayer1Change">
            <view class="picker">
              <text>{{ player1 || '选择队员1' }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
        
        <view class="vs-text">vs</view>
        
        <view class="player-item">
          <picker :value="player2Index" :range="availablePlayers2" @change="onPlayer2Change">
            <view class="picker">
              <text>{{ player2 || '选择队员2' }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 时间筛选 -->
    <view class="section">
      <text class="section-title">时间范围</text>
      <view class="time-filter">
        <view 
          v-for="(item, index) in timeOptions" 
          :key="index"
          class="time-item"
          :class="{ active: currentTimeRange === item.value }"
          @click="changeTimeRange(item.value)"
        >
          <text>{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 分析按钮 -->
    <view class="submit-section">
      <button 
        class="submit-btn" 
        :class="{ disabled: !canAnalyze }" 
        @click="analyzeMatch"
        :disabled="!canAnalyze"
      >
        开始分析
      </button>
    </view>

    <!-- 分析结果 -->
    <view v-if="showResults" class="results-section">
      <!-- 对战统计 -->
      <view class="stats-card">
        <text class="card-title">对战统计</text>
        <view class="stats-grid">
          <view class="stats-item">
            <text class="stats-label">总场次</text>
            <text class="stats-value">{{ analysisResult.totalMatches }}</text>
          </view>
          <view class="stats-item">
            <text class="stats-label">{{ player1 }}胜场</text>
            <text class="stats-value win">{{ analysisResult.player1Wins }}</text>
            <text class="stats-value rate">{{ analysisResult.player1WinRate }}%</text>
          </view>
          <view class="stats-item">
            <text class="stats-label">{{ player2 }}胜场</text>
            <text class="stats-value win">{{ analysisResult.player2Wins }}</text>
            <text class="stats-value rate">{{ analysisResult.player2WinRate }}%</text>
          </view>
        </view>
      </view>

      <!-- 得分统计 -->
      <view class="stats-card">
        <text class="card-title">得分统计</text>
        <view class="score-stats">
          <view class="score-item">
            <text class="player-name">{{ player1 }}</text>
            <view class="score-details">
              <text class="score-text">平均分: {{ analysisResult.player1AvgScore }}</text>
              <text class="score-text">总得分: {{ analysisResult.player1TotalScore }}</text>
            </view>
          </view>
          <view class="score-item">
            <text class="player-name">{{ player2 }}</text>
            <view class="score-details">
              <text class="score-text">平均分: {{ analysisResult.player2AvgScore }}</text>
              <text class="score-text">总得分: {{ analysisResult.player2TotalScore }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 对战记录 -->
      <view class="matches-section">
        <text class="section-title">对战记录 ({{ matchHistory.length }}场)</text>
        <view class="matches-list">
          <view v-if="matchHistory.length === 0" class="no-data">
            <text>暂无对战记录</text>
          </view>
          <view v-else>
            <view class="matches-header">
              <text class="header-item">日期</text>
              <text class="header-item">比分</text>
              <text class="header-item">胜者</text>
            </view>
            <view 
              v-for="match in matchHistory" 
              :key="match.id"
              class="match-item"
            >
              <text class="match-date">{{ formatDate(match.time || match.date) }}</text>
              <text class="match-score">{{ getMatchScore(match) }}</text>
              <text class="match-winner" :class="{ highlight: isPlayer1Winner(match) }">
                {{ getWinner(match) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPlayers, getSingleMatchAnalysis } from '@/utils/storage.js'

export default {
  data() {
    return {
      players: [],
      player1: '',
      player2: '',
      player1Index: -1,
      player2Index: -1,
      currentTimeRange: 'thisMonth',
      timeOptions: [
        { label: '历史所有', value: 'all' },
        { label: '上月', value: 'lastMonth' },
        { label: '昨日', value: 'yesterday' },
        { label: '今日', value: 'today' },
        { label: '当月', value: 'thisMonth' }
      ],
      showResults: false,
      analysisResult: {},
      matchHistory: []
    }
  },
  
  computed: {
    availablePlayers2() {
      return this.players.filter(player => player !== this.player1)
    },
    
    canAnalyze() {
      return this.player1 && this.player2 && this.player1 !== this.player2
    }
  },
  
  onLoad() {
    this.loadPlayers()
  },
  
  methods: {
    async loadPlayers() {
      try {
        this.players = await getPlayers()
      } catch (error) {
        console.error('加载队员失败:', error)
        uni.showToast({
          title: '加载队员失败',
          icon: 'error'
        })
      }
    },
    
    onPlayer1Change(e) {
      this.player1Index = e.detail.value
      this.player1 = this.players[e.detail.value]
      // 重置结果
      this.showResults = false
    },
    
    onPlayer2Change(e) {
      this.player2Index = e.detail.value
      this.player2 = this.availablePlayers2[e.detail.value]
      // 重置结果
      this.showResults = false
    },
    
    changeTimeRange(range) {
      this.currentTimeRange = range
      // 重置结果
      this.showResults = false
    },
    
    async analyzeMatch() {
      if (!this.canAnalyze) {
        return
      }
      
      uni.showLoading({
        title: '分析中...'
      })
      
      try {
        const result = await getSingleMatchAnalysis({
          player1: this.player1,
          player2: this.player2,
          timeRange: this.currentTimeRange
        })
        
        this.analysisResult = result.stats
        this.matchHistory = result.matches
        this.showResults = true
        
        uni.hideLoading()
        
        if (result.matches.length === 0) {
          uni.showToast({
            title: '该时间段内无对战记录',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('分析失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '分析失败',
          icon: 'error'
        })
      }
    },
    
    formatDate(dateValue) {
      let date
      if (typeof dateValue === 'number') {
        // 时间戳（秒），转换为毫秒
        date = new Date(dateValue * 1000)
      } else if (typeof dateValue === 'string') {
        // ISO 字符串或其他字符串格式
        date = new Date(dateValue)
      } else {
        return '--'
      }
      
      if (isNaN(date.getTime())) {
        return '--'
      }
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    getMatchScore(match) {
      if (match.player1 === this.player1) {
        return `${match.score1} - ${match.score2}`
      } else {
        return `${match.score2} - ${match.score1}`
      }
    },
    
    getWinner(match) {
      const isPlayer1Win = (match.player1 === this.player1 && match.score1 > match.score2) ||
                          (match.player2 === this.player1 && match.score2 > match.score1)
      return isPlayer1Win ? this.player1 : this.player2
    },
    
    isPlayer1Winner(match) {
      return (match.player1 === this.player1 && match.score1 > match.score2) ||
             (match.player2 === this.player1 && match.score2 > match.score1)
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

.section {
  margin-bottom: 48rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.player-selection {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.player-item {
  flex: 1;
}

.picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
}

.picker text:first-child {
  color: #333;
  font-size: 28rpx;
}

.arrow {
  color: #666;
  font-size: 24rpx;
}

.vs-text {
  margin: 0 24rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #4CAF50;
}

.time-filter {
  display: flex;
  background: white;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.time-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.time-item.active {
  background: #4CAF50;
  color: white;
}

.time-item text {
  font-size: 24rpx;
  color: inherit;
}

.submit-section {
  margin-bottom: 48rpx;
}

.submit-btn {
  width: 100%;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 32rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn.disabled {
  background: #ccc;
}

.results-section {
  margin-top: 32rpx;
}

.stats-card {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.stats-grid {
  display: grid;
  /* 一行三个 */
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24rpx;
}

.stats-item {
  text-align: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.stats-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.stats-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.stats-value.win {
  color: #4CAF50;
}

.stats-value.rate {
  color: #FF9800;
}

.score-stats {
  display: flex;
  gap: 24rpx;
}

.score-item {
  flex: 1;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.player-name {
  display: block;
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  text-align: center;
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.score-text {
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

.matches-section {
  margin-bottom: 48rpx;
}

.matches-list {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.no-data {
  padding: 80rpx;
  text-align: center;
  color: #999;
}

.matches-header {
  display: flex;
  background: #f8f8f8;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #e0e0e0;
}

.header-item {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
}

.match-item {
  display: flex;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.match-item:last-child {
  border-bottom: none;
}

.match-date,
.match-score,
.match-winner {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #333;
}

.match-winner.highlight {
  color: #4CAF50;
  font-weight: bold;
}
</style>