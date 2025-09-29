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
      const result = utils_storage.getSingleStats(this.currentTimeRange);
      this.statsData = result.stats;
      this.currentMatches = result.matches;
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
        b: common_vendor.t(match.player1),
        c: common_vendor.t(match.player2),
        d: common_vendor.t(match.score1),
        e: common_vendor.t(match.score2),
        f: match.id
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-54d5c735"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/single-stats/single-stats.js.map
