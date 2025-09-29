/**
 * uniCloud云函数存储工具类
 */

// 调用云函数的通用方法
async function callCloudFunction(action, data = {}, params = {}) {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action,
        data,
        params
      }
    })
    
    if (result.result.code === 0) {
      return result.result.data
    } else {
      console.error('云函数调用失败:', result.result.message)
      throw new Error(result.result.message)
    }
  } catch (error) {
    console.error('云函数调用异常:', error)
    throw error
  }
}

// 获取队员列表
export async function getPlayers() {
  try {
    console.log('调用云函数获取队员列表...')
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'getPlayers'
      }
    })
    
    console.log('云函数返回结果:', result)
    
    if (result.result.code === 0) {
      const players = result.result.data.map(player => player.name)
      console.log('解析后的队员列表:', players)
      return players
    } else {
      console.error('获取队员列表失败:', result.result.message)
      // 返回空数组，让调用方处理初始化
      return []
    }
  } catch (error) {
    console.error('获取队员列表异常:', error)
    // 返回空数组，让调用方处理初始化
    return []
  }
}

// 初始化默认队员
export async function initPlayers() {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'initPlayers'
      }
    })
    
    return result.result.code === 0
  } catch (error) {
    console.error('初始化队员失败:', error)
    return false
  }
}

// 添加队员
export async function addPlayer(name, avatar = '') {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'addPlayer',
        data: { name, avatar }
      }
    })
    
    return result.result.code === 0
  } catch (error) {
    console.error('添加队员失败:', error)
    return false
  }
}

// 获取单打比赛记录
export async function getSingleMatches(timeRange = 'all') {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'getSingleMatches',
        data: { timeRange }
      }
    })
    
    if (result.result.code === 0) {
      return result.result.data
    } else {
      console.error('获取单打比赛记录失败:', result.result.message)
      return []
    }
  } catch (error) {
    console.error('获取单打比赛记录异常:', error)
    return []
  }
}

// 保存单打比赛记录
export async function saveSingleMatch(match) {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'submitSingleMatch',
        data: match
      }
    })
    
    if (result.result.code === 0) {
      return { id: result.result.data.match_id, ...match }
    } else {
      console.error('保存单打比赛记录失败:', result.result.message)
      return null
    }
  } catch (error) {
    console.error('保存单打比赛记录异常:', error)
    return null
  }
}

// 获取双打比赛记录
export async function getDoubleMatches(timeRange = 'all') {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'getDoubleMatches',
        data: { timeRange }
      }
    })
    
    if (result.result.code === 0) {
      return result.result.data
    } else {
      console.error('获取双打比赛记录失败:', result.result.message)
      return []
    }
  } catch (error) {
    console.error('获取双打比赛记录异常:', error)
    return []
  }
}

// 保存双打比赛记录
export async function saveDoubleMatch(match) {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'submitDoubleMatch',
        data: match
      }
    })
    
    if (result.result.code === 0) {
      return { id: result.result.data.match_id, ...match }
    } else {
      console.error('保存双打比赛记录失败:', result.result.message)
      return null
    }
  } catch (error) {
    console.error('保存双打比赛记录异常:', error)
    return null
  }
}

// 获取单打统计数据
export async function getSingleStats(timeRange = 'all') {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'getSingleStats',
        data: { timeRange }
      }
    })
    
    if (result.result.code === 0) {
      return result.result.data
    } else {
      console.error('获取单打统计数据失败:', result.result.message)
      return { stats: {}, matches: [] }
    }
  } catch (error) {
    console.error('获取单打统计数据异常:', error)
    return { stats: {}, matches: [] }
  }
}

// 获取双打统计数据
export async function getDoubleStats(timeRange = 'all') {
  try {
    const result = await uniCloud.callFunction({
      name: 'badminton-api',
      data: {
        action: 'getDoubleStats',
        data: { timeRange }
      }
    })
    
    if (result.result.code === 0) {
      return result.result.data
    } else {
      console.error('获取双打统计数据失败:', result.result.message)
      return { stats: {}, matches: [] }
    }
  } catch (error) {
    console.error('获取双打统计数据异常:', error)
    return { stats: {}, matches: [] }
  }
}
