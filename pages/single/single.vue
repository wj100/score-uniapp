<template>
  <view class="container">
    <!-- 队员选择 -->
    <view class="section">
      <text class="section-title">队员</text>
      <view class="player-selection">
        <view class="player-item">
          <picker :value="selectedPlayer1Index" :range="availablePlayers1" @change="onPlayer1Change">
            <view class="picker">
              <text>{{ player1 || '选择队员1' }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
        
        <view class="vs-text">vs</view>
        
        <view class="player-item">
          <picker :value="selectedPlayer2Index" :range="availablePlayers2" @change="onPlayer2Change">
            <view class="picker">
              <text>{{ player2 || '选择队员2' }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 比分输入 -->
    <view class="section">
      <text class="section-title">比分</text>
      <view class="score-section">
        <view class="score-item">
          <text class="player-name">{{ player1 || '队员1' }}</text>
          <view class="score-input">
            <input 
              type="number" 
              v-model="score1" 
              placeholder="0"
              @input="onScore1Input"
            />
          </view>
        </view>
        
        <view class="vs-text">vs</view>
        
        <view class="score-item">
          <text class="player-name">{{ player2 || '队员2' }}</text>
          <view class="score-input">
            <input 
              type="number" 
              v-model="score2" 
              placeholder="0"
              @input="onScore2Input"
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
        提交比分
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
            <text class="match-players">{{ match.player1 }}-{{ match.player2 }}</text>
            <text class="match-score">{{ match.score1 }} - {{ match.score2 }}</text>
            <text class="match-action">🟢</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 弹窗 -->
    <view v-if="showPlayerModal" class="modal-overlay" @click="closePlayerModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择队员</text>
        </view>
        <view class="modal-body">
          <view 
            v-for="(player, index) in modalPlayerList" 
            :key="index"
            class="player-option"
            @click="selectPlayer(player)"
          >
            <text>{{ player }}</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn" @click="closePlayerModal">取消</button>
          <button class="modal-btn confirm" @click="confirmPlayer">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPlayers, saveSingleMatch, getSingleMatches, initPlayers } from '@/utils/storage.js'

export default {
  data() {
    return {
      players: [],
      player1: '',
      player2: '',
      score1: '',
      score2: '',
      selectedPlayer1Index: -1,
      selectedPlayer2Index: -1,
      todayMatches: [],
      showPlayerModal: false,
      modalPlayerList: [],
      selectingPlayer: '', // 'player1' or 'player2'
      selectedModalPlayer: ''
    }
  },
  
  computed: {
    availablePlayers1() {
      return this.players.filter(player => player !== this.player2)
    },
    
    availablePlayers2() {
      return this.players.filter(player => player !== this.player1)
    },
    
    canSubmit() {
      return this.player1 && 
             this.player2 && 
             this.player1 !== this.player2 &&
             this.score1 !== '' && 
             this.score2 !== '' &&
             (parseInt(this.score1) > 0 || parseInt(this.score2) > 0)
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
        this.players = ['吉志', '小鲁', '建华', '汪骏', '杭宁']
        uni.showToast({
          title: '加载失败，使用默认数据',
          icon: 'none'
        })
      }
    },
    
    async loadTodayMatches() {
      const allMatches = await getSingleMatches('today')
      this.todayMatches = allMatches
    },
    
    onPlayer1Change(e) {
      this.selectedPlayer1Index = e.detail.value
      this.player1 = this.availablePlayers1[e.detail.value]
      this.adjustPlayer2Index()
    },
    
    onPlayer2Change(e) {
      this.selectedPlayer2Index = e.detail.value
      this.player2 = this.availablePlayers2[e.detail.value]
      this.adjustPlayer1Index()
    },
    
    adjustPlayer1Index() {
      if (this.player1) {
        this.selectedPlayer1Index = this.availablePlayers1.indexOf(this.player1)
      }
    },
    
    adjustPlayer2Index() {
      if (this.player2) {
        this.selectedPlayer2Index = this.availablePlayers2.indexOf(this.player2)
      }
    },
    
    onScore1Input(e) {
      this.score1 = e.detail.value
    },
    
    onScore2Input(e) {
      this.score2 = e.detail.value
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
          player1: this.player1,
          player2: this.player2,
          score1: parseInt(this.score1),
          score2: parseInt(this.score2)
        }
        
        const result = await saveSingleMatch(match)
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
      this.player1 = ''
      this.player2 = ''
      this.score1 = ''
      this.score2 = ''
      this.selectedPlayer1Index = -1
      this.selectedPlayer2Index = -1
    },
    
    showPlayerSelector(playerType) {
      this.selectingPlayer = playerType
      this.modalPlayerList = playerType === 'player1' ? this.availablePlayers1 : this.availablePlayers2
      this.showPlayerModal = true
    },
    
    selectPlayer(player) {
      this.selectedModalPlayer = player
    },
    
    confirmPlayer() {
      if (this.selectedModalPlayer) {
        if (this.selectingPlayer === 'player1') {
          this.player1 = this.selectedModalPlayer
          this.adjustPlayer1Index()
        } else {
          this.player2 = this.selectedModalPlayer
          this.adjustPlayer2Index()
        }
      }
      this.closePlayerModal()
    },
    
    closePlayerModal() {
      this.showPlayerModal = false
      this.selectedModalPlayer = ''
      this.selectingPlayer = ''
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

.player-name {
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
  padding: 32rpx;
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

.match-players,
.match-score,
.match-action {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  margin: 32rpx;
  border-radius: 16rpx;
  overflow: hidden;
  max-height: 80vh;
}

.modal-header {
  padding: 32rpx;
  background: #f8f8f8;
  border-bottom: 2rpx solid #e0e0e0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
}

.modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.player-option {
  padding: 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.player-option:last-child {
  border-bottom: none;
}

.player-option:active {
  background: #f0f0f0;
}

.modal-footer {
  display: flex;
  border-top: 2rpx solid #e0e0e0;
}

.modal-btn {
  flex: 1;
  padding: 32rpx;
  border: none;
  background: white;
  font-size: 28rpx;
}

.modal-btn.confirm {
  background: #4CAF50;
  color: white;
}
</style>
