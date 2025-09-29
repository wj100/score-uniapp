/**
 * 本地存储工具类
 */

// 队员数据
export const PLAYERS_KEY = 'badminton_players'
// 单打比赛记录
export const SINGLE_MATCHES_KEY = 'badminton_single_matches'
// 双打比赛记录
export const DOUBLE_MATCHES_KEY = 'badminton_double_matches'

// 获取队员列表
export function getPlayers() {
  try {
    const players = uni.getStorageSync(PLAYERS_KEY)
    return players || ['吉志', '小鲁', '建华', '汪骏', '杭宁']
  } catch (e) {
    return ['吉志', '小鲁', '建华', '汪骏', '杭宁']
  }
}

// 保存队员列表
export function savePlayers(players) {
  try {
    uni.setStorageSync(PLAYERS_KEY, players)
  } catch (e) {
    console.error('保存队员失败:', e)
  }
}

// 获取单打比赛记录
export function getSingleMatches() {
  try {
    const matches = uni.getStorageSync(SINGLE_MATCHES_KEY)
    return matches || []
  } catch (e) {
    return []
  }
}

// 保存单打比赛记录
export function saveSingleMatch(match) {
  try {
    const matches = getSingleMatches()
    const newMatch = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      player1: match.player1,
      player2: match.player2,
      score1: match.score1,
      score2: match.score2,
      winner: match.score1 > match.score2 ? match.player1 : match.player2,
      timestamp: Date.now()
    }
    matches.unshift(newMatch)
    uni.setStorageSync(SINGLE_MATCHES_KEY, matches)
    return newMatch
  } catch (e) {
    console.error('保存单打比赛记录失败:', e)
    return null
  }
}

// 获取双打比赛记录
export function getDoubleMatches() {
  try {
    const matches = uni.getStorageSync(DOUBLE_MATCHES_KEY)
    return matches || []
  } catch (e) {
    return []
  }
}

// 保存双打比赛记录
export function saveDoubleMatch(match) {
  try {
    const matches = getDoubleMatches()
    const newMatch = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      winner: match.scoreA > match.scoreB ? 'A' : 'B',
      timestamp: Date.now()
    }
    matches.unshift(newMatch)
    uni.setStorageSync(DOUBLE_MATCHES_KEY, matches)
    return newMatch
  } catch (e) {
    console.error('保存双打比赛记录失败:', e)
    return null
  }
}

// 获取单打统计数据
export function getSingleStats(timeRange = 'all') {
  const matches = getSingleMatches()
  const players = getPlayers()
  const now = new Date()
  let filteredMatches = matches
  
  // 根据时间范围过滤
  if (timeRange !== 'all') {
    const startDate = new Date()
    switch(timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'thisMonth':
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'lastMonth':
        startDate.setMonth(startDate.getMonth() - 1)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
        endDate.setHours(23, 59, 59, 999)
        filteredMatches = matches.filter(match => {
          const matchDate = new Date(match.date)
          return matchDate >= startDate && matchDate <= endDate
        })
        break
    }
    
    if (timeRange !== 'lastMonth') {
      filteredMatches = matches.filter(match => {
        const matchDate = new Date(match.date)
        return matchDate >= startDate
      })
    }
  }
  
  const stats = {}
  
  players.forEach(player => {
    stats[player] = {
      totalScore: 0,
      wins: 0,
      losses: 0,
      totalMatches: 0
    }
  })
  
  filteredMatches.forEach(match => {
    if (stats[match.player1]) {
      stats[match.player1].totalScore += match.score1
      stats[match.player1].totalMatches++
      if (match.winner === match.player1) {
        stats[match.player1].wins++
      } else {
        stats[match.player1].losses++
      }
    }
    
    if (stats[match.player2]) {
      stats[match.player2].totalScore += match.score2
      stats[match.player2].totalMatches++
      if (match.winner === match.player2) {
        stats[match.player2].wins++
      } else {
        stats[match.player2].losses++
      }
    }
  })
  
  return {
    stats,
    matches: filteredMatches
  }
}
