"use strict";
const common_vendor = require("../common/vendor.js");
const PLAYERS_KEY = "badminton_players";
const SINGLE_MATCHES_KEY = "badminton_single_matches";
const DOUBLE_MATCHES_KEY = "badminton_double_matches";
function getPlayers() {
  try {
    const players = common_vendor.index.getStorageSync(PLAYERS_KEY);
    return players || ["吉志", "小鲁", "建华", "汪骏", "杭宁"];
  } catch (e) {
    return ["吉志", "小鲁", "建华", "汪骏", "杭宁"];
  }
}
function getSingleMatches() {
  try {
    const matches = common_vendor.index.getStorageSync(SINGLE_MATCHES_KEY);
    return matches || [];
  } catch (e) {
    return [];
  }
}
function saveSingleMatch(match) {
  try {
    const matches = getSingleMatches();
    const newMatch = {
      id: Date.now(),
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      player1: match.player1,
      player2: match.player2,
      score1: match.score1,
      score2: match.score2,
      winner: match.score1 > match.score2 ? match.player1 : match.player2,
      timestamp: Date.now()
    };
    matches.unshift(newMatch);
    common_vendor.index.setStorageSync(SINGLE_MATCHES_KEY, matches);
    return newMatch;
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:59", "保存单打比赛记录失败:", e);
    return null;
  }
}
function getDoubleMatches() {
  try {
    const matches = common_vendor.index.getStorageSync(DOUBLE_MATCHES_KEY);
    return matches || [];
  } catch (e) {
    return [];
  }
}
function saveDoubleMatch(match) {
  try {
    const matches = getDoubleMatches();
    const newMatch = {
      id: Date.now(),
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      winner: match.scoreA > match.scoreB ? "A" : "B",
      timestamp: Date.now()
    };
    matches.unshift(newMatch);
    common_vendor.index.setStorageSync(DOUBLE_MATCHES_KEY, matches);
    return newMatch;
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:92", "保存双打比赛记录失败:", e);
    return null;
  }
}
function getSingleStats(timeRange = "all") {
  const matches = getSingleMatches();
  const players = getPlayers();
  let filteredMatches = matches;
  if (timeRange !== "all") {
    const startDate = /* @__PURE__ */ new Date();
    switch (timeRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "lastMonth":
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        filteredMatches = matches.filter((match) => {
          const matchDate = new Date(match.date);
          return matchDate >= startDate && matchDate <= endDate;
        });
        break;
    }
    if (timeRange !== "lastMonth") {
      filteredMatches = matches.filter((match) => {
        const matchDate = new Date(match.date);
        return matchDate >= startDate;
      });
    }
  }
  const stats = {};
  players.forEach((player) => {
    stats[player] = {
      totalScore: 0,
      wins: 0,
      losses: 0,
      totalMatches: 0
    };
  });
  filteredMatches.forEach((match) => {
    if (stats[match.player1]) {
      stats[match.player1].totalScore += match.score1;
      stats[match.player1].totalMatches++;
      if (match.winner === match.player1) {
        stats[match.player1].wins++;
      } else {
        stats[match.player1].losses++;
      }
    }
    if (stats[match.player2]) {
      stats[match.player2].totalScore += match.score2;
      stats[match.player2].totalMatches++;
      if (match.winner === match.player2) {
        stats[match.player2].wins++;
      } else {
        stats[match.player2].losses++;
      }
    }
  });
  return {
    stats,
    matches: filteredMatches
  };
}
exports.getDoubleMatches = getDoubleMatches;
exports.getPlayers = getPlayers;
exports.getSingleMatches = getSingleMatches;
exports.getSingleStats = getSingleStats;
exports.saveDoubleMatch = saveDoubleMatch;
exports.saveSingleMatch = saveSingleMatch;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/storage.js.map
