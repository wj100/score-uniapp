<template>
  <view class="container">
    <!-- 双打队员选择 -->
    <view class="section">
      <text class="section-title">双打队员</text>
      
      <!-- A队 -->
      <view class="team-section">
        <text class="team-label">A队</text>
        <view class="team-players">
          <view class="player-item">
            <picker :value="middleIndexA1" :range="availablePlayersA1" @change="onPlayerA1Change">
              <view class="picker">
                <text>{{ playerA1 || '选择队员1' }}</text>
                <text class="arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <text class="and-text">&</text>
          
          <view class="player-item">
            <picker :value="middleIndexA2" :range="availablePlayersA2" @change="onPlayerA2Change">
              <view class="picker">
                <text>{{ playerA2 || '选择队员2' }}</text>
                <text class="arrow">▼</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <!-- VS -->
      <view class="vs-section">
        <text class="vs-text">vs</text>
      </view>

      <!-- B队 -->
      <view class="team-section">
        <text class="team-label">B队</text>
        <view class="team-players">
          <view class="player-item">
            <picker :value="middleIndexB1" :range="availablePlayersB1" @change="onPlayerB1Change">
              <view class="picker">
                <text>{{ playerB1 || '选择队员3' }}</text>
                <text class="arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <text class="and-text">&</text>
          
          <view class="player-item">
            <picker :value="middleIndexB2" :range="availablePlayersB2" @change="onPlayerB2Change">
              <view class="picker">
                <text>{{ playerB2 || '选择队员4' }}</text>
                <text class="arrow">▼</text>
              </view>
            </picker>
          </view>
        </view>
      </view>
    </view>

    <!-- 比分输入 -->
    <view class="section">
      <text class="section-title">比分</text>
      <view class="score-section">
        <view class="score-item">
          <text class="team-name">A队</text>
          <view class="score-input">
            <input 
              type="number" 
              v-model="scoreA" 
              placeholder="0"
              @input="onScoreAInput"
            />
          </view>
        </view>
        
        <view class="vs-text">vs</view>
        
        <view class="score-item">
          <text class="team-name">B队</text>
          <view class="score-input">
            <input 
              type="number" 
              v-model="scoreB" 
              placeholder="0"
              @input="onScoreBInput"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button 
        class="submit-btn" 
        :class="{ disabled: !canSubmit }" 
        @click="submitScore"
        :disabled="!canSubmit"
      >
        提交双打比分
      </button>
    </view>

    <!-- 今日已提交 -->
    <view class="section">
      <text class="section-title">今日已提交:</text>
      <view class="today-matches">
        <view v-if="todayMatches.length === 0" class="no-data">
          <text>暂无数据</text>
        </view>
        <view v-else class="matches-list">
          <view class="matches-header">
            <text class="header-item">对战</text>
            <text class="header-item">比分</text>
            <text class="header-item">操作</text>
          </view>
          <view 
            v-for="match in todayMatches" 
            :key="match.id" 
            class="match-item"
          >
            <text class="match-teams">
              {{ match.teamA.join('&') }} vs {{ match.teamB.join('&') }}
            </text>
            <text class="match-score">{{ match.scoreA }} - {{ match.scoreB }}</text>
            <view class="match-actions">
              <text class="delete-btn" @click="deleteMatch(match)">🗑️</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPlayers, saveDoubleMatch, getDoubleMatches, initPlayers } from '@/utils/storage.js'

export default {
  data() {
    return {
      players: [],
      playerA1: '',
      playerA2: '',
      playerB1: '',
      playerB2: '',
      scoreA: '',
      scoreB: '',
      selectedPlayerA1Index: -1,
      selectedPlayerA2Index: -1,
      selectedPlayerB1Index: -1,
      selectedPlayerB2Index: -1,
      todayMatches: []
    }
  },
  
  onLoad() {
    this.loadData()
  },
  
  onShow() {
    this.loadTodayMatches()
  },
  
  computed: {
    selectedPlayers() {
      return [this.playerA1, this.playerA2, this.playerB1, this.playerB2].filter(p => p)
    },
    
    availablePlayersA1() {
      return this.players.filter(player => !this.selectedPlayers.includes(player) || player === this.playerA1)
    },
    
    availablePlayersA2() {
      return this.players.filter(player => !this.selectedPlayers.includes(player) || player === this.playerA2)
    },
    
    availablePlayersB1() {
      return this.players.filter(player => !this.selectedPlayers.includes(player) || player === this.playerB1)
    },
    
    availablePlayersB2() {
      return this.players.filter(player => !this.selectedPlayers.includes(player) || player === this.playerB2)
    },
    
    canSubmit() {
      return this.playerA1 && 
             this.playerA2 && 
             this.playerB1 && 
             this.playerB2 &&
             this.playerA1 !== this.playerA2 &&
             this.playerB1 !== this.playerB2 &&
             this.selectedPlayers.length === 4 &&
             new Set(this.selectedPlayers).size === 4 &&
             this.scoreA !== '' && 
             this.scoreB !== '' &&
             (parseInt(this.scoreA) > 0 || parseInt(this.scoreB) > 0)
    }
  },
  
  onLoad() {
    this.loadData()
  },
  
  onShow() {
    this.loadTodayMatches()
  },
  
  methods: {
    async loadData() {
      try {
        console.log('开始加载队员数据...')
        this.players = await getPlayers()
        console.log('获取到的队员列表:', this.players)
        
        if (this.players.length === 0) {
          console.log('队员列表为空，尝试初始化...')
          // 尝试初始化队员
          const initResult = await initPlayers()
          console.log('初始化结果:', initResult)
          if (initResult) {
            this.players = await getPlayers()
            console.log('重新获取队员列表:', this.players)
          }
        }
        
        this.loadTodayMatches()
      } catch (error) {
        console.error('加载队员数据失败:', error)
        // 使用默认队员数据
        this.players = ['言志', '小鲁', '建华', '汪骏', '杭宁']
        uni.showToast({
          title: '加载失败，使用默认数据',
          icon: 'none'
        })
      }
    },
    
    async loadTodayMatches() {
      const allMatches = await getDoubleMatches('today')
      this.todayMatches = allMatches
    },
    
    onPlayerA1Change(e) {
      this.selectedPlayerA1Index = e.detail.value
      this.playerA1 = this.availablePlayersA1[e.detail.value]
      this.updateAvailableIndexes()
    },
    
    onPlayerA2Change(e) {
      this.selectedPlayerA2Index = e.detail.value
      this.playerA2 = this.availablePlayersA2[e.detail.value]
      this.updateAvailableIndexes()
    },
    
    onPlayerB1Change(e) {
      this.selectedPlayerB1Index = e.detail.value
      this.playerB1 = this.availablePlayersB1[e.detail.value]
      this.updateAvailableIndexes()
    },
    
    onPlayerB2Change(e) {
      this.selectedPlayerB2Index = e.detail.value
      this.playerB2 = this.availablePlayersB2[e.detail.value]
      this.updateAvailableIndexes()
    },
    
    updateAvailableIndexes() {
      // 更新各个选择器的索引
      if (this.playerA1) {
        this.selectedPlayerA1Index = this.availablePlayersA1.indexOf(this.playerA1)
      }
      if (this.playerA2) {
        this.selectedPlayerA2Index = this.availablePlayersA2.indexOf(this.playerA2)
      }
      if (this.playerB1) {
        this.selectedPlayerB1Index = this.availablePlayersB1.indexOf(this.playerB1)
      }
      if (this.playerB2) {
        this.selectedPlayerB2Index = this.availablePlayersB2.indexOf(this.playerB2)
      }
    },
    
    onScoreAInput(e) {
      this.scoreA = e.detail.value
    },
    
    onScoreBInput(e) {
      this.scoreB = e.detail.value
    },
    
    async submitScore() {
      if (!this.canSubmit) {
        return
      }
      
      uni.showLoading({
        title: '提交中...'
      })
      
      try {
        const match = {
          teamA: [this.playerA1, this.playerA2],
          teamB: [this.playerB1, this.playerB2],
          scoreA: parseInt(this.scoreA),
          scoreB: parseInt(this.scoreB)
        }
        
        const result = await saveDoubleMatch(match)
        if (result) {
          uni.showToast({
            title: '提交成功',
            icon: 'success'
          })
          
          // 重置表单
          this.resetForm()
          // 刷新今日比赛
          this.loadTodayMatches()
        } else {
          uni.showToast({
            title: '提交失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('提交失败:', error)
        uni.showToast({
          title: '提交失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    resetForm() {
      this.playerA1 = ''
      this.playerA2 = ''
      this.playerB1 = ''
      this.playerB2 = ''
      this.scoreA = ''
      this.scoreB = ''
      this.selectedPlayerA1Index = -1
      this.selectedPlayerA2Index = -1
      this.selectedPlayerB1Index = -1
      this.selectedPlayerB2Index = -1
    },
    
    async deleteMatch(match) {
      // 调试：输出match对象
      console.log('要删除的match对象:', match);
      console.log('match.id:', match.id);
      console.log('match._id:', match._id);
      
      // 显示确认对话框
      const result = await new Promise((resolve) => {
        uni.showModal({
          title: '确认删除',
          content: `确定要删除 ${match.teamA.join('&')} vs ${match.teamB.join('&')} 的双打比赛记录吗？`,
          success: (res) => {
            resolve(res.confirm)
          },
          fail: () => {
            resolve(false)
          }
        })
      })
      
      if (!result) {
        return
      }
      
      uni.showLoading({
        title: '删除中...'
      })
      
      try {
        // 调用云函数删除双打比赛记录
        const deleteResult = await uniCloud.callFunction({
          name: 'badminton-api',
          data: {
            action: 'deleteDoubleMatch',
            data: {
              match_id: match._id || match.id
            }
          }
        })
        
        if (deleteResult.result.code === 0) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          // 刷新今日比赛列表
          this.loadTodayMatches()
        } else {
          uni.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('删除失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
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

.team-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.team-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 24rpx;
  display: block;
}

.team-players {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.and-text {
  margin: 0 16rpx;
  font-size: 24rpx;
  color: #666;
}

.vs-section {
  text-align: center;
  margin: 24rpx 0;
}

.vs-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #4CAF50;
}

.score-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}

.score-item {
  flex: 1;
  text-align: center;
}

.team-name {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.score-input {
  background: #f8f8f8;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
  overflow: hidden;
}

.score-input input {
  width: 100%;
  padding: 24rpx;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  background: transparent;
  border: none;
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
  padding: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn.disabled {
  background: #ccc;
}

.today-matches {
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
  font-size: 28rpx;
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

.match-teams,
.match-score,
.match-actions {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #333;
}

.match-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.delete-btn {
  font-size: 32rpx;
  color: #ff4757;
  cursor: pointer;
  padding: 8rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: #ff475720;
}

.delete-btn:active {
  background-color: #ff475740;
}
</style>
