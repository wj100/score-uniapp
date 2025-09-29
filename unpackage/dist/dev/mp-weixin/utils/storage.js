"use strict";
const common_vendor = require("../common/vendor.js");
async function getPlayers() {
  const maxRetries = 3;
  let lastError = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      common_vendor.index.__f__("log", "at utils/storage.js:36", `调用云函数获取队员列表... (第${i + 1}次尝试)`);
      const result = await common_vendor.tr.callFunction({
        name: "badminton-api",
        data: {
          action: "getPlayers"
        }
      });
      common_vendor.index.__f__("log", "at utils/storage.js:44", "云函数返回结果:", result);
      if (result.result.code === 0) {
        const players = result.result.data.map((player) => player.name);
        common_vendor.index.__f__("log", "at utils/storage.js:48", "解析后的队员列表:", players);
        return players;
      } else {
        common_vendor.index.__f__("error", "at utils/storage.js:51", "获取队员列表失败:", result.result.message);
        lastError = new Error(result.result.message);
        if (result.result.message && result.result.message.includes("资源耗尽")) {
          if (i < maxRetries - 1) {
            common_vendor.index.__f__("log", "at utils/storage.js:57", `数据库资源耗尽，等待 ${(i + 1) * 2} 秒后重试...`);
            await new Promise((resolve) => setTimeout(resolve, (i + 1) * 2e3));
            continue;
          }
        }
        return getFallbackPlayers();
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:67", `获取队员列表异常 (第${i + 1}次尝试):`, error);
      lastError = error;
      if (i < maxRetries - 1) {
        common_vendor.index.__f__("log", "at utils/storage.js:71", `等待 ${(i + 1) * 2} 秒后重试...`);
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 2e3));
      }
    }
  }
  common_vendor.index.__f__("error", "at utils/storage.js:78", "所有重试都失败，使用降级数据");
  common_vendor.index.showToast({
    title: "网络异常，使用离线数据",
    icon: "none",
    duration: 3e3
  });
  return getFallbackPlayers();
}
function getFallbackPlayers() {
  return ["吉志", "小鲁", "建华", "汪骏", "杭宁"];
}
async function initPlayers() {
  const maxRetries = 2;
  for (let i = 0; i < maxRetries; i++) {
    try {
      common_vendor.index.__f__("log", "at utils/storage.js:98", `初始化队员... (第${i + 1}次尝试)`);
      const result = await common_vendor.tr.callFunction({
        name: "badminton-api",
        data: {
          action: "initPlayers"
        }
      });
      common_vendor.index.__f__("log", "at utils/storage.js:106", "初始化队员结果:", result);
      if (result.result.code === 0) {
        return true;
      } else {
        common_vendor.index.__f__("error", "at utils/storage.js:111", "初始化队员失败:", result.result.message);
        if (result.result.message && result.result.message.includes("资源耗尽")) {
          if (i < maxRetries - 1) {
            common_vendor.index.__f__("log", "at utils/storage.js:116", `数据库资源耗尽，等待 ${(i + 1) * 3} 秒后重试...`);
            await new Promise((resolve) => setTimeout(resolve, (i + 1) * 3e3));
            continue;
          }
        }
        return false;
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:125", `初始化队员异常 (第${i + 1}次尝试):`, error);
      if (i < maxRetries - 1) {
        common_vendor.index.__f__("log", "at utils/storage.js:128", `等待 ${(i + 1) * 3} 秒后重试...`);
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 3e3));
      }
    }
  }
  common_vendor.index.__f__("error", "at utils/storage.js:134", "初始化队员失败，所有重试都失败");
  return false;
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
      common_vendor.index.__f__("error", "at utils/storage.js:170", "获取单打比赛记录失败:", result.result.message);
      return [];
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:174", "获取单打比赛记录异常:", error);
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
      common_vendor.index.__f__("error", "at utils/storage.js:193", "保存单打比赛记录失败:", result.result.message);
      return null;
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:197", "保存单打比赛记录异常:", error);
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
      common_vendor.index.__f__("error", "at utils/storage.js:216", "获取双打比赛记录失败:", result.result.message);
      return [];
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:220", "获取双打比赛记录异常:", error);
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
      common_vendor.index.__f__("error", "at utils/storage.js:239", "保存双打比赛记录失败:", result.result.message);
      return null;
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:243", "保存双打比赛记录异常:", error);
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
      common_vendor.index.__f__("error", "at utils/storage.js:262", "获取单打统计数据失败:", result.result.message);
      return { stats: {}, matches: [] };
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:266", "获取单打统计数据异常:", error);
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
      common_vendor.index.__f__("error", "at utils/storage.js:285", "获取双打统计数据失败:", result.result.message);
      return { stats: {}, matches: [] };
    }
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/storage.js:289", "获取双打统计数据异常:", error);
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
