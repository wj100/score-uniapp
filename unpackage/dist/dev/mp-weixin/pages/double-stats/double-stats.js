"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
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
  onLoad() {
    this.loadData();
  },
  onShow() {
    this.loadData();
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
        const winRate = playerStats.totalMatches > 0 ? (playerStats.wins / playerStats.totalMatches * 100).toFixed(1) + "%" : "0.0%";
        const avgScore = playerStats.totalMatches > 0 ? (playerStats.totalScore / playerStats.totalMatches).toFixed(1) : "0.0";
        stats.push({
          name: playerName,
          totalScore: playerStats.totalScore,
          wins: playerStats.wins,
          losses: playerStats.losses,
          totalMatches: playerStats.totalMatches,
          winRate,
          avgScore
        });
      });
      return stats.sort((a, b) => {
        let aVal = a[this.sortField];
        let bVal = b[this.sortField];
        if (this.sortField === "winRate") {
          aVal = parseFloat(aVal.replace("%", ""));
          bVal = parseFloat(bVal.replace("%", ""));
        } else if (typeof aVal === "string" && !isNaN(parseFloat(aVal))) {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        } else if (typeof aVal === "string") {
          return this.sortOrder === "desc" ? bVal.localeCompare(aVal, "zh-CN") : aVal.localeCompare(bVal, "zh-CN");
        }
        return this.sortOrder === "desc" ? bVal - aVal : aVal - bVal;
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
    async loadData() {
      try {
        const result = await utils_storage.getDoubleStats(this.currentTimeRange);
        this.statsData = result.stats;
        this.currentMatches = result.matches;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/double-stats/double-stats.vue:209", "加载数据失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "error"
        });
      }
    },
    changeTimeRange(range) {
      this.currentTimeRange = range;
      this.loadData();
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === "desc" ? "asc" : "desc";
      } else {
        this.sortField = field;
        this.sortOrder = "desc";
      }
    },
    getSortIcon(field) {
      if (this.sortField !== field) {
        return "↕";
      }
      return this.sortOrder === "desc" ? "↓" : "↑";
    },
    formatDate(dateValue) {
      let date;
      if (typeof dateValue === "number") {
        date = new Date(dateValue * 1e3);
      } else if (typeof dateValue === "string") {
        date = new Date(dateValue);
      } else {
        return "--";
      }
      if (isNaN(date.getTime())) {
        return "--";
      }
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
    c: common_vendor.t($options.getSortIcon("name")),
    d: common_vendor.o(($event) => $options.sortBy("name")),
    e: common_vendor.t($options.getSortIcon("totalScore")),
    f: common_vendor.o(($event) => $options.sortBy("totalScore")),
    g: common_vendor.t($options.getSortIcon("wins")),
    h: common_vendor.o(($event) => $options.sortBy("wins")),
    i: common_vendor.t($options.getSortIcon("totalMatches")),
    j: common_vendor.o(($event) => $options.sortBy("totalMatches")),
    k: common_vendor.t($options.getSortIcon("winRate")),
    l: common_vendor.o(($event) => $options.sortBy("winRate")),
    m: common_vendor.t($options.getSortIcon("avgScore")),
    n: common_vendor.o(($event) => $options.sortBy("avgScore")),
    o: common_vendor.f($options.sortedStats, (player, k0, i0) => {
      return {
        a: common_vendor.t(player.name),
        b: common_vendor.t(player.totalScore),
        c: common_vendor.t(player.wins),
        d: common_vendor.t(player.totalMatches),
        e: common_vendor.t(player.winRate),
        f: common_vendor.t(player.avgScore),
        g: player.name
      };
    }),
    p: $data.currentMatches.length === 0
  }, $data.currentMatches.length === 0 ? {} : {
    q: common_vendor.f($data.currentMatches, (match, k0, i0) => {
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
