<template>
  <view class="custom-tabbar">
    <view 
      v-for="(item, index) in tabList" 
      :key="index"
      class="tab-item"
      :class="{ 'active': currentIndex === index }"
      @click="switchTab(index)"
    >
      <uni-icons 
        :type="currentIndex === index ? item.selectedIcon : item.icon" 
        :size="24"
        :color="currentIndex === index ? '#007AFF' : '#999999'"
      />
      <text 
        class="tab-text"
        :class="{ 'active': currentIndex === index }"
      >
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabbar',
  data() {
    return {
      currentIndex: 0,
      tabList: [
        {
          pagePath: '/pages/single/single',
          text: '单打',
          icon: 'person',
          selectedIcon: 'person-filled'
        },
        {
          pagePath: '/pages/single-stats/single-stats',
          text: '单打战绩',
          icon: 'map',
          selectedIcon: 'map'
        },
        {
          pagePath: '/pages/double/double',
          text: '双打',
          icon: 'staff',
          selectedIcon: 'staff'
        },
        {
          pagePath: '/pages/double-stats/double-stats',
          text: '双打战绩',
          icon: 'settings',
          selectedIcon: 'settings'
        }
      ]
    }
  },
  
  mounted() {
    this.setCurrentIndex()
  },
  
  // 监听页面显示，确保tab状态正确
  onShow() {
    this.setCurrentIndex()
  },
  
  methods: {
    switchTab(index) {
      if (this.currentIndex === index) return
      
      console.log('切换tab到索引:', index)
      this.currentIndex = index
      const item = this.tabList[index]
      
      uni.switchTab({
        url: item.pagePath,
        success: () => {
          console.log('页面切换成功:', item.pagePath)
          // 切换成功后再次确认状态
          this.$nextTick(() => {
            this.setCurrentIndex()
          })
        },
        fail: (err) => {
          console.error('切换页面失败:', err)
          // 如果 switchTab 失败，尝试使用 navigateTo
          uni.navigateTo({
            url: item.pagePath,
            success: () => {
              console.log('使用navigateTo切换成功:', item.pagePath)
              this.$nextTick(() => {
                this.setCurrentIndex()
              })
            }
          })
        }
      })
    },
    
    setCurrentIndex() {
      try {
        const pages = getCurrentPages()
        if (pages.length === 0) return
        
        const currentPage = pages[pages.length - 1]
        const currentRoute = '/' + currentPage.route
        
        console.log('当前页面路径:', currentRoute)
        
        const index = this.tabList.findIndex(item => item.pagePath === currentRoute)
        console.log('找到的tab索引:', index)
        
        if (index !== -1) {
          this.currentIndex = index
          console.log('设置当前tab索引为:', index)
        } else {
          console.log('未找到匹配的tab页面')
        }
      } catch (error) {
        console.error('设置当前tab索引失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #e5e5e5;
  display: flex;
  z-index: 1000;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 0;
  transition: all 0.3s ease;
}

.tab-item.active {
  background-color: rgba(0, 122, 255, 0.1);
}

.tab-text {
  font-size: 20rpx;
  color: #999999;
  margin-top: 4rpx;
  transition: color 0.3s ease;
}

.tab-text.active {
  color: #007AFF;
  font-weight: 500;
}

/* 适配安全区域 */
.custom-tabbar {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(100rpx + env(safe-area-inset-bottom));
}
</style>
