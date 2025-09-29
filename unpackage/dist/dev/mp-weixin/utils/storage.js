"use strict";
const common_vendor = require("../common/vendor.js");
async function getPlayers() {
  try {
    common_vendor.index.__f__("log", "at utils/storage.js:32", "调用云函数获取队员列表...");
    const result = await common_vendor.tr.callFunction({
      name: "badminton-api",
      data: {
        action: "getPlayers"
      }
    });
    common_vendor.index.__f__("log", "at utils/storage.js:40", "云函数返回结果:", result);
    if (result.result.code === 0) {
      const players = result.result.data.map((player) => player.name);
      common_vendor.index.__f__("log", "at utils/storage.js:44", "解析后的队员列表:", players);
      return players;
    } else {
      common_vendor.index.__f__("error", "at utils/storage.js:47", "获取队员列表失败:", result.result.message);
      return [];
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:52", "获取队员列表异常:", error);
    return [];
  }
}
async function initPlayers() {
  try {
    const result = await common_vendor.tr.callFunction({
      name: "badminton-api",
      data: {
        action: "initPlayers"
      }
    });
    return result.result.code === 0;
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:70", "初始化队员失败:", error);
    return false;
  }
}
async function getSingleMatches(timeRange = "all") {
  try {
    const result = await common_vendor.tr.callFunction({
      name: "badminton-api",
      data: {
        action: "getSingleMatches",
        data: { timeRange }
      }
    });
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      common_vendor.index.__f__("error", "at utils/storage.js:107", "获取单打比赛记录失败:", result.result.message);
      return [];
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:111", "获取单打比赛记录异常:", error);
    return [];
  }
}
async function saveSingleMatch(match) {
  try {
    const result = await common_vendor.tr.callFunction({
      name: "badminton-api",
      data: {
        action: "submitSingleMatch",
        data: match
      }
    });
    if (result.result.code === 0) {
      return { id: result.result.data.match_id, ...match };
    } else {
      common_vendor.index.__f__("error", "at utils/storage.js:130", "保存单打比赛记录失败:", result.result.message);
      return null;
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:134", "保存单打比赛记录异常:", error);
    return null;
  }
}
async function getDoubleMatches(timeRange = "all") {
  try {
    const result = await common_vendor.tr.callFunction({
      name: "badminton-api",
      data: {
        action: "getDoubleMatches",
        data: { timeRange }
      }
    });
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      common_vendor.index.__f__("error", "at utils/storage.js:153", "获取双打比赛记录失败:", result.result.message);
      return [];
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:157", "获取双打比赛记录异常:", error);
    return [];
  }
}
async function saveDoubleMatch(match) {
  try {
    const result = await common_vendor.tr.callFunction({
      name: "badminton-api",
      data: {
        action: "submitDoubleMatch",
        data: match
      }
    });
    if (result.result.code === 0) {
      return { id: result.result.data.match_id, ...match };
    } else {
      common_vendor.index.__f__("error", "at utils/storage.js:176", "保存双打比赛记录失败:", result.result.message);
      return null;
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:180", "保存双打比赛记录异常:", error);
    return null;
  }
}
async function getSingleStats(timeRange = "all") {
  try {
    const result = await common_vendor.tr.callFunction({
      name: "badminton-api",
      data: {
        action: "getSingleStats",
        data: { timeRange }
      }
    });
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      common_vendor.index.__f__("error", "at utils/storage.js:199", "获取单打统计数据失败:", result.result.message);
      return { stats: {}, matches: [] };
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:203", "获取单打统计数据异常:", error);
    return { stats: {}, matches: [] };
  }
}
async function getDoubleStats(timeRange = "all") {
  try {
    const result = await common_vendor.tr.callFunction({
      name: "badminton-api",
      data: {
        action: "getDoubleStats",
        data: { timeRange }
      }
    });
    if (result.result.code === 0) {
      return result.result.data;
    } else {
      common_vendor.index.__f__("error", "at utils/storage.js:222", "获取双打统计数据失败:", result.result.message);
      return { stats: {}, matches: [] };
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:226", "获取双打统计数据异常:", error);
    return { stats: {}, matches: [] };
  }
}
exports.getDoubleMatches = getDoubleMatches;
exports.getDoubleStats = getDoubleStats;
exports.getPlayers = getPlayers;
exports.getSingleMatches = getSingleMatches;
exports.getSingleStats = getSingleStats;
exports.initPlayers = initPlayers;
exports.saveDoubleMatch = saveDoubleMatch;
exports.saveSingleMatch = saveSingleMatch;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/storage.js.map
