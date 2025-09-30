<template>
  <view class="container">
    <!-- 时间筛选 -->
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

    <!-- 日期范围显示 -->
    <view class="date-range">
      <text>日期范围</text>
      <text class="date-text">{{ dateRangeText }}</text>
    </view>

    <!-- 数据统计 -->
    <view class="stats-section">
      <text class="section-title">数据统计</text>
      <view class="stats-table">
        <view class="stats-header">
          <text class="header-cell" @click="sortBy('name')">
            队员 {{ getSortIcon('name') }}
          </text>
          <text class="header-cell" @click="sortBy('totalScore')">
            总分 {{ getSortIcon('totalScore') }}
          </text>
          <text class="header-cell" @click="sortBy('wins')">
            胜场 {{ getSortIcon('wins') }}
          </text>
          <text class="header-cell" @click="sortBy('totalMatches')">
            总场次 {{ getSortIcon('totalMatches') }}
          </text>
          <text class="header-cell" @click="sortBy('winRate')">
            胜率 {{ getSortIcon('winRate') }}
          </text>
          <text class="header-cell" @click="sortBy('avgScore')">
            平均分 {{ getSortIcon('avgScore') }}
          </text>
        </view>
        <view 
          v-for="player in sortedStats" 
          :key="player.name"
          class="stats-row"
        >
          <text class="cell">{{ player.name }}</text>
          <text class="cell">{{ player.totalScore }}</text>
          <text class="cell">{{ player.wins }}</text>
          <text class="cell">{{ player.totalMatches }}</text>
          <text class="cell">{{ player.winRate }}</text>
          <text class="cell">{{ player.avgScore }}</text>
        </view>
      </view>
    </view>

    <!-- 双打对战记录 -->
    <view class="matches-section">
      <text class="section-title">双打对战记录</text>
      <view class="matches-list">
        <view v-if="currentMatches.length === 0" class="no-data">
          <text>暂无数据</text>
        </view>
        <view v-else>
          <view class="matches-header">
            <text class="match-header-cell">日期</text>
            <text class="match-header-cell">对战</text>
            <text class="match-header-cell">比分</text>
          </view>
          <view 
            v-for="match in currentMatches" 
            :key="match.id"
            class="match-row"
          >
            <text class="match-cell">{{ formatDate(match.date) }}</text>
            <text class="match-cell">{{ formatTeams(match) }}</text>
            <text class="match-cell">{{ match.scoreA }} - {{ match.scoreB }}</text>
          </view>
        </view>
      </view>
    </view>
    
  </view>
</template>

<script>
import { getDoubleStats } from '@/utils/storage.js'

export default {
  data() {
    return {
      currentTimeRange: 'thisMonth',
      timeOptions: [
        { label: '历史所有', value: 'all' },
        { label: '上月', value: 'lastMonth' },
        { label: '昨日', value: 'yesterday' },
        { label: '今日', value: 'today' },
        { label: '当月', value: 'thisMonth' }
      ],
      statsData: {},
      currentMatches: [],
      sortField: 'totalScore',
      sortOrder: 'desc'
    }
  },
  
  onLoad() {
    this.loadData()
  },
  
  onShow() {
    this.loadData()
  },
  
  computed: {
    dateRangeText() {
      const now = new Date()
      switch(this.currentTimeRange) {
        case 'today':
          return now.toISOString().split('T')[0]
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          return yesterday.toISOString().split('T')[0]
        case 'thisMonth':
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
          return `${year}-${month}-01 至 ${year}-${month}-${String(lastDay).padStart(2, '0')}`
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
          return `${lastMonth.toISOString().split('T')[0]} 至 ${lastMonthEnd.toISOString().split('T')[0]}`
        case 'all':
        default:
          return '全部时间'
      }
    },
    
    sortedStats() {
      const stats = []
      Object.keys(this.statsData).forEach(playerName => {
        const playerStats = this.statsData[playerName]
        const winRate = playerStats.totalMatches > 0 
          ? ((playerStats.wins / playerStats.totalMatches) * 100).toFixed(1) + '%'
          : '0.0%'
        const avgScore = playerStats.totalMatches > 0
          ? (playerStats.totalScore / playerStats.totalMatches).toFixed(1)
          : '0.0'
        
        stats.push({
          name: playerName,
          totalScore: playerStats.totalScore,
          wins: playerStats.wins,
          losses: playerStats.losses,
          totalMatches: playerStats.totalMatches,
          winRate,
          avgScore
        })
      })
      
      // 按选定字段排序
      return stats.sort((a, b) => {
        let aVal = a[this.sortField]
        let bVal = b[this.sortField]
        
        // 处理百分比字段（去除%符号进行数值比较）
        if (this.sortField === 'winRate') {
          aVal = parseFloat(aVal.replace('%', ''))
          bVal = parseFloat(bVal.replace('%', ''))
        }
        // 处理数值字段
        else if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
          aVal = parseFloat(aVal)
          bVal = parseFloat(bVal)
        }
        // 处理字符串字段
        else if (typeof aVal === 'string') {
          return this.sortOrder === 'desc' 
            ? bVal.localeCompare(aVal, 'zh-CN') 
            : aVal.localeCompare(bVal, 'zh-CN')
        }
        
        // 数值比较
        return this.sortOrder === 'desc' ? bVal - aVal : aVal - bVal
      })
    }
  },
  
  onLoad() {
    this.loadData()
  },
  
  onShow() {
    this.loadData()
  },
  
  methods: {
    async loadData() {
      try {
        const result = await getDoubleStats(this.currentTimeRange)
        this.statsData = result.stats
        this.currentMatches = result.matches
      } catch (error) {
        console.error('加载数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      }
    },
    
    changeTimeRange(range) {
      this.currentTimeRange = range
      this.loadData()
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        // 如果点击同一字段，切换排序方向
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      } else {
        // 如果点击不同字段，设置新字段并默认降序
        this.sortField = field
        this.sortOrder = 'desc'
      }
    },
    
    getSortIcon(field) {
      if (this.sortField !== field) {
        return '↕' // 默认双箭头
      }
      return this.sortOrder === 'desc' ? '↓' : '↑'
    },
    
    formatDate(dateValue) {
      let date
      if (typeof dateValue === 'number') {
        // 时间戳
        date = new Date(dateValue * 1000)
      } else if (typeof dateValue === 'string') {
        // 日期字符串
        date = new Date(dateValue)
      } else {
        return '--'
      }
      
      if (isNaN(date.getTime())) {
        return '--'
      }
      
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    },
    
    formatTeams(match) {
      const teamAStr = match.teamA.join('&')
      const teamBStr = match.teamB.join('&')
      return `${teamAStr} vs ${teamBStr}`
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

.time-filter {
  display: flex;
  background: white;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.time-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 8rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
}

.time-item.active {
  background: #4CAF50;
  color: white;
}

.time-item:not(.active) {
  color: #666;
}

.date-range {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-range text:first-child {
  font-size: 28rpx;
  color: #333;
}

.date-text {
  font-size: 24rpx;
  color: #666;
}

.stats-section {
  margin-bottom: 48rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.stats-table {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.stats-header {
  display: flex;
  background: #f8f8f8;
  padding: 24rpx 16rpx;
}

.header-cell {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.header-cell:hover {
  background: rgba(0,0,0,0.05);
  border-radius: 8rpx;
}

.header-cell:active {
  background: rgba(0,0,0,0.1);
}

.stats-row {
  display: flex;
  padding: 24rpx 16rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.stats-row:last-child {
  border-bottom: none;
}

.cell {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #333;
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
}

.match-header-cell {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
}

.match-row {
  display: flex;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.match-row:last-child {
  border-bottom: none;
}

.match-cell {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #333;
}
</style>
