"use strict";
const utils_storage = require("../../utils/storage.js");
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      currentTimeRange: "thisMonth",
      timeOptions: [
        { label: "历史所有", value: "all" },
        { label: "上月", value: "lastMonth" },
        { label: "昨日", value: "yesterday" },
        { label: "今日", value: "today" },
        { label: "当月", value: "thisMonth" }
      ],
      statsData: {},
      currentMatches: [],
      sortField: "totalScore",
      sortOrder: "desc"
    };
  },
  computed: {
    dateRangeText() {
      const now = /* @__PURE__ */ new Date();
      switch (this.currentTimeRange) {
        case "today":
          return now.toISOString().split("T")[0];
        case "yesterday":
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday.toISOString().split("T")[0];
        case "thisMonth":
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
          return `${year}-${month}-01 至 ${year}-${month}-${String(lastDay).padStart(2, "0")}`;
        case "lastMonth":
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          return `${lastMonth.toISOString().split("T")[0]} 至 ${lastMonthEnd.toISOString().split("T")[0]}`;
        case "all":
        default:
          return "全部时间";
      }
    },
    sortedStats() {
      const stats = [];
      Object.keys(this.statsData).forEach((playerName) => {
        const playerStats = this.statsData[playerName];
        const winRate = playerStats.totalMatches > 0 ? Math.round(playerStats.wins / playerStats.totalMatches * 100) + "%" : "0%";
        stats.push({
          name: playerName,
          totalScore: playerStats.totalScore,
          wins: playerStats.wins,
          losses: playerStats.losses,
          totalMatches: playerStats.totalMatches,
          winRate
        });
      });
      return stats.sort((a, b) => {
        if (this.sortField === "totalScore") {
          return this.sortOrder === "desc" ? b.totalScore - a.totalScore : a.totalScore - b.totalScore;
        }
        return 0;
      });
    }
  },
  onLoad() {
    this.loadData();
  },
  onShow() {
    this.loadData();
  },
  methods: {
    loadData() {
      const result = this.getDoubleStats(this.currentTimeRange);
      this.statsData = result.stats;
      this.currentMatches = result.matches;
    },
    getDoubleStats(timeRange = "all") {
      const matches = utils_storage.getDoubleMatches();
      const players = utils_storage.getPlayers();
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
        match.teamA.forEach((player) => {
          if (stats[player]) {
            stats[player].totalScore += match.scoreA;
            stats[player].totalMatches++;
            if (match.winner === "A") {
              stats[player].wins++;
            } else {
              stats[player].losses++;
            }
          }
        });
        match.teamB.forEach((player) => {
          if (stats[player]) {
            stats[player].totalScore += match.scoreB;
            stats[player].totalMatches++;
            if (match.winner === "B") {
              stats[player].wins++;
            } else {
              stats[player].losses++;
            }
          }
        });
      });
      return {
        stats,
        matches: filteredMatches
      };
    },
    changeTimeRange(range) {
      this.currentTimeRange = range;
      this.loadData();
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}-${day}`;
    },
    formatTeams(match) {
      const teamAStr = match.teamA.join("&");
      const teamBStr = match.teamB.join("&");
      return `${teamAStr} vs ${teamBStr}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.timeOptions, (item, index, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: index,
        c: $data.currentTimeRange === item.value ? 1 : "",
        d: common_vendor.o(($event) => $options.changeTimeRange(item.value), index)
      };
    }),
    b: common_vendor.t($options.dateRangeText),
    c: common_vendor.f($options.sortedStats, (player, k0, i0) => {
      return {
        a: common_vendor.t(player.name),
        b: common_vendor.t(player.totalScore),
        c: common_vendor.t(player.wins),
        d: common_vendor.t(player.losses),
        e: common_vendor.t(player.winRate),
        f: player.name
      };
    }),
    d: $data.currentMatches.length === 0
  }, $data.currentMatches.length === 0 ? {} : {
    e: common_vendor.f($data.currentMatches, (match, k0, i0) => {
      return {
        a: common_vendor.t($options.formatDate(match.date)),
        b: common_vendor.t($options.formatTeams(match)),
        c: common_vendor.t(match.scoreA),
        d: common_vendor.t(match.scoreB),
        e: match.id
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5e0101b7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/double-stats/double-stats.js.map
