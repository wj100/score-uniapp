// 删除单打比赛记录
async function deleteSingleMatch(data) {
  try {
    const { matchId } = data;
    
    if (!matchId) {
      return {
        code: -1,
        message: '比赛ID不能为空'
      };
    }

    // 1. 删除比赛记录
    const matchRes = await retryDatabaseOperation(async () => {
      return await db.collection('scoring_match')
        .where({ id: matchId, match_type: 1 })
        .remove();
    });

    // 2. 删除选手比赛详情记录
    const playerMatchRes = await retryDatabaseOperation(async () => {
      return await db.collection('scoring_player_match')
        .where({ match_id: matchId, match_type: 1 })
        .remove();
    });

    console.log('删除比赛记录结果:', matchRes);
    console.log('删除选手记录结果:', playerMatchRes);

    return {
      code: 0,
      message: '删除成功',
      data: {
        deletedMatchCount: matchRes.deleted,
        deletedPlayerCount: playerMatchRes.deleted
      }
    };
  } catch (error) {
    console.error('删除单打比赛记录失败:', error);
    return {
      code: -1,
      message: '删除失败: ' + error.message,
      error: error.message
    };
  }
}

// 删除双打比赛记录
async function deleteDoubleMatch(data) {
  try {
    const { matchId } = data;
    
    if (!matchId) {
      return {
        code: -1,
        message: '比赛ID不能为空'
      };
    }

    // 1. 删除比赛记录
    const matchRes = await retryDatabaseOperation(async () => {
      return await db.collection('scoring_match')
        .where({ id: matchId, match_type: 2 })
        .remove();
    });

    // 2. 删除选手比赛详情记录
    const playerMatchRes = await retryDatabaseOperation(async () => {
      return await db.collection('scoring_player_match')
        .where({ match_id: matchId, match_type: 2 })
        .remove();
    });

    console.log('删除比赛记录结果:', matchRes);
    console.log('删除选手记录结果:', playerMatchRes);

    return {
      code: 0,
      message: '删除成功',
      data: {
        deletedMatchCount: matchRes.deleted,
        deletedPlayerCount: playerMatchRes.deleted
      }
    };
  } catch (error) {
    console.error('删除双打比赛记录失败:', error);
    return {
      code: -1,
      message: '删除失败: ' + error.message,
      error: error.message
    };
  }
}

module.exports = {
  deleteSingleMatch,
  deleteDoubleMatch
};
