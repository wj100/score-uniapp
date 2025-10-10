'use strict';

const db = uniCloud.database();

// 数据库操作重试函数
async function retryDatabaseOperation(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`数据库操作失败，第 ${i + 1} 次重试:`, error);
      
      // 检查是否是资源耗尽错误
      if (error.message && error.message.includes('resource exhausted')) {
        if (i === maxRetries - 1) {
          throw new Error('数据库资源耗尽，请稍后重试');
        }
        // 等待更长时间后重试
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1) * 2));
      } else {
        throw error;
      }
    }
  }
}


exports.main = async (event, context) => {
  console.log('云函数收到请求:', event);
  const { action, data } = event;
  
  try {
    switch (action) {
      // 队员相关
      case 'getPlayers':
        console.log('执行getPlayers');
        return await getPlayers();
      case 'addPlayer':
        console.log('执行addPlayer', data);
        return await addPlayer(data);
      case 'initPlayers':
        console.log('执行initPlayers');
        return await initPlayers();
      
      // 单打比赛相关
      case 'submitSingleMatch':
        console.log('执行submitSingleMatch', data);
        return await submitSingleMatch(data);
      case 'getSingleMatches':
        console.log('执行getSingleMatches', data);
        return await getSingleMatches(data);
      case 'getSingleStats':
        console.log('执行getSingleStats', data);
        return await getSingleStats(data);
      
      // 双打比赛相关
      case 'submitDoubleMatch':
        console.log('执行submitDoubleMatch', data);
        return await submitDoubleMatch(data);
      case 'getDoubleMatches':
        console.log('执行getDoubleMatches', data);
        return await getDoubleMatches(data);
      case 'getDoubleStats':
        console.log('执行getDoubleStats', data);
        return await getDoubleStats(data);
      
      // 删除比赛记录
      case 'deleteSingleMatch':
        console.log('执行deleteSingleMatch', data);
        return await deleteSingleMatch(data);
      case 'deleteDoubleMatch':
        console.log('执行deleteDoubleMatch', data);
        return await deleteDoubleMatch(data);
      
      default:
        console.log('未知操作:', action);
        return {
          code: -1,
          message: '未知操作: ' + action
        };
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      code: -1,
      message: '服务器错误',
      error: error.message
    };
  }
};

// 获取队员列表
async function getPlayers() {
  try {
    console.log('开始获取队员列表...');
    const res = await retryDatabaseOperation(async () => {
      return await db.collection('players')
        .where({status: 1})
        .orderBy('create_time', 'desc')
        .get();
    });
    console.log('数据库查询结果:', res);
    
    return {
      code: 0,
      message: '获取成功',
      data: res.data
    };
  } catch (error) {
    console.error('获取队员列表失败:', error);
    return {
      code: -1,
      message: '获取失败: ' + error.message,
      error: error.message
    };
  }
}

// 添加队员
async function addPlayer(data) {
  try {
    const { name, avatar } = data;
    
    if (!name) {
      return {
        code: -1,
        message: '队员姓名不能为空'
      };
    }

    // 检查是否已存在
    const existRes = await retryDatabaseOperation(async () => {
      return await db.collection('players')
        .where({name: name, status: 1})
        .get();
    });
    
    if (existRes.data.length > 0) {
      return {
        code: -1,
        message: '队员已存在'
      };
    }

    const res = await retryDatabaseOperation(async () => {
      return await db.collection('players').add({
        name,
        avatar: avatar || '',
        status: 1,
        create_time: new Date()
      });
    });

    return {
      code: 0,
      message: '添加成功',
      data: { _id: res.id }
    };
  } catch (error) {
    return {
      code: -1,
      message: '添加失败',
      error: error.message
    };
  }
}

// 初始化默认队员
async function initPlayers() {
  try {
    const defaultPlayers = ['言志', '小鲁', '建华', '汪骏', '杭宁'];
    
    // 检查是否已经初始化过
    const existingPlayers = await retryDatabaseOperation(async () => {
      return await db.collection('players')
        .where({status: 1})
        .get();
    });
    
    if (existingPlayers.data.length > 0) {
      return {
        code: 0,
        message: '已经初始化过了',
        data: existingPlayers.data
      };
    }

    // 批量添加默认队员
    const addPromises = defaultPlayers.map(name => {
      return retryDatabaseOperation(async () => {
        return await db.collection('players').add({
          name,
          avatar: '',
          status: 1,
          create_time: new Date()
        });
      });
    });

    await Promise.all(addPromises);

    return {
      code: 0,
      message: '初始化成功'
    };
  } catch (error) {
    return {
      code: -1,
      message: '初始化失败',
      error: error.message
    };
  }
}

// 提交单打比赛
async function submitSingleMatch(data) {
  try {
    const { player1, player2, score1, score2, match_name } = data;
    
    if (!player1 || !player2 || score1 === undefined || score2 === undefined) {
      return {
        code: -1,
        message: '参数不完整'
      };
    }

    if (player1 === player2) {
      return {
        code: -1,
        message: '不能选择相同的队员'
      };
    }

    const matchTime = Math.floor(Date.now() / 1000); // 时间戳（秒）
    const player1Score = parseInt(score1);
    const player2Score = parseInt(score2);

    // 1. 先插入比赛记录
    const matchRes = await retryDatabaseOperation(async () => {
      return await db.collection('scoring_match').add({
        time: matchTime,
        match_type: 1, // 单打
        player1: player1,
        player2: player2,
        score1: player1Score,
        score2: player2Score,
        match_name: match_name || ''
      });
    });

    const matchId = matchRes.id;

    // 2. 插入选手比赛详情记录
    const playerMatches = [
      {
        match_id: matchId,
        time: matchTime,
        match_type: 1,
        player: player1,
        score: player1Score,
        result: player1Score > player2Score ? 1 : 0
      },
      {
        match_id: matchId,
        time: matchTime,
        match_type: 1,
        player: player2,
        score: player2Score,
        result: player2Score > player1Score ? 1 : 0
      }
    ];

    await retryDatabaseOperation(async () => {
      return await db.collection('scoring_player_match').add(playerMatches);
    });

    return {
      code: 0,
      message: '提交成功',
      data: { match_id: matchId }
    };
  } catch (error) {
    return {
      code: -1,
      message: '提交失败',
      error: error.message
    };
  }
}

// 获取单打比赛记录
async function getSingleMatches(data) {
  try {
    const { timeRange = 'all', limit = 50 } = data || {};
    
    let whereCondition = { match_type: 1 }; // 单打
    
    if (timeRange !== 'all') {
      const now = new Date();
      let startTimestamp, endTimestamp;
      
      switch (timeRange) {
        case 'today':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000);
          break;
        case 'yesterday':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
          break;
        case 'thisMonth':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() / 1000);
          break;
        case 'lastMonth':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
          break;
      }
      
      if (startTimestamp && endTimestamp) {
        whereCondition.time = db.command.gte(startTimestamp).and(db.command.lt(endTimestamp));
      }
    }

    const res = await retryDatabaseOperation(async () => {
      return await db.collection('scoring_match')
        .where(whereCondition)
        .orderBy('time', 'desc')
        .limit(parseInt(limit))
        .get();
    });

    // 转换数据格式以保持兼容性
    const formattedData = res.data.map(match => ({
      _id: match._id,
      id: match.id,
      time: match.time,
      match_type: match.match_type,
      player1: match.player1,
      player2: match.player2,
      score1: match.score1,
      score2: match.score2,
      winner: match.score1 > match.score2 ? match.player1 : match.player2,
      date: new Date(match.time * 1000).toISOString().split('T')[0], // 时间戳转日期字符串
      match_name: match.match_name
    }));

    return {
      code: 0,
      message: '获取成功',
      data: formattedData
    };
  } catch (error) {
    return {
      code: -1,
      message: '获取失败',
      error: error.message
    };
  }
}

// 获取单打统计数据
async function getSingleStats(data) {
  try {
    const { timeRange = 'all' } = data || {};
    
    // 构建时间查询条件
    let whereCondition = { match_type: 1 }; // 单打
    
    if (timeRange !== 'all') {
      const now = new Date();
      let startTimestamp, endTimestamp;
      
      switch (timeRange) {
        case 'today':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000);
          break;
        case 'yesterday':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
          break;
        case 'thisMonth':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() / 1000);
          break;
        case 'lastMonth':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
          break;
      }
      
      if (startTimestamp && endTimestamp) {
        whereCondition.time = db.command.gte(startTimestamp).and(db.command.lt(endTimestamp));
      }
    }

    // 从选手比赛详情表获取统计数据
    const playerMatchesRes = await db.collection('scoring_player_match')
      .where(whereCondition).limit(10000)
      .get();

    const stats = {};
    
    // 获取队员列表
    const playersRes = await db.collection('players')
      .where({status: 1})
      .get();
    
    // 初始化统计数据
    playersRes.data.forEach(player => {
      stats[player.name] = {
        totalScore: 0,
        wins: 0,
        losses: 0,
        totalMatches: 0
      };
    });

    // 计算统计数据
    playerMatchesRes.data.forEach(playerMatch => {
      const player = playerMatch.player;
      if (stats[player]) {
        stats[player].totalScore += playerMatch.score;
        stats[player].totalMatches++;
        if (playerMatch.result === 1) {
          stats[player].wins++;
        } else {
          stats[player].losses++;
        }
      }
    });

    // 获取比赛记录用于显示
    const matchesResult = await getSingleMatches({ timeRange, limit: 10000 });
    const matches = matchesResult.code === 0 ? matchesResult.data : [];

    return {
      code: 0,
      message: '获取成功',
      data: {
        stats,
        matches
      }
    };
  } catch (error) {
    return {
      code: -1,
      message: '获取失败',
      error: error.message
    };
  }
}

// 提交双打比赛
async function submitDoubleMatch(data) {
  try {
    const { teamA, teamB, scoreA, scoreB, match_name } = data;
    
    if (!teamA || !teamB || !Array.isArray(teamA) || !Array.isArray(teamB)) {
      return {
        code: -1,
        message: '队伍参数不正确'
      };
    }

    if (teamA.length !== 2 || teamB.length !== 2) {
      return {
        code: -1,
        message: '每队必须有2名队员'
      };
    }

    if (scoreA === undefined || scoreB === undefined) {
      return {
        code: -1,
        message: '比分不能为空'
      };
    }

    // 检查是否有重复队员
    const allPlayers = [...teamA, ...teamB];
    if (new Set(allPlayers).size !== 4) {
      return {
        code: -1,
        message: '不能有重复的队员'
      };
    }

    const matchTime = Math.floor(Date.now() / 1000); // 时间戳（秒）
    const teamAScore = parseInt(scoreA);
    const teamBScore = parseInt(scoreB);
    
    // 组装队伍显示名称
    const player1 = teamA.join('&');
    const player2 = teamB.join('&');

    // 1. 先插入比赛记录
    const matchRes = await db.collection('scoring_match').add({
      time: matchTime,
      match_type: 2, // 双打
      player1: player1,
      player2: player2,
      score1: teamAScore,
      score2: teamBScore,
      match_name: match_name || ''
    });

    const matchId = matchRes.id;

    // 2. 插入选手比赛详情记录
    const playerMatches = [];
    
    // A队队员记录
    teamA.forEach(player => {
      playerMatches.push({
        match_id: matchId,
        time: matchTime,
        match_type: 2,
        player: player,
        score: teamAScore,
        result: teamAScore > teamBScore ? 1 : 0
      });
    });
    
    // B队队员记录
    teamB.forEach(player => {
      playerMatches.push({
        match_id: matchId,
        time: matchTime,
        match_type: 2,
        player: player,
        score: teamBScore,
        result: teamBScore > teamAScore ? 1 : 0
      });
    });

    await db.collection('scoring_player_match').add(playerMatches);

    return {
      code: 0,
      message: '提交成功',
      data: { match_id: matchId }
    };
  } catch (error) {
    return {
      code: -1,
      message: '提交失败',
      error: error.message
    };
  }
}

// 获取双打比赛记录
async function getDoubleMatches(data) {
  try {
    const { timeRange = 'all', limit = 50 } = data || {};
    
    let whereCondition = { match_type: 2 }; // 双打
    
    if (timeRange !== 'all') {
      const now = new Date();
      let startTimestamp, endTimestamp;
      
      switch (timeRange) {
        case 'today':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000);
          break;
        case 'yesterday':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
          break;
        case 'thisMonth':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() / 1000);
          break;
        case 'lastMonth':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
          break;
      }
      
      if (startTimestamp && endTimestamp) {
        whereCondition.time = db.command.gte(startTimestamp).and(db.command.lt(endTimestamp));
      }
    }

    const res = await retryDatabaseOperation(async () => {
      return await db.collection('scoring_match')
        .where(whereCondition)
        .orderBy('time', 'desc')
        .limit(parseInt(limit))
        .get();
    });

    // 转换数据格式以保持兼容性
    const formattedData = res.data.map(match => ({
      _id: match._id,
      id: match.id,
      time: match.time,
      match_type: match.match_type,
      teamA: match.player1.split('&'),
      teamB: match.player2.split('&'),
      scoreA: match.score1,
      scoreB: match.score2,
      winner: match.score1 > match.score2 ? 'A' : 'B',
      date: new Date(match.time * 1000).toISOString().split('T')[0], // 时间戳转日期字符串
      match_name: match.match_name
    }));

    return {
      code: 0,
      message: '获取成功',
      data: formattedData
    };
  } catch (error) {
    return {
      code: -1,
      message: '获取失败',
      error: error.message
    };
  }
}

// 获取双打统计数据
async function getDoubleStats(data) {
  try {
    const { timeRange = 'all' } = data || {};
    
    // 构建时间查询条件
    let whereCondition = { match_type: 2 }; // 双打
    
    if (timeRange !== 'all') {
      const now = new Date();
      let startTimestamp, endTimestamp;
      
      switch (timeRange) {
        case 'today':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000);
          break;
        case 'yesterday':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
          break;
        case 'thisMonth':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() / 1000);
          break;
        case 'lastMonth':
          startTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() / 1000);
          endTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
          break;
      }
      
      if (startTimestamp && endTimestamp) {
        whereCondition.time = db.command.gte(startTimestamp).and(db.command.lt(endTimestamp));
      }
    }

    // 从选手比赛详情表获取统计数据
    const playerMatchesRes = await db.collection('scoring_player_match')
      .where(whereCondition).limit(10000)
      .get();

    const stats = {};
    
    // 获取队员列表
    const playersRes = await db.collection('players')
      .where({status: 1})
      .get();
    
    // 初始化统计数据
    playersRes.data.forEach(player => {
      stats[player.name] = {
        totalScore: 0,
        wins: 0,
        losses: 0,
        totalMatches: 0
      };
    });

    // 计算统计数据
    playerMatchesRes.data.forEach(playerMatch => {
      const player = playerMatch.player;
      if (stats[player]) {
        stats[player].totalScore += playerMatch.score;
        stats[player].totalMatches++;
        if (playerMatch.result === 1) {
          stats[player].wins++;
        } else {
          stats[player].losses++;
        }
      }
    });

    // 获取比赛记录用于显示
    const matchesResult = await getDoubleMatches({ timeRange, limit: 10000 });
    const matches = matchesResult.code === 0 ? matchesResult.data : [];

    return {
      code: 0,
      message: '获取成功',
      data: {
        stats,
        matches
      }
    };
  } catch (error) {
    return {
      code: -1,
      message: '获取失败',
      error: error.message
    };
  }
}
